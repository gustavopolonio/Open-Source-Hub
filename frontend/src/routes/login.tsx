import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center max-w-lg mx-auto py-16 space-y-10">
      <Typography variant="h1" className="text-center">
        Log in to
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
          <Link to="/signup">Sign Up</Link>
        </Button>
      </Typography>
    </div>
  );
}
