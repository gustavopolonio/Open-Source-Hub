import { useEffect } from "react";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const search: { token: string } = useSearch({ from: "/auth/callback" });

  useEffect(() => {
    const accessToken = search.token;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      navigate({ to: "/" });
    } else {
      navigate({ to: "/login" });
    }
  }, [search, navigate]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center max-w-lg mx-auto py-16 space-y-10">
      Redirecting to Open Source Hub...
    </div>
  );
}
