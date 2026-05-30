import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

const SESSION_KEY = "spj_blog_session";

export function getBlogSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setBlogSessionToken(token: string) {
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch {}
}

export function clearBlogSessionToken() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function useBlogAuth() {
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    getBlogSessionToken()
  );

  const { data: member, isLoading, refetch } = trpc.blogMembers.me.useQuery(
    { sessionToken: sessionToken! },
    { enabled: !!sessionToken }
  );

  const logoutMutation = trpc.blogMembers.logout.useMutation();

  const logout = useCallback(async () => {
    if (sessionToken) {
      await logoutMutation.mutateAsync({ sessionToken });
    }
    clearBlogSessionToken();
    setSessionToken(null);
  }, [sessionToken, logoutMutation]);

  const login = useCallback(
    (token: string) => {
      setBlogSessionToken(token);
      setSessionToken(token);
    },
    []
  );

  return {
    member: member ?? null,
    isLoading: !!sessionToken && isLoading,
    isLoggedIn: !!member,
    sessionToken,
    login,
    logout,
    refetch,
  };
}
