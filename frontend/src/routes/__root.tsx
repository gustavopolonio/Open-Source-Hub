import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Header } from "@/components/layout/Header";
import type { AuthContextType } from "@/context/AuthProvider";

export const Route = createRootRouteWithContext<AuthContextType>()({
  component: () => (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
