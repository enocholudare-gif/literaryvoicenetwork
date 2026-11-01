import React from "react";
import { HeroVideoSection } from "@/components/home/HeroVideoSection";
import {
  AuthorPromoBanner,
  DigitalMagazineShowcaseSection,
  GenreAndFounderSpotlightSection,
  MeetOurHostsSection,
  MembershipNewsletterPartnersCtaSection,
  OnTheShelfDirectorySection,
  PastBroadcastsSection,
  PodcastAndHotSeatSection,
  StepInsideBroadcastSection,
  TrendingBooksSection,
  UpcomingBroadcastsSection,
  WorldwideSignalMapSection,
} from "@/components/home/HomepageInteractiveSections";
import { RecentlyAddedBooksSection } from "@/components/home/RecentlyAddedBooksSection";
import { getSiteSettings, listBroadcasts } from "@/lib/services/platform";
import { listPublicArticles, listPublicBooks } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function HomePage() {
  const settings = getSiteSettings();
  const { items: allBooks } = listPublicBooks({ pageSize: 100 });
  const { items: allArticles } = listPublicArticles({ pageSize: 50 });
  const broadcasts = listBroadcasts();

  return (
    <div>
      {/* 1. Hero video + dedicated On Air Now player strip */}
      <HeroVideoSection settings={settings} featuredBroadcast={broadcasts[0] || null} />

      {/* 2. Trending books — 3D flip cards */}
      <TrendingBooksSection dbBooks={allBooks} />

      {/* 3. Recently added books — animated */}
      <RecentlyAddedBooksSection books={allBooks.slice(0, 4)} />

      {/* 4. On the shelf directory */}
      <OnTheShelfDirectorySection books={allBooks} />

      {/* 5. Author promotion */}
      <AuthorPromoBanner />

      {/* 6. Step inside the broadcast */}
      <StepInsideBroadcastSection />

      {/* 7. Meet our hosts — bouncing cards */}
      <MeetOurHostsSection />

      {/* 8. Upcoming broadcasts — video cards flowing in & out */}
      <UpcomingBroadcastsSection />

      {/* 9. Past broadcasts — animated carousel */}
      <PastBroadcastsSection episodes={broadcasts} />

      {/* 10. Podcast feed & In the Hot Seat */}
      <PodcastAndHotSeatSection episodes={broadcasts} />

      {/* 12. Digital magazine */}
      <DigitalMagazineShowcaseSection articles={allArticles} />

      {/* 13. Genres & founder spotlight */}
      <GenreAndFounderSpotlightSection />

      {/* 14. Worldwide signal map */}
      <WorldwideSignalMapSection />

      {/* 15. Membership, newsletter, partners, bottom CTA */}
      <MembershipNewsletterPartnersCtaSection />
    </div>
  );
}
