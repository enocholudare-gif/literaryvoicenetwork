import type { MetadataRoute } from "next";
import {
  listBroadcasts,
  listEvents,
  listPublicAuthors,
} from "@/lib/services/platform";
import { listPublicArticles, listPublicBooks } from "@/lib/services/publishing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://literaryvoicesnetwork.org";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/books",
    "/authors",
    "/magazine",
    "/editorial-calendar",
    "/press-releases",
    "/live",
    "/broadcasts",
    "/events",
    "/partners",
    "/about",
    "/contact",
    "/submission-guidelines",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const books = listPublicBooks({ pageSize: 100 }).items.map((b) => ({
    url: `${baseUrl}/books/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const authors = listPublicAuthors().map((a) => ({
    url: `${baseUrl}/authors/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const articles = listPublicArticles({ pageSize: 100 }).items.map((art) => ({
    url: `${baseUrl}/magazine/${art.slug}`,
    lastModified: new Date(art.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const broadcasts = listBroadcasts().map((bc) => ({
    url: `${baseUrl}/broadcasts/${bc.slug}`,
    lastModified: new Date(bc.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const events = listEvents().map((evt) => ({
    url: `${baseUrl}/events/${evt.slug}`,
    lastModified: new Date(evt.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...books,
    ...authors,
    ...articles,
    ...broadcasts,
    ...events,
  ];
}

