"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

/** Signs the current user out and returns them to the home page. */
export function SignOutButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
      {ar.auth.signOut}
    </Button>
  );
}
