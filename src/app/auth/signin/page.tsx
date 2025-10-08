"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "登录失败，请检查邮箱和密码");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("登录失败，请稍后重试");
      console.error("登录错误:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_55%)] px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(at_top_left,_rgba(59,130,246,0.18),_transparent_55%)]" />
      
      <Card className="w-full max-w-md border-border/50 bg-slate-900/70 backdrop-blur-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">登录账户</CardTitle>
          <CardDescription className="text-center">
            使用邮箱登录您的账户
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-300">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              还没有账户？{" "}
              <Link href="/auth/signup" className="text-sky-400 hover:text-sky-300 transition-colors">
                立即注册
              </Link>
            </div>
            
            <div className="text-sm text-center">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                返回首页
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
