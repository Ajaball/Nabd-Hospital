import type { APIRequestContext, Page } from "@playwright/test";

/**
 * Log a user in through the Auth.js credentials endpoint using an API request
 * context. Cookies are stored on the context, so subsequent requests (and, when
 * the context is shared with a page via storageState, the browser) are
 * authenticated.
 */
export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  const csrfRes = await request.get("/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();
  await request.post("/api/auth/callback/credentials", {
    form: { csrfToken, email, password, callbackUrl: "/" },
  });
}

export function uniqueSuffix(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/**
 * A unique fictional national ID: "9" + 9 fast-varying digits (last digits of a
 * time+random number). Tests run in parallel, so the id must not collide.
 */
export function uniqueNationalId(): string {
  const n = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
  return `9${n.slice(-9)}`;
}

/** Discover a doctor's id by intercepting the slots XHR on the booking step. */
export async function discoverDoctorId(
  page: Page,
  deptSlug: string,
  doctorSlug: string,
): Promise<string> {
  const slotsReq = page.waitForRequest(/\/api\/v1\/doctors\/.*\/slots/);
  await page.goto(`/book?step=datetime&dept=${deptSlug}&doctor=${doctorSlug}`);
  return new URL((await slotsReq).url()).pathname.split("/")[4];
}

/** First available slot for a doctor on an upcoming Sun–Thu date (>2h out). */
export async function firstAvailableSlot(
  request: APIRequestContext,
  doctorId: string,
): Promise<string | null> {
  for (let i = 2; i < 21; i++) {
    const d = new Date(Date.now() + i * 86400000);
    if (d.getUTCDay() > 4) continue;
    const iso = d.toISOString().slice(0, 10);
    const res = await request.get(`/api/v1/doctors/${doctorId}/slots?date=${iso}`);
    const json = await res.json();
    const free = (json.data?.slots ?? []).find(
      (s: { isAvailable: boolean }) => s.isAvailable,
    );
    if (free) return free.startsAt as string;
  }
  return null;
}

export async function registerPatient(
  request: APIRequestContext,
): Promise<{ email: string; password: string; fileNumber: string }> {
  const suffix = uniqueSuffix();
  const email = `e2e-${suffix}@example.com`;
  const password = "Str0ngPass1";
  const res = await request.post("/api/v1/auth/register", {
    data: {
      fullName: "مريض اختبار شامل",
      email,
      password,
      phone: "0501234567",
      nationalId: uniqueNationalId(),
      dateOfBirth: "1990-01-01",
      gender: "MALE",
    },
  });
  const json = await res.json();
  return { email, password, fileNumber: json.data.fileNumber };
}
