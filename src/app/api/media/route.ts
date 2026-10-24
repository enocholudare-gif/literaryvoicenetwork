import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  deleteMediaAsset,
  listMediaAssets,
  uploadMediaAsset,
} from "@/lib/services/media";
import type { MediaAsset } from "@/lib/db/types";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }
    const assets = listMediaAssets(session);
    return NextResponse.json({ ok: true, assets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load media";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    const altText = String(formData.get("altText") || file.name);
    const assetCategory = String(
      formData.get("assetCategory") || "editorial"
    ) as MediaAsset["asset_category"];
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = uploadMediaAsset(session, {
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      buffer,
      altText,
      assetCategory,
      isPublic: true,
    });

    return NextResponse.json({ ok: true, asset });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Media upload failed";
    const status = message.startsWith("FORBIDDEN") ? 403 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const assetId = String(searchParams.get("id") || "");
    deleteMediaAsset(session, assetId);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Media delete failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

