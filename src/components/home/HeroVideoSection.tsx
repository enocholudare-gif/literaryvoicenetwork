"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ExternalLink,
  Headphones,
  Pause,
  Play,
  Radio,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudioPlayer } from "../layout/AudioPlayerContext";
import type { Broadcast, SiteSettingsMap } from "@/lib/db/types";

const LOCAL_HERO_VIDEO_URL = "/media/hero-video.mp4";
const REMOTE_HERO_VIDEO_URL =
  "https://videotourl.com/videos/1792770791367-b8ab28bf-7cd3-46ef-8bf5-cba07b6375bb.mp4";
const SPOTIFY_URL =
  "https://open.spotify.com/user/31lygcpwpx6g66kako3vx25pa4fu?si=2rDuJW9YSeWLWsdYnLVJ_w&utm_source=copy-link";

const ROTATING_TAGLINES = [
  "Come Alive On Air",
  "Meet Their Readers",
  "Echo Around the World",
];

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <span>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

interface HeroVideoSectionProps {
  settings: SiteSettingsMap;
  featuredBroadcast?: Broadcast | null;
}

export function HeroVideoSection({
  settings,
  featuredBroadcast,
}: HeroVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const {
    playTrack,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    togglePlayPause,
    seek,
    toggleMute,
  } = useAudioPlayer();

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % ROTATING_TAGLINES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const toggleVideoSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setVideoMuted(v.muted);
  };

  const handlePlayFeaturedBroadcast = () => {
    if (featuredBroadcast) {
      playTrack({
        id: featuredBroadcast.id,
        title: featuredBroadcast.title,
        programmeName: featuredBroadcast.programme_name,
        hostName: featuredBroadcast.host_name,
        guestName: featuredBroadcast.guest_name,
        audioUrl:
          featuredBroadcast.audio_file_url ||
          "/media/audio/lvn-studio-preview.wav",
        slug: featuredBroadcast.slug,
        isLiveStream: featuredBroadcast.is_live,
      });
    } else {
      playTrack({
        id: "bcast-live-1",
        title:
          "The Meridian Conversation: Eleanor Vance & Amara Osei on Archival Memory",
        programmeName: "The Meridian Conversation",
        hostName: "Eleanor Vance",
        guestName: "Amara Osei",
        audioUrl: "/media/audio/lvn-studio-preview.wav",
        slug: "the-meridian-conversation-ep-42-amara-osei",
        isLiveStream: true,
      });
    }
  };

  const isFeaturedPlaying =
    isPlaying &&
    (!featuredBroadcast || currentTrack?.id === featuredBroadcast.id);

  return (
    <>
      {/* 1. FULL-WIDTH EXTENDED HERO SECTION — Obsidian Black & Gold Gradient */}
      <section
        aria-label="Hero Broadcast Showcase"
        className="relative overflow-hidden bg-[#040404] text-[#FAF8F3] border-b border-[#D4AF37]/30 min-h-[580px] lg:min-h-[640px] flex items-center"
      >
        {/* Fast-Loading Local Video Layer */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            className="w-full h-full object-cover will-change-transform"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={settings.heroPosterUrl || "/media/lvn-hero-poster.svg"}
          >
            <source src={LOCAL_HERO_VIDEO_URL} type="video/mp4" />
            <source src={REMOTE_HERO_VIDEO_URL} type="video/mp4" />
          </video>

          {/* Obsidian Black & Warm Gold Radial Scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(110deg, rgba(4,4,4,0.90) 0%, rgba(10,10,10,0.74) 55%, rgba(4,4,4,0.86) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(212,175,55,0.22),transparent_55%)]" />
        </div>

        {/* Extended Hero Text Container */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl space-y-6">
            {/* Live Pill + Listener Count */}
            <div className="animate-hero-1 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#0A0A0A]/85 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#F7DF8B]">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-[#D4AF37]" />
                </span>
                On Air Now
              </span>
              <span className="text-xs font-medium text-[#FAF8F3]/80 tracking-wide">
                1,248 listening across 8 global hubs
              </span>
            </div>

            {/* Extended Animated Display Headline */}
            <h1 className="animate-hero-2 font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06] text-[#FAF8F3]">
              Where Books{" "}
              <span
                key={phraseIdx}
                className="block sm:inline text-gold-shimmer italic font-normal transition-all duration-500"
              >
                {ROTATING_TAGLINES[phraseIdx]}
              </span>
            </h1>

            {/* Extended Subheadline */}
            <p className="animate-hero-3 text-base sm:text-xl text-[#FAF8F3]/85 max-w-3xl leading-relaxed">
              Author conversations, live readings, and literary culture —
              broadcast twenty-four hours a day across our global network.
            </p>

            {/* Primary & Secondary CTAs + Video Sound Toggle */}
            <div className="animate-hero-4 flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={handlePlayFeaturedBroadcast}
                className="inline-flex items-center gap-2.5 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-bold text-[#050505] shadow-[0_12px_30px_rgba(212,175,55,0.35)] hover:brightness-110 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {isFeaturedPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 fill-current" />
                )}
                <span>
                  {isFeaturedPlaying ? "Listening Live" : "Listen Live"}
                </span>
              </button>

              <Link
                href="/shows"
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/5 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-[#FAF8F3] hover:border-[#F7DF8B] hover:text-[#F7DF8B] transition-all"
              >
                <Calendar className="size-4 text-[#D4AF37]" />
                <span>Program Schedule</span>
              </Link>

              <button
                type="button"
                onClick={toggleVideoSound}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-md px-4 py-3.5 text-xs font-medium text-[#FAF8F3]/85 hover:border-[#D4AF37] hover:text-[#F7DF8B] transition-colors cursor-pointer"
              >
                {videoMuted ? (
                  <VolumeX className="size-3.5 text-[#D4AF37]" />
                ) : (
                  <Volume2 className="size-3.5 text-[#D4AF37]" />
                )}
                <span>{videoMuted ? "Unmute Video" : "Video Audio On"}</span>
              </button>
            </div>

            {/* 3 Clean Animated Network Counters */}
            <div className="animate-hero-5 pt-8 border-t border-white/15 grid grid-cols-3 gap-6 sm:gap-12 max-w-2xl">
              <div>
                <p className="font-serif-display text-2xl sm:text-4xl font-bold text-[#F7DF8B]">
                  <AnimatedCounter target={42} />
                </p>
                <p className="text-xs sm:text-sm text-[#FAF8F3]/70 mt-1">
                  Programs weekly
                </p>
              </div>
              <div>
                <p className="font-serif-display text-2xl sm:text-4xl font-bold text-[#F7DF8B]">
                  <AnimatedCounter target={1280} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-[#FAF8F3]/70 mt-1">
                  Authors featured
                </p>
              </div>
              <div>
                <p className="font-serif-display text-2xl sm:text-4xl font-bold text-[#F7DF8B]">
                  <AnimatedCounter target={3400} suffix="+" />
                </p>
                <p className="text-xs sm:text-sm text-[#FAF8F3]/70 mt-1">
                  Hours on demand
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED "ON AIR NOW & STUDIO ON-DEMAND" SECTION BELOW THE HERO */}
      <section
        aria-label="On Air Now & Studio On-Demand Player"
        className="bg-[#080808] text-[#FAF8F3] border-b border-[#D4AF37]/30 py-8 sm:py-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#121212] via-[#1B170C] to-[#121212] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left: Show Badge, Title & Host */}
              <div className="lg:col-span-6 flex items-start gap-4">
                <div className="size-14 rounded-2xl bg-gold-gradient flex items-center justify-center text-[#050505] shrink-0 shadow-md">
                  <Radio className="size-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/45 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#F7DF8B]">
                      <span className="size-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                      On Air Now · Studio Stream
                    </span>
                    <span className="text-xs font-semibold text-[#D4AF37]">
                      {currentTrack?.programmeName ||
                        featuredBroadcast?.programme_name ||
                        "The Meridian Conversation"}
                    </span>
                  </div>
                  <Link
                    href={
                      currentTrack?.slug
                        ? `/broadcasts/${currentTrack.slug}`
                        : featuredBroadcast?.slug
                        ? `/broadcasts/${featuredBroadcast.slug}`
                        : "/broadcasts"
                    }
                    className="block font-serif-display text-lg sm:text-xl font-bold text-[#FAF8F3] hover:text-[#F7DF8B] transition-colors mt-1"
                  >
                    {currentTrack?.title ||
                      featuredBroadcast?.title ||
                      "Maritime Archives & Polyphonic Fiction with Amara Osei"}
                  </Link>
                  <p className="text-xs text-[#FAF8F3]/70 mt-1 line-clamp-1">
                    Hosted by{" "}
                    {currentTrack?.hostName ||
                      featuredBroadcast?.host_name ||
                      "Eleanor Vance"}{" "}
                    ·{" "}
                    {featuredBroadcast?.description ||
                      "Join our flagship studio broadcast exploring contemporary letters and archival memory."}
                  </p>
                </div>
              </div>

              {/* Center: Scrubber & Equalizer */}
              <div className="lg:col-span-3 flex flex-col justify-center">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#F7DF8B]/85 mb-1.5">
                  <span>0:0{Math.floor(currentTime)}</span>
                  <div className="flex items-end gap-1 h-3.5" aria-hidden="true">
                    <span
                      className="w-1 bg-[#D4AF37] rounded-full h-2.5 animate-eq-bar"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1 bg-[#D4AF37] rounded-full h-3.5 animate-eq-bar"
                      style={{ animationDelay: "180ms" }}
                    />
                    <span
                      className="w-1 bg-[#D4AF37] rounded-full h-2 animate-eq-bar"
                      style={{ animationDelay: "340ms" }}
                    />
                    <span
                      className="w-1 bg-[#D4AF37] rounded-full h-3 animate-eq-bar"
                      style={{ animationDelay: "120ms" }}
                    />
                  </div>
                  <span>0:0{Math.max(1, Math.round(duration))}</span>
                </div>
                <input
                  type="range"
                  aria-label="Seek studio audio stream"
                  min={0}
                  max={duration || 4}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] h-1.5 bg-white/15 rounded-lg cursor-pointer"
                />
              </div>

              {/* Right: Play/Pause, Mute & Spotify */}
              <div className="lg:col-span-3 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-bold text-[#050505] hover:brightness-110 transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3.5 fill-current" />
                      <span>Pause Studio</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5 fill-current" />
                      <span>Listen in Studio</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute studio" : "Mute studio"}
                  className="p-2.5 rounded-full border border-white/15 bg-white/5 text-[#FAF8F3]/80 hover:border-[#D4AF37] hover:text-[#F7DF8B] transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>

                <a
                  href={SPOTIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 px-3.5 py-2.5 text-xs font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/15 transition-colors"
                >
                  <Headphones className="size-3.5 text-[#D4AF37]" />
                  <span>Spotify</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
