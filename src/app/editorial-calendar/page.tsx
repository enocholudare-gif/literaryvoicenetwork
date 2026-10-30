import React from "react";
import Link from "next/link";
import { ArrowRight, Award, Calendar, CheckCircle2, Clock, Feather, Newspaper } from "lucide-react";
import { StatusBadge } from "@/components/ui/Cards";
import { listEditorialIssues } from "@/lib/services/platform";

export const dynamic = "force-dynamic";

export default function EditorialCalendarPage() {
  const issues = listEditorialIssues();

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Calendar className="w-3.5 h-3.5" />
                Commissioning & Issue Schedule
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                Editorial Calendar & Open Issues
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Review upcoming magazine themes, submission deadlines, and publication windows. Eligible members and authors can submit essays, reviews, or interview pitches directly from their dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard?tab=pitches"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
              >
                <Award className="w-4 h-4" />
                Pitch a Feature or Interview
              </Link>
              <Link
                href="/submission-guidelines"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#D4AF37]/40 text-[#F7DF8B] font-semibold text-xs hover:bg-white/5 transition-colors"
              >
                Submission Guidelines
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Issues List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="rounded-3xl bg-white border border-[#080808]/12 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-3 bg-[#080808] p-6 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-[#080808]/10">
              <img
                src={issue.cover_url || "/media/covers/issue-14.svg"}
                alt={issue.title}
                className="w-36 aspect-[2/3] rounded-xl object-cover shadow-lg border border-[#D4AF37]/40 mb-4"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Issue No. {issue.issue_number}
              </span>
            </div>

            <div className="lg:col-span-9 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={issue.status} />
                    {issue.submission_window_open ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Submissions Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-stone-200 text-stone-700">
                        Submission Window Closed
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/magazine?issue=${issue.id}`}
                    className="text-xs font-bold text-[#AA7C11] hover:underline inline-flex items-center gap-1"
                  >
                    Browse Issue Articles
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808]">
                    {issue.title}: <span className="text-[#AA7C11]">{issue.theme}</span>
                  </h2>
                  <p className="mt-2 text-sm text-[#080808]/80 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10">
                    <span className="text-xs text-[#080808]/60 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#AA7C11]" />
                      Submission & Pitch Deadline
                    </span>
                    <span className="mt-1 font-serif text-lg font-bold text-[#080808] block">
                      {new Date(issue.submission_deadline).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10">
                    <span className="text-xs text-[#080808]/60 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#AA7C11]" />
                      Scheduled Publication Date
                    </span>
                    <span className="mt-1 font-serif text-lg font-bold text-[#080808] block">
                      {new Date(issue.publication_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#080808]/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#080808]/60">
                  We accept long-form essays (1,500–4,000 words), critical book reviews, and author interview pitches.
                </span>
                {issue.submission_window_open && (
                  <div className="flex gap-2.5">
                    <Link
                      href="/dashboard?tab=publications"
                      className="px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold hover:bg-[#141414] transition-colors"
                    >
                      Submit Manuscript
                    </Link>
                    <Link
                      href="/dashboard?tab=pitches"
                      className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#080808] text-xs font-bold hover:bg-[#F7DF8B] transition-colors"
                    >
                      Submit Pitch
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

