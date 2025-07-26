import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layoutWithoutContainer")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
