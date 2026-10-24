import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Feather } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] bg-[#FAF8F3] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-3xl bg-white border border-[#080808]/12 p-10 text-center space-y-5 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#080808] text-[#D4AF37] flex items-center justify-center mx-auto">
          <Feather className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#AA7C11]">
          404 · Page Not Found in Archive
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#080808]">
          This Folio Could Not Be Located
        </h1>
        <p className="text-sm text-[#080808]/70 leading-relaxed">
          The book listing, author profile, or magazine essay you requested may be a private draft, archived, or moved to another shelf.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#080808] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Homepage
          </Link>
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#080808]/20 text-[#080808] text-xs font-bold"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Browse Book Directory
          </Link>
        </div>
      </div>
    </div>
  );
}

