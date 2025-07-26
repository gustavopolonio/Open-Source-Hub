import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { AuthContextType } from "@/context/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageContainer } from "@/components/layout/PageContainer";
import { Typography } from "@/components/ui/typography";

export const Route = createRootRouteWithContext<AuthContextType>()({
  component: () => (
    <>
      <Header />
      <PageContainer>
        <Outlet />
      </PageContainer>
      <Footer />
    </>
  ),
  notFoundComponent: () => (
    <div className="flex items-center justify-center">
      <Typography variant="h1" className="text-2xl pr-6 mr-6 border-r">
        404
      </Typography>
      <Typography variant="h2" className="text-sm">
        This page could not be found.
      </Typography>
    </div>
  ),
});
