import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

/**
 * Sign-out control. Uses a server action so the session cookie is cleared on
 * the server; redirects to the home page afterward.
 */
export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        {ar.actions.signOut}
      </Button>
    </form>
  );
}
