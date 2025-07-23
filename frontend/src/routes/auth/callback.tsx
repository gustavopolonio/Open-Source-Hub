import { useEffect } from "react";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const search: { token: string; oauthCsrf: string; redirectTo: string } =
    useSearch({ from: "/auth/callback" });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/logout", {}, { withCredentials: true });
    },
    onSuccess() {
      setAccessToken(null);
      navigate({ to: "/" });
      toast.error("Failed to login");
    },
    onError() {
      toast.error("Failed to logout");
    },
  });

  useEffect(() => {
    const csrfStored = sessionStorage.getItem("oauth_csrf");

    if (csrfStored !== search.oauthCsrf) {
      // Possible Cross-Site Request Forgery attack
      logoutMutation.mutate();
      return;
    }

    const accessToken = search.token;

    if (accessToken) {
      setAccessToken(accessToken);
      navigate({ to: search.redirectTo });
    } else {
      navigate({ to: "/login" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, navigate, setAccessToken, search.oauthCsrf]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center max-w-lg mx-auto py-16 space-y-10">
      Redirecting to Open Source Hub...
    </div>
  );
}
