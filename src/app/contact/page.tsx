"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-enquiry",
        enquiryData: {
          enquiryType: "contact",
          name,
          email,
          subject,
          message,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to send message.");
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
            <Mail className="w-3.5 h-3.5" />
            Editorial & Reader Correspondence
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
            Contact Literary Voices Network
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
            Reach our editorial desk, broadcast producers, or reader services team.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#080808]/12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#AA7C11]">
              Editorial & Commissioning Desk
            </span>
            <p className="font-serif text-lg font-bold text-[#080808]">
              editorial@literaryvoicesnetwork.org
            </p>
            <p className="text-xs text-[#080808]/70">
              For questions regarding magazine issues, book reviews, and manuscript submissions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#080808]/12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#AA7C11]">
              Broadcast Studio & Press Office
            </span>
            <p className="font-serif text-lg font-bold text-[#080808]">
              press@literaryvoicesnetwork.org
            </p>
            <p className="text-xs text-[#080808]/70">
              For interview scheduling, audio/video studio bookings, and press releases.
            </p>
          </div>

          <a
            href="tel:+13678481372"
            className="block p-6 rounded-2xl bg-[#080808] border-2 border-[#D4AF37]/50 space-y-2 hover:border-[#F7DF8B] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Call Us Directly
            </span>
            <p className="font-serif text-xl font-bold text-[#F7DF8B]">
              +1 (367) 848-1372
            </p>
            <p className="text-xs text-white/70">
              Partnerships, events, author features, and general enquiries.
            </p>
          </a>

          <a
            href="https://open.spotify.com/user/31lygcpwpx6g66kako3vx25pa4fu?si=2rDuJW9YSeWLWsdYnLVJ_w&utm_source=copy-link"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-2xl bg-white border border-[#D4AF37]/40 space-y-2 hover:border-[#D4AF37] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#AA7C11] flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              Listen on Spotify
            </span>
            <p className="font-serif text-lg font-bold text-[#080808]">
              Literary Voices Network on Spotify →
            </p>
          </a>

          <div className="p-6 rounded-2xl bg-white border border-[#080808]/12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#AA7C11] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Editorial Bureaus
            </span>
            <p className="font-serif text-base font-bold text-[#080808]">
              New York · London · Edinburgh
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#080808]/12 p-8 shadow-xs">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="font-serif text-2xl font-bold text-[#080808]">
                Message Received
              </h2>
              <p className="text-sm text-[#080808]/75">
                Thank you for writing to Literary Voices Network. Your message has been logged for our editorial team.
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
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#080808] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#AA7C11]" />
                Send a Direct Message
              </h2>
              {error && (
                <div className="p-3 rounded-xl bg-rose-950 text-rose-100 text-xs">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1">
                  Message
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#080808]/20 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#080808] text-white font-bold text-xs hover:bg-[#141414] transition-colors"
              >
                Send Correspondence
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
