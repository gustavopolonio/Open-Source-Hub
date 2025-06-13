import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: Signup,
});

function Signup() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center max-w-lg mx-auto py-16 space-y-10">
      <Typography variant="h1" className="text-center">
        Sign up for
        <span className="block">Open Source Hub</span>
      </Typography>
      <Button size="lg" variant="secondary" className="w-80 font-bold" asChild>
        <a
          href={`${import.meta.env.VITE_GITHUB_BASE_URL}/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}`}
        >
          Continue with GitHub
        </a>
      </Button>
      <Typography variant="p">
        Don't have an account?{" "}
        <Button asChild variant="link" className="p-0">
          <Link to="/login">Log in</Link>
        </Button>
      </Typography>
    </div>
  );
}
