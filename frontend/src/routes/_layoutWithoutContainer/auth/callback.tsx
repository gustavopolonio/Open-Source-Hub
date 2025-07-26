import { useEffect } from "react";
import {
  createFileRoute,
  useSearch,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { Typography } from "@/components/ui/typography";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_layoutWithoutContainer/auth/callback")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthCallback,
});

function AuthCallback() {
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const search: { token: string; oauthCsrf: string; redirectTo: string } =
    useSearch({ from: "/_layoutWithoutContainer/auth/callback" });

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
    <div className="h-screen flex flex-col items-center justify-center mx-auto max-w-lg py-16 space-y-4">
      <Typography>Authenticating...</Typography>
      <Spinner />
    </div>
  );
}
