import React from "react";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-[#080808]/12 p-8 sm:p-12 space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
          <ShieldCheck className="w-4 h-4" />
          Data Protection & Privacy
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#080808]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#080808]/60">Last Updated: October 2026</p>

        <div className="space-y-4 text-sm text-[#080808]/80 leading-relaxed">
          <p>
            Literary Voices Network (LVN) respects the intellectual property and personal privacy of our readers, members, authors, and editors.
          </p>
          <h2 className="font-serif text-xl font-bold text-[#080808] pt-2">
            1. Account & Profile Information
          </h2>
          <p>
            When you register for an LVN account, we store your email address, cryptographic password hash (scrypt), and optional public author profile fields. Your email address and private manuscript drafts are never exposed to the public unless you explicitly list a contact email in your public author profile.
          </p>
          <h2 className="font-serif text-xl font-bold text-[#080808] pt-2">
            2. Drafts & Editorial Moderation Confidentiality
          </h2>
          <p>
            Unpublished book drafts, article manuscripts, and editorial pitches are restricted strictly to the submitting author and authorized LVN editorial staff.
          </p>
          <h2 className="font-serif text-xl font-bold text-[#080808] pt-2">
            3. Account Deletion & Right to Erasure
          </h2>
          <p>
            Members may deactivate or request deletion of their account at any time through the Account Settings tab of the Member Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

