import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { Button } from "../ui/button";
import { Logo } from "../ui/logo";
import { Typography } from "../ui/typography";
import { Skeleton } from "../ui/skeleton";
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

export type User = {
  user: {
    name: string;
    avatarUrl: string;
    email: string;
    bio: string;
  };
};

export function Header() {
  const { isAuthenticated } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { data, isError, isPending } = useQuery<User>({
    queryKey: ["user"],
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      const response = await axiosPrivate.get("/users/me");
      return response.data;
    },
  });

  const isLoginPage = pathname === "/login";

  return (
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
                  <AvatarImage src={data.user.avatarUrl} alt={data.user.name} />
                  <AvatarFallback>{data.user.name.slice(0, 2)}</AvatarFallback>
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
                <DropdownMenuItem className="p-0">
                  <Link to="/account" className="w-full px-2 py-1.5">
                    Account settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="p-0">
                  <Link to="/projects" className="w-full px-2 py-1.5">
                    All projects
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link to="/projects/submit" className="w-full px-2 py-1.5">
                    Submit your project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link to="/" className="w-full px-2 py-1.5">
                    Homepage
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="p-0">
                  <Link
                    to="/login"
                    className="flex items-center justify-between w-full px-2 py-1.5"
                  >
                    Log out
                    <LogOut />
                  </Link>
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
          <Link to="/login">Log in</Link>
        </Button>
      )}
    </div>
  );
}
