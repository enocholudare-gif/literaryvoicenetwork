"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Globe,
  Mic2,
  Radio,
} from "lucide-react";

export default function ForAuthorsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bookTitle: "",
    genre: "Literary Fiction",
    isbn: "",
    pitch: "",
  });

  const formattedMailText = [
    "To: enquiry@literarynetwork.org",
    `Subject: [LVN Admin Approval Required] New Book Submission: "${form.bookTitle}" by ${form.name}`,
    "----------------------------------------",
    `Book Title: ${form.bookTitle}`,
    `Author / Publicist: ${form.name} (${form.email})`,
    `Primary Genre: ${form.genre}`,
    `ISBN / Retail Link: ${form.isbn || "N/A"}`,
    `Synopsis & Talking Points: ${form.pitch}`,
    "Status: Pending Admin Approval",
    "----------------------------------------",
    "Sent to Admin Console (/admin) & enquiry@literarynetwork.org for review and approval.",
  ].join("\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCopied(false);
    await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-enquiry",
        enquiryData: {
          enquiryType: "author_promotion",
          name: form.name,
          email: form.email,
          subject: `[Admin Approval Required] Book Submission: ${form.bookTitle}`,
          message: formattedMailText,
        },
      }),
    }).catch(() => {});
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
              <Mic2 className="size-3.5 text-[#D4AF37]" />
              For Authors &amp; Publishers
            </span>
            <h1 className="font-serif-display text-4xl sm:text-5xl font-bold leading-tight">
              Get Your Book Heard Across the Network
            </h1>
            <p className="text-base sm:text-lg text-[#FAF8F3]/75 max-w-2xl leading-relaxed">
              Submit your title for live studio interviews, global radio
              syndication, digital magazine reviews, and verified placement in
              the LVN Book Directory.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="#submit-book-form"
                className="rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors"
              >
                Submit Your Book Now
              </a>
              <Link
                href="/publish"
                className="rounded-full border border-white/25 px-6 py-3 text-xs font-semibold text-[#FAF8F3] hover:border-[#D4AF37] hover:text-[#F7DF8B] transition-colors"
              >
                Publish Directly to Shelf
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl bg-[#141414] border border-[#D4AF37]/40 p-6 sm:p-8 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#080808]">
              <Award className="size-3" />
              Seasonal Author Feature
            </span>
            <h2 className="font-serif-display text-2xl font-bold text-[#FAF8F3]">
              10% Off Author Broadcast Packages This Season
            </h2>
            <p className="text-xs text-[#FAF8F3]/75 leading-relaxed">
              Includes a 30-minute live interview with an LVN host, permanent
              podcast syndication on Spotify &amp; Apple Podcasts, and featured
              placement on our homepage chart.
            </p>
            <ul className="space-y-2 text-xs text-[#F7DF8B]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#D4AF37]" />
                Live broadcast across 8 international hubs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#D4AF37]" />
                Direct retail links to Amazon, Bookshop.org &amp; Audible
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#D4AF37]" />
                Editorial review in LVN Digital Magazine
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3-Step Process + Form */}
      <section
        id="submit-book-form"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        <div className="lg:col-span-5 space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
            How It Works
          </p>
          <h2 className="font-serif-display text-3xl font-bold text-[#080808]">
            From Manuscript to Global Broadcast
          </h2>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Submit Your Title & Press Kit",
                desc: "Share your book details, ISBN, synopsis, and preferred broadcast format below.",
              },
              {
                step: "02",
                title: "Editorial & Producer Review",
                desc: "Our commissioning editors match your book with the ideal show host and seasonal slot.",
              },
              {
                step: "03",
                title: "Live Studio Recording & Syndication",
                desc: "Join our host in the virtual studio for your interview, then stream on demand worldwide.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl bg-white border border-[#D4AF37]/25 p-5 shadow-xs"
              >
                <span className="font-mono text-xs font-bold text-[#AA7C11]">
                  STEP {item.step}
                </span>
                <h3 className="font-serif-display text-lg font-bold text-[#080808] mt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white border border-[#D4AF37]/30 p-8 shadow-lg">
            {submitted ? (
              <div className="space-y-5 py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-10 text-amber-500 shrink-0" />
                  <div>
                    <span className="inline-block rounded-full bg-gold-gradient px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#050505]">
                      ✉ Mail Text Dispatched for Admin Approval
                    </span>
                    <h3 className="font-serif-display text-2xl font-bold text-[#080808] mt-1">
                      Book Submission Sent to Admin
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your book submission now awaits Admin approval before appearing on the public website. Below is the official mail text dispatched to{" "}
                  <strong className="text-[#080808]">enquiry@literarynetwork.org</strong>:
                </p>
                <div className="rounded-2xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/50 p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {formattedMailText}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={`mailto:enquiry@literarynetwork.org?subject=${encodeURIComponent(
                      `[LVN Admin Approval Required] New Book Submission: "${form.bookTitle}" by ${form.name}`
                    )}&body=${encodeURIComponent(formattedMailText)}`}
                    className="rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-bold text-[#050505] hover:brightness-110"
                  >
                    ✉ Open in Mail App (enquiry@literarynetwork.org)
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(formattedMailText);
                      setCopied(true);
                    }}
                    className="rounded-full border border-[#080808]/30 px-4 py-2.5 text-xs font-semibold text-[#080808] hover:border-[#D4AF37] cursor-pointer"
                  >
                    {copied ? "✓ Copied Mail Text" : "Copy Mail Text"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="rounded-full bg-[#080808] px-5 py-2.5 text-xs font-bold text-[#FAF8F3] cursor-pointer"
                  >
                    Submit Another Title
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif-display text-2xl font-bold text-[#080808]">
                  Author Broadcast &amp; Feature Application
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#080808] mb-1">
                      Author / Publicist Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#080808] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#080808] mb-1">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.bookTitle}
                      onChange={(e) =>
                        setForm({ ...form, bookTitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#080808] mb-1">
                      Primary Genre
                    </label>
                    <select
                      value={form.genre}
                      onChange={(e) =>
                        setForm({ ...form, genre: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
                    >
                      <option>Literary Fiction</option>
                      <option>Historical Fiction</option>
                      <option>Speculative Fiction</option>
                      <option>Non-Fiction &amp; History</option>
                      <option>Biography &amp; Memoir</option>
                      <option>Poetry &amp; Translation</option>
                      <option>Business &amp; Leadership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#080808] mb-1">
                    ISBN / Retail Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    placeholder="978-... or Amazon / Bookshop URL"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#080808] mb-1">
                    Synopsis &amp; Interview Talking Points *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.pitch}
                    onChange={(e) =>
                      setForm({ ...form, pitch: e.target.value })
                    }
                    placeholder="Tell our producers about your book and what themes you'd love to discuss on air…"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#080808] py-3.5 text-xs font-bold text-[#FAF8F3] hover:bg-[#D4AF37] hover:text-[#080808] transition-colors cursor-pointer"
                >
                  Submit Book for On-Air Feature
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
