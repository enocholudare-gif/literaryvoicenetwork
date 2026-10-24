// =============================================================================
// LITERARY VOICES NETWORK (LVN) — Input Sanitization & Rate Limiting
// =============================================================================

const ALLOWED_TAGS = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
  "img",
  "figure",
  "figcaption",
  "code",
  "pre",
  "hr",
  "br",
  "span",
  "cite",
]);

export function sanitizeRichTextHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";

  let cleaned = dirtyHtml
    // Remove script, style, iframe, object, embed, form, input tags and their contents
    .replace(/<(script|style|iframe|object|embed|applet|form|input|button|textarea|meta|link)[\s\S]*?>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|applet|form|input|button|textarea|meta|link)[^>]*\/?>/gi, "")
    // Remove inline event handlers (onclick, onerror, onload, etc.)
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Neutralize javascript:, vbscript:, data:text/html protocols in href/src
    .replace(/(href|src)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*')/gi, '$1="#"');

  // Strip disallowed tags while keeping their inner text
  cleaned = cleaned.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, tagName: string, attrs: string) => {
    const lower = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) {
      return "";
    }
    if (match.startsWith("</")) {
      return `</${lower}>`;
    }
    // Keep only safe attributes
    const safeAttrs: string[] = [];
    const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(attrs)) !== null) {
      const attrName = m[1].toLowerCase();
      const attrVal = (m[2] ?? m[3] ?? "").trim();
      if (attrName === "class" || attrName === "title" || attrName === "alt") {
        safeAttrs.push(`${attrName}="${attrVal.replace(/"/g, "&quot;")}"`);
      } else if (
        (attrName === "href" || attrName === "src") &&
        (attrVal.startsWith("http://") ||
          attrVal.startsWith("https://") ||
          attrVal.startsWith("/") ||
          attrVal.startsWith("#") ||
          attrVal.startsWith("mailto:"))
      ) {
        safeAttrs.push(`${attrName}="${attrVal.replace(/"/g, "&quot;")}"`);
      }
    }
    if (lower === "a") {
      safeAttrs.push('rel="noopener noreferrer"');
    }
    const attrStr = safeAttrs.length > 0 ? " " + safeAttrs.join(" ") : "";
    const selfClosing = lower === "br" || lower === "hr" || lower === "img" ? " /" : "";
    return `<${lower}${attrStr}${selfClosing}>`;
  });

  return cleaned.trim();
}

export function estimateReadingTimeMinutes(html: string): number {
  const plainText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!plainText) return 1;
  const wordCount = plainText.split(" ").length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

export function checkRateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - bucket.count,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitsForTesting(): void {
  rateBuckets.clear();
}

