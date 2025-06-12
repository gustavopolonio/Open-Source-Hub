import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@/lib/axios";

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const isAuthenticated = !!accessToken;

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.patch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/token/refresh`,
        {},
        { withCredentials: true }
      );
      setAccessToken(response.data.token);
    } catch (error) {
      setAccessToken(null);
      console.log("Refresh failed", error);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshToken();
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, isAuthenticated, isLoadingAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
