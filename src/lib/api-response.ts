import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  status = 200,
  message?: string,
) {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message ? { message } : {}),
    },
    { status },
  );
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
) {
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}