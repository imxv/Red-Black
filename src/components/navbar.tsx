"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const getAvatarFallback = (name?: string | null, email?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-400">
              <span className="text-lg font-bold text-slate-900">红</span>
            </div>
            <span className="text-lg font-semibold text-foreground">爬宠红黑榜</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isPending ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-900/5" />
            ) : session?.user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  欢迎，{session.user.name || session.user.email}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 rounded-lg p-1 hover:bg-slate-100 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      {session.user.image && (
                        <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                      )}
                      <AvatarFallback className="bg-slate-200 text-slate-900 text-sm">
                        {getAvatarFallback(session.user.name, session.user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border/40 bg-white py-2 shadow-xl z-20">
                        <div className="px-4 py-2 border-b border-border/40">
                          <p className="text-sm font-medium text-foreground truncate">
                            {session.user.name || "用户"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push("/settings");
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-slate-100 transition-colors"
                        >
                          个人设置
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleSignOut();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-slate-100 transition-colors"
                        >
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">登录</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">注册</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {!isPending && (
              session?.user ? (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    {session.user.image && (
                      <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                    )}
                    <AvatarFallback className="bg-slate-200 text-slate-900 text-sm">
                      {getAvatarFallback(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                <Link href="/auth/signin">
                  <Button size="sm">登录</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && session?.user && (
        <>
          <div
            className="fixed inset-0 z-10 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-4 mt-2 w-64 rounded-lg border border-border/40 bg-white py-2 shadow-xl z-20 md:hidden">
            <div className="px-4 py-3 border-b border-border/40">
              <p className="text-sm font-medium text-foreground truncate">
                {session.user.name || "用户"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/settings");
              }}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-slate-100 transition-colors"
            >
              个人设置
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleSignOut();
              }}
              className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-slate-100 transition-colors"
            >
              退出登录
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
