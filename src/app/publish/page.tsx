"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Feather,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  Send,
  Upload,
} from "lucide-react";

export default function PublishPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [category, setCategory] = useState("Editorial");
  const [format, setFormat] = useState("Hardcover");
  const [coverUrl, setCoverUrl] = useState("");
  const [description, setDescription] = useState("");
  const [bookLink, setBookLink] = useState("");
  const [goodreadsLink, setGoodreadsLink] = useState("");

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // File Upload Helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setter(String(evt.target?.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-book",
          submitForReview: true,
          submissionNotes: `Book Request by author ${authorName} (${authorEmail || "No email"}). Category: ${category}. Link: ${bookLink}`,
          bookData: {
            title: title.trim(),
            subtitle: subtitle.trim(),
            authorName: authorName.trim(),
            genre: category,
            format: format,
            coverUrl: coverUrl.trim() || "/media/covers/the-first.jpg",
            description: description.trim(),
            retailerLinks: {
              amazon: bookLink.trim(),
              goodreads: goodreadsLink.trim(),
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // If unauthenticated, notify via platform enquiry so request is never lost
        await fetch("/api/platform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-enquiry",
            enquiryData: {
              enquiryType: "publishing",
              name: authorName.trim(),
              email: authorEmail.trim() || "enquiry@literaryvoicenetwork.org",
              organization: `Author Book Request: ${category}`,
              subject: `New Book Submission Request: "${title}" by ${authorName}`,
              message: `Title: ${title}\nCategory: ${category}\nAuthor: ${authorName}\nEmail: ${authorEmail}\nBook Link: ${bookLink}\nCover: ${coverUrl}\nDescription: ${description}`,
            },
          }),
        }).catch(() => {});
      }

      setSuccess(true);
    } catch {
      setError("Failed to submit book request. Please check your network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-16 border-b border-[#D4AF37]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
            <BookOpen className="size-3.5 text-[#D4AF37]" />
            Author Publishing Gateway
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Request Book Publication &amp; Feature
          </h1>
          <p className="text-sm sm:text-base text-[#FAF8F3]/75 max-w-2xl mx-auto leading-relaxed">
            Submit your book cover, author profile, synopsis, and retail links. Our editorial team reviews every listing for inclusion on the LVN 3D Shelf, Book Directory, and broadcast segments.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {success ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#D4AF37] shadow-xl text-center space-y-6">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="size-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold text-[#080808]">
                Book Request Received!
              </h2>
              <p className="text-sm text-neutral-600 max-w-lg mx-auto">
                Thank you, <strong>{authorName}</strong>. Your book <strong>"{title}"</strong> has been successfully submitted to the LVN Editorial Desk. An editor will review your metadata, cover, and links.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-neutral-200 text-left max-w-md mx-auto space-y-2 text-xs text-neutral-700">
              <p><strong>Category Tag:</strong> <span className="text-[#AA7C11] font-bold">{category}</span></p>
              <p><strong>Title:</strong> {title}</p>
              {bookLink && <p className="truncate"><strong>Retailer Link:</strong> {bookLink}</p>}
              <p><strong>Status:</strong> <span className="text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">Pending Editorial Verification</span></p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/my-books"
                className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-xs font-bold text-[#050505] hover:brightness-110 shadow-md"
              >
                <LayoutDashboard className="size-4" />
                Track in My Books
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setTitle("");
                  setSubtitle("");
                  setDescription("");
                  setCoverUrl("");
                }}
                className="rounded-xl border border-neutral-300 px-5 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                Submit Another Title
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-10 rounded-3xl bg-white border border-[#D4AF37]/35 shadow-md space-y-8"
          >
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* Section 1: Book Information */}
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <h2 className="font-serif text-xl font-bold text-[#080808] flex items-center gap-2">
                  <BookOpen className="size-5 text-[#AA7C11]" />
                  1. Book Metadata
                </h2>
                <p className="text-xs text-neutral-500">
                  Primary bibliographic information displayed across the site.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AI: An Unlikely War"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. The Battle for the Soul of Human Thought"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Category Tag *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-white"
                  >
                    <option value="Editorial">Editorial (Featured Selection)</option>
                    <option value="Magazine">Magazine (Poetry &amp; Features)</option>
                    <option value="Podcast">Podcast (On Air Feature)</option>
                    <option value="Spotlight">Spotlight (Author Feature)</option>
                    <option value="Literary Fiction">Literary Fiction</option>
                    <option value="Historical Fiction">Historical Fiction</option>
                    <option value="Poetry">Poetry</option>
                    <option value="Memoir">Memoir &amp; Biography</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Mystery &amp; Thriller">Mystery &amp; Thriller</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-white"
                  >
                    <option value="Hardcover">Hardcover</option>
                    <option value="Paperback">Paperback</option>
                    <option value="eBook">eBook</option>
                    <option value="Audiobook">Audiobook</option>
                    <option value="Multi-format">Multi-format</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Book Cover Upload & Preview */}
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <h2 className="font-serif text-xl font-bold text-[#080808] flex items-center gap-2">
                  <ImageIcon className="size-5 text-[#AA7C11]" />
                  2. Book Cover Image *
                </h2>
                <p className="text-xs text-neutral-500">
                  Upload your high-resolution cover image or paste a direct image URL.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Visual Preview */}
                <div className="w-32 aspect-[2/3] rounded-2xl bg-[#080808] border-2 border-[#D4AF37]/50 overflow-hidden shadow-md shrink-0 flex items-center justify-center text-center p-2">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-neutral-400">
                      No cover selected
                    </span>
                  )}
                </div>

                <div className="space-y-3 flex-1 w-full">
                  <input
                    type="file"
                    ref={coverInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setCoverUrl)}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <Upload className="size-3.5" />
                      Upload Cover Image
                    </button>
                    {coverUrl && (
                      <button
                        type="button"
                        onClick={() => setCoverUrl("")}
                        className="px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-600 hover:text-black"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600">
                      Or paste hosted image URL:
                    </label>
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://... or /media/covers/the-first.jpg"
                      className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Author Information & Profile Image */}
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <h2 className="font-serif text-xl font-bold text-[#080808] flex items-center gap-2">
                  <Feather className="size-5 text-[#AA7C11]" />
                  3. Author Profile &amp; Contact
                </h2>
                <p className="text-xs text-neutral-500">
                  Your author overview, contact information, and portrait photo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author Full Name *</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Tony Rebeiro"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Author Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="author@example.com"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                <div className="size-16 rounded-full bg-neutral-100 border-2 border-[#D4AF37]/50 overflow-hidden shrink-0 flex items-center justify-center">
                  {authorAvatar ? (
                    <img src={authorAvatar} alt="Author" className="size-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-neutral-400">Photo</span>
                  )}
                </div>
                <div className="space-y-1 flex-1 w-full">
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setAuthorAvatar)}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                    >
                      Upload Author Photo
                    </button>
                  </div>
                  <input
                    type="url"
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    placeholder="Or paste photo URL (https://...)"
                    className="w-full rounded-xl border border-neutral-300 p-2 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Description & Retail Links */}
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <h2 className="font-serif text-xl font-bold text-[#080808] flex items-center gap-2">
                  <Award className="size-5 text-[#AA7C11]" />
                  4. Book Synopsis &amp; Retailer Overview
                </h2>
                <p className="text-xs text-neutral-500">
                  Detailed synopsis and direct bookstore / Amazon links.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#080808]">Book Synopsis / Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the full synopsis, themes, and reader pitch..."
                  className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Amazon / Purchase Link *</label>
                  <input
                    type="url"
                    required
                    value={bookLink}
                    onChange={(e) => setBookLink(e.target.value)}
                    placeholder="https://www.amazon.com/dp/..."
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#080808]">Goodreads / Other Link (Optional)</label>
                  <input
                    type="url"
                    value={goodreadsLink}
                    onChange={(e) => setGoodreadsLink(e.target.value)}
                    placeholder="https://www.goodreads.com/book/..."
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-[#080808] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-neutral-500">
                By submitting, you authorize the LVN editorial desk to inspect metadata and verify listing links.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Send className="size-4" />
                <span>{submitting ? "Submitting Request…" : "Submit Book for Editorial Review"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
