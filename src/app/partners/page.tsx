"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  Sparkles,
} from "lucide-react";
import type { Partner } from "@/lib/db/types";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [enquiryType, setEnquiryType] = useState<
    "partnership" | "sponsorship" | "author_promotion" | "editorial_service"
  >("partnership");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/platform?scope=public-config")
      .then((r) => r.json())
      .then((d) => setPartners(d.partners || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-enquiry",
        enquiryData: {
          enquiryType,
          name,
          email,
          organization,
          subject,
          message,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to send enquiry.");
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
            <Globe className="w-3.5 h-3.5" />
            Literary Ecosystem & Services
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
            Partners, Retailers & Author Services
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
            Verified book distribution partners, independent bookstore networks, and bespoke editorial and broadcast promotion programmes for authors and small presses.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Verified Partners Grid */}
        <section>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mb-6">
            Verified Retail & Bibliographic Partners
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-white border border-[#080808]/12 hover:border-[#D4AF37] transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#AA7C11]">
                      {partner.category}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#080808]/40 group-hover:text-[#D4AF37]" />
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-bold text-[#080808] group-hover:text-[#AA7C11]">
                    {partner.name}
                  </h3>
                  <p className="mt-2 text-xs text-[#080808]/75 leading-relaxed">
                    {partner.description}
                  </p>
                </div>
                <span className="mt-4 pt-3 border-t border-[#080808]/10 text-[11px] font-medium text-[#080808]/55 block">
                  {partner.location}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Partnership & Promotional Enquiry Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
              Collaborate with LVN
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#080808]">
              Partnership, Press & Promotional Enquiries
            </h2>
            <p className="text-sm text-[#080808]/75 leading-relaxed">
              Whether you represent an independent literary press, a university humanities program, or are an author planning a book launch and studio broadcast tour, our partnerships desk will route your enquiry directly to the appropriate commissioning editor.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-[#080808]/85">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11]" />
                <span>Small Press & University Press Dossier Partnerships</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11]" />
                <span>Author Launch Salons & Broadcast Sponsorships</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11]" />
                <span>Bibliographic Metadata & Press Kit Consultation</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl bg-white border border-[#080808]/12 p-8 shadow-xs">
            {submitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="font-serif text-2xl font-bold text-[#080808]">
                  Enquiry Recorded by the LVN Desk
                </h3>
                <p className="text-sm text-[#080808]/75">
                  Thank you, {name}. Your enquiry has been saved in our editorial database and assigned to our partnerships team.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubject("");
                    setMessage("");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-950 text-rose-100 text-xs">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Enquiry Category
                    </label>
                    <select
                      value={enquiryType}
                      onChange={(e) =>
                        setEnquiryType(e.target.value as typeof enquiryType)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    >
                      <option value="partnership">Imprint / Bookstore Partnership</option>
                      <option value="author_promotion">Author Broadcast & Launch Promotion</option>
                      <option value="sponsorship">Issue or Broadcast Sponsorship</option>
                      <option value="editorial_service">Editorial & Metadata Consultation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@press.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                      Imprint / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Press, university, or agency"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your proposal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Proposal / Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share timeline, title details, or partnership goals..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#080808] text-white font-bold text-xs hover:bg-[#141414] transition-colors"
                >
                  Send Partnership Enquiry
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
