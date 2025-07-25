import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { generateAndSessionStoreCsrfToken } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export const Route = createFileRoute("/signup")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: Signup,
});

function Signup() {
  const csrfToken = generateAndSessionStoreCsrfToken();
  const oauthState = btoa(JSON.stringify({ redirectTo: "/", csrfToken }));

  return (
    <div className="flex flex-col items-center max-w-lg w-full mx-auto space-y-10">
      <Typography variant="h1" className="text-center">
        Sign up for
        <span className="block">Open Source Hub</span>
      </Typography>
      <Button size="lg" variant="secondary" className="w-80 font-bold" asChild>
        <a
          href={`${import.meta.env.VITE_GITHUB_BASE_URL}/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&state=${encodeURIComponent(oauthState)}`}
        >
          Continue with GitHub
        </a>
      </Button>
      <Typography variant="p">
        Don't have an account?{" "}
        <Button asChild variant="link" className="p-0">
          <Link to="/login" search={{ redirectTo: "/" }}>
            Log in
          </Link>
        </Button>
      </Typography>
    </div>
  );
}
