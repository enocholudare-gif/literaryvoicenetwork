import React from "react";
import { HeroVideoSection } from "@/components/home/HeroVideoSection";
import {
  AuthorPromoBanner,
  DigitalMagazineShowcaseSection,
  GenreAndFounderSpotlightSection,
  LiveVideoStageSection,
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

export default function HomePage() {
  const settings = getSiteSettings();
  const { items: allBooks } = listPublicBooks();
  const { items: allArticles } = listPublicArticles();
  const broadcasts = listBroadcasts();

  return (
    <div>
      {/* 1. Hero video + dedicated On Air Now player strip */}
      <HeroVideoSection settings={settings} featuredBroadcast={broadcasts[0] || null} />

      {/* 2. Author promotion */}
      <AuthorPromoBanner />

      {/* 3. Step inside the broadcast */}
      <StepInsideBroadcastSection />

      {/* 4. Meet our hosts — bouncing cards */}
      <MeetOurHostsSection />

      {/* 5. Upcoming broadcasts — video cards flowing in & out */}
      <UpcomingBroadcastsSection />

      {/* 6. Past broadcasts — animated carousel */}
      <PastBroadcastsSection episodes={broadcasts} />

      {/* 7. Live video stage */}
      <LiveVideoStageSection />

      {/* 8. Trending books — 3D flip cards */}
      <TrendingBooksSection />

      {/* 9. Recently added books — animated */}
      <RecentlyAddedBooksSection books={allBooks.slice(0, 4)} />

      {/* 10. On the shelf directory */}
      <OnTheShelfDirectorySection books={allBooks} />

      {/* 11. Podcast feed & In the Hot Seat */}
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
