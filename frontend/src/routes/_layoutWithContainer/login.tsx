import { useState } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useSearch,
} from "@tanstack/react-router";
import { generateAndSessionStoreCsrfToken } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export const Route = createFileRoute("/_layoutWithContainer/login")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: Login,
});

function Login() {
  const search: { redirectTo: string } = useSearch({
    from: "/_layoutWithContainer/login",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const redirectTo =
    search.redirectTo === "/signup" || !search.redirectTo
      ? "/"
      : search.redirectTo;

  function handleLogin() {
    setIsLoggingIn(true);

    const csrfToken = generateAndSessionStoreCsrfToken();
    const oauthState = btoa(JSON.stringify({ redirectTo, csrfToken }));

    window.location.href = `${import.meta.env.VITE_GITHUB_BASE_URL}/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&state=${encodeURIComponent(oauthState)}`;
  }

  return (
    <div className="flex flex-col items-center max-w-lg w-full mx-auto space-y-10">
      <Typography variant="h1" className="text-center">
        Log in to
        <span className="block">Open Source Hub</span>
      </Typography>

      <Button
        size="lg"
        variant="secondary"
        className="w-80 max-w-full font-bold"
        onClick={handleLogin}
        loading={isLoggingIn}
        disabled={isLoggingIn}
      >
        Continue with GitHub
      </Button>

      <Typography variant="p">
        Don't have an account?{" "}
        <Button asChild variant="link" className="p-0">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </Typography>
    </div>
  );
}
