import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "harmocrew-session";

export function useAuth() {
  return useContext(AuthContext);
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define o header antes de qualquer requisicao das paginas.
  setAuthToken(session?.token);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      if (!session?.token) {
        setArtist(null);
        setIsLoading(false);
        return;
      }
      try {
        // A API nao tem /me: o artista vinculado ao login valida o token.
        const nextArtist = session.user.artistId
          ? await api.artists.get(session.user.artistId)
          : null;
        if (isMounted) {
          setArtist(nextArtist);
        }
      } catch (error) {
        if (isMounted && error?.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEY);
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    validateSession();
    return () => {
      isMounted = false;
    };
  }, [session]);

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      artist,
      isLoading,
      login: (authResponse) => {
        const nextSession = {
          token: authResponse.token,
          user: {
            userId: authResponse.userId,
            artistId: authResponse.artistId,
            name: authResponse.name,
            email: authResponse.email,
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setAuthToken(nextSession.token);
        setIsLoading(true);
        setSession(nextSession);
      },
      logout: async () => {
        try {
          if (session?.token) {
            await api.auth.logout();
          }
        } catch (error) {
          // O token pode ja estar expirado; a sessao local e limpa de qualquer forma.
        } finally {
          localStorage.removeItem(STORAGE_KEY);
          setAuthToken(null);
          setSession(null);
          setArtist(null);
        }
      },
      setArtist,
    }),
    [artist, isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
