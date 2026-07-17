import { NextResponse } from "next/server";
import type { z } from "zod";

/**
 * Consistent JSON envelopes for the REST layer (CLAUDE.md §2.5). Success and
 * error shapes are stable so clients and the API docs (Phase 7) can rely on
 * them.
 *
 *   success → { data: <payload> }
 *   error   → { error: { message, code?, fields? } }
 */

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T): NextResponse {
  return ok(data, 201);
}

type ErrorBody = {
  message: string;
  code?: string;
  fields?: Record<string, string[]>;
};

export function fail(
  message: string,
  status: number,
  extra?: Omit<ErrorBody, "message">,
): NextResponse {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

/** 400 from a Zod failure, flattening field errors for the client form. */
export function validationError(
  error: z.ZodError,
  message: string,
): NextResponse {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    (fields[key] ??= []).push(issue.message);
  }
  return fail(message, 400, { code: "VALIDATION_ERROR", fields });
}
