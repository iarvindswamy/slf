import { NextRequest, NextResponse } from "next/server";

import {
  getTrackingStages,
  getAllTrackingStages,
  upsertTrackingStage,
  deleteTrackingStage,
} from "@/lib/tracking";

import type { TrackingModule } from "@/types/tracking";

export const runtime = "nodejs";

/**
 * GET /api/logistics/tracking/stages
 * Query params:
 *   module=LOGISTICS|FOOD   (default LOGISTICS)
 *   all=true                → include disabled stages (admin view)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleParam = (searchParams.get("module") || "LOGISTICS").toUpperCase();
    const module: TrackingModule =
      moduleParam === "FOOD" ? "FOOD" : "LOGISTICS";
    const includeAll = searchParams.get("all") === "true";

    const stages = includeAll
      ? await getAllTrackingStages(module)
      : await getTrackingStages(module);

    return NextResponse.json({
      success: true,
      module,
      stages,
    });
  } catch (err) {
    console.error("[tracking/stages GET]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to fetch tracking stages",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/logistics/tracking/stages
 * Body: {
 *   id?: string;          // omit to create
 *   code: string;
 *   label: string;
 *   module?: "LOGISTICS" | "FOOD";
 *   enabled?: boolean;
 *   sortOrder?: number;
 *   isSystem?: boolean;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.code?.trim() || !body.label?.trim()) {
      return NextResponse.json(
        { error: "code and label are required." },
        { status: 400 },
      );
    }

    const module: TrackingModule =
      body.module === "FOOD" ? "FOOD" : "LOGISTICS";

    const stage = await upsertTrackingStage({
      id: body.id,
      code: body.code,
      label: body.label,
      module,
      enabled: body.enabled !== false,
      sortOrder:
        typeof body.sortOrder === "number" ? body.sortOrder : 999,
      isSystem: Boolean(body.isSystem),
    });

    return NextResponse.json({
      success: true,
      stage,
    });
  } catch (err) {
    console.error("[tracking/stages POST]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to save tracking stage",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/logistics/tracking/stages
 * Body: { id: string }
 * (or query ?id=...)
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id?.trim()) {
      return NextResponse.json(
        { error: "Stage id is required." },
        { status: 400 },
      );
    }

    await deleteTrackingStage(id.trim());

    return NextResponse.json({
      success: true,
      deleted: id,
    });
  } catch (err) {
    console.error("[tracking/stages DELETE]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to delete tracking stage",
      },
      { status: 500 },
    );
  }
}