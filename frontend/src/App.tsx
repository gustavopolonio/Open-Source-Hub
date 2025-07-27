import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    accessToken: null,
    setAccessToken: () => {},
    isAuthenticated: false,
    isLoadingAuth: true,
  },
  notFoundMode: "root",
  scrollRestoration: true,
});

function InnerApp() {
  const auth = useAuth();
  if (auth.isLoadingAuth) return null;
  return <RouterProvider router={router} context={auth} />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
