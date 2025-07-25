import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageContainer } from "@/components/layout/PageContainer";
import type { AuthContextType } from "@/context/AuthProvider";

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
});
