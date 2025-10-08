import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

// 导出常用的 hooks
export const { useSession, signIn, signUp, signOut } = authClient;
