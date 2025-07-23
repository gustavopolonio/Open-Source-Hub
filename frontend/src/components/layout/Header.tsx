import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Typography } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/@types/user";

export function Header() {
  const { isAuthenticated, setAccessToken } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const { data, isError, isPending } = useQuery<{ user: User }>({
    queryKey: ["user"],
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      const response = await axiosPrivate.get("/users/me");
      return response.data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/logout", {}, { withCredentials: true });
    },
    onSuccess() {
      setAccessToken(null);
      navigate({ to: "/" });
    },
    onError() {
      toast.error("Failed to logout");
    },
  });

  const isLoginPage = pathname === "/login";

  return (
    <header className="sticky top-0 border-b z-30 bg-background shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto h-16 px-4">
        <Link to="/">
          <Logo />
        </Link>

        {isAuthenticated ? (
          isError ? (
            <Typography variant="p" className="text-destructive">
              Failed to load user :(
            </Typography>
          ) : isPending ? (
            <Skeleton className="w-8 h-8 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={data.user.avatarUrl}
                      alt={data.user.name}
                    />
                    <AvatarFallback>
                      {data.user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <Typography variant="p" className="font-bold">
                    {data.user.name}
                  </Typography>
                  <Typography variant="p">{data.user.email}</Typography>
                </DropdownMenuLabel>

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="p-0">
                    <Link
                      to="/account"
                      className="w-full px-2 py-1.5 cursor-pointer"
                    >
                      Account settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="p-0">
                    <Link
                      to="/projects"
                      className="w-full px-2 py-1.5 cursor-pointer"
                    >
                      All projects
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-0">
                    <Link
                      to="/projects/submit"
                      className="w-full px-2 py-1.5 cursor-pointer"
                    >
                      Submit your project
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-0">
                    <Link to="/" className="w-full px-2 py-1.5 cursor-pointer">
                      Homepage
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="p-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer w-full justify-start focus-visible:border-none focus-visible:ring-0"
                      onClick={() => logoutMutation.mutate()}
                    >
                      Log out
                      <LogOut />
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        ) : isLoginPage ? (
          <Button asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/login" search={{ redirectTo: pathname }}>
              Log in
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
