import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { AuthContextType } from "@/context/AuthProvider";
import { Typography } from "@/components/ui/typography";

export const Route = createRootRouteWithContext<AuthContextType>()({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="h-screen flex items-center justify-center">
      <Typography variant="h1" className="text-2xl pr-6 mr-6 border-r">
        404
      </Typography>
      <Typography variant="h2" className="text-sm">
        This page could not be found.
      </Typography>
    </div>
  ),
});
