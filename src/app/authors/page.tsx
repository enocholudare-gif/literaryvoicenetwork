import React from "react";
import Link from "next/link";
import { Award, Feather, Search, Users } from "lucide-react";
import { SpotlightBookGrid } from "@/components/books/SpotlightBookGrid";
import { SpotlightAuthorsDirectory } from "@/components/authors/SpotlightAuthorsDirectory";
import { listPublicAuthors } from "@/lib/services/platform";
import { listPublicBooks } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface AuthorsPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
}

export default async function AuthorsDirectoryPage({ searchParams }: AuthorsPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const genre = params.genre || "All";

  // Filter out seed mock profiles so only real authors added or published appear
  const allAuthors = listPublicAuthors({ search, genre });
  const realAuthors = allAuthors.filter(
    (a) =>
      !a.id.startsWith("profile-") &&
      !["claire-moreau", "amara-osei", "ayn-cates-sullivan", "caro-claire-burke", "charlotte-mcconaghy", "david-sheldon", "stacey-horn", "erica-elliott", "graham-wilson", "jane-austen", "julian-thorne", "kathryn-stockett", "kenneth-bliss", "lou-lipsitz", "lynn-slaughter", "marie-benedict", "soren-lindqvist", "tayari-jones", "tony-rebeiro", "marcus-sterling", "eleanor-vance"].includes(a.slug)
  );

  const { items: spotlightBooks } = listPublicBooks({ genre: "Spotlight", pageSize: 50 });

  const genres = [
    "All",
    "Literary Fiction",
    "Historical Fiction",
    "Poetry",
    "Translation",
    "Essays & Criticism",
    "Biography & Literary History",
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Users className="w-3.5 h-3.5" />
                Voices of the Network
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                Author &amp; Contributor Directory
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Discover novelists, poets, translators, literary critics, and editorial contributors publishing original work on Literary Voices Network.
              </p>
            </div>
            <Link
              href="/for-authors"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
            >
              <Award className="w-4 h-4" />
              Join the Network
            </Link>
          </div>

          <form
            action="/authors"
            method="GET"
            className="mt-8 p-4 rounded-2xl bg-[#141414] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3"
          >
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search by author name, biography, or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                name="genre"
                defaultValue={genre}
                aria-label="Filter authors by genre"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g === "All" ? "All Literary Genres" : g}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
              >
                Filter Directory
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Directory & Spotlight Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Spotlight Books Grid */}
        <SpotlightBookGrid initialBooks={spotlightBooks} />

        {/* Spotlight Authors Directory (Dynamic from DB & LocalStorage) */}
        <SpotlightAuthorsDirectory initialAuthors={realAuthors} />
      </div>
    </div>
  );
}
