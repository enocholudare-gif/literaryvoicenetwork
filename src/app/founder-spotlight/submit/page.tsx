"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Compass } from "lucide-react";

export default function FounderSpotlightSubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    founderName: "",
    email: "",
    companyName: "",
    city: "",
    sector: "",
    story: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-enquiry",
        enquiryData: {
          enquiryType: "founder_spotlight",
          name: form.founderName,
          email: form.email,
          subject: `Founder Spotlight Pitch: ${form.companyName}`,
          message: `Company: ${form.companyName} (${form.city}) | Sector: ${form.sector}\n\n${form.story}`,
        },
      }),
    }).catch(() => {});
    setSubmitted(true);
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
            <Compass className="size-3.5 text-[#D4AF37]" />
            Founder Pitch
          </span>
          <h1 className="font-serif-display text-4xl font-bold mt-4">
            Apply for Business &amp; Founder Spotlight
          </h1>
          <p className="text-sm sm:text-base text-[#FAF8F3]/75 mt-2">
            Tell our editorial producers about your company, publishing imprint,
            or creative venture to be featured on air and in our digital
            magazine.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-3xl bg-white border border-[#D4AF37]/30 p-8 shadow-lg">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle2 className="size-12 text-amber-500 mx-auto" />
              <h2 className="font-serif-display text-2xl font-bold text-[#080808]">
                Founder Pitch Submitted
              </h2>
              <p className="text-sm text-slate-600">
                Our Business &amp; Founder Spotlight desk has received your
                application and will follow up shortly.
              </p>
              <Link
                href="/founder-spotlight"
                className="inline-block rounded-full bg-[#080808] px-6 py-2.5 text-xs font-bold text-[#FAF8F3]"
              >
                Back to Founder Spotlight
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#080808] mb-1">
                    Founder Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.founderName}
                    onChange={(e) =>
                      setForm({ ...form, founderName: e.target.value })
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
                    Company / Imprint Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) =>
                      setForm({ ...form, companyName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#080808] mb-1">
                    City &amp; Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#080808] mb-1">
                  Industry / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  placeholder="e.g., Independent Publishing, Audio Tech, Cultural Archive"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#080808] mb-1">
                  Founder Story &amp; Key Milestones *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#080808] py-3.5 text-xs font-bold text-[#FAF8F3] hover:bg-[#D4AF37] hover:text-[#080808] transition-colors cursor-pointer"
              >
                Submit Founder Pitch
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
