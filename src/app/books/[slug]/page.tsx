import React from "react";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getBookBySlugForViewer,
  incrementBookView,
  listBookReviews,
  listPublicArticles,
  listPublicBooks,
} from "@/lib/services/publishing";
import { BookDetailClientWrapper } from "@/components/books/BookDetailClientWrapper";

export const dynamic = "force-dynamic";

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const viewer = await getCurrentSession();
  const book = getBookBySlugForViewer(slug, viewer);

  if (book) {
    incrementBookView(slug);
  }

  const reviews = book ? listBookReviews(book.id) : [];

  const relatedArticles = book
    ? listPublicArticles({
        relatedBookId: book.id,
        pageSize: 6,
      }).items
    : [];

  const relatedBooks = book
    ? listPublicBooks({
        genre: book.genre,
        pageSize: 4,
      }).items.filter((b) => b.id !== book.id)
    : [];

  return (
    <BookDetailClientWrapper
      initialBook={book}
      slug={slug}
      initialReviews={reviews}
      currentUserId={viewer?.user.id}
      relatedArticles={relatedArticles}
      relatedBooks={relatedBooks}
    />
  );
}
