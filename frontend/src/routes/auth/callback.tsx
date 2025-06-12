import { useEffect } from "react";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const search: { token: string } = useSearch({ from: "/auth/callback" });

  useEffect(() => {
    const accessToken = search.token;

    if (accessToken) {
      setAccessToken(accessToken);
      navigate({ to: "/" });
    } else {
      navigate({ to: "/login" });
    }
  }, [search, navigate, setAccessToken]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center max-w-lg mx-auto py-16 space-y-10">
      Redirecting to Open Source Hub...
    </div>
  );
}
