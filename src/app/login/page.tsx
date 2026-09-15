"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Invalid credentials");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex bg-base text-text-primary selection:bg-text-primary selection:text-base font-sans">
      
      {/* Left panel: Structural / Brand presence */}
      <div className="hidden lg:flex flex-col justify-between w-1/3 border-r border-border p-8 lg:p-12">
        <div>
          <div className="h-4 w-4 bg-text-primary mb-8" />
          <h1 className="text-3xl font-light tracking-tight leading-none">
            PHS<br/>
            <span className="text-text-muted">Command</span>
          </h1>
        </div>
        
        <div className="font-mono text-xs text-text-muted space-y-1">
          <p>SYS_VER 0.1.0</p>
          <p>CLIENT_MONITORING_ACTIVE</p>
          <p>RESTRICTED_ACCESS</p>
        </div>
      </div>

      {/* Right panel: The Gateway */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 relative">
        
        {/* Top-right subtle indicator */}
        <div className="absolute top-8 right-8 lg:top-12 lg:right-12 font-mono text-[10px] tracking-widest text-text-muted uppercase">
          Admin Gateway
        </div>

        <div className="w-full max-w-xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tighter mb-12">
            Authenticate
          </h2>

          <form onSubmit={handleLogin} className="space-y-10 group/form">
            
            <div className="space-y-4">
              <div className="relative group/input">
                <label className="font-mono text-xs uppercase tracking-widest text-text-muted absolute -top-5 left-0 transition-colors group-focus-within/input:text-text-primary">
                  Identity
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@phs.com"
                  className="w-full bg-transparent border-b border-border py-3 text-lg sm:text-xl font-medium focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="relative group/input pt-6">
                <label className="font-mono text-xs uppercase tracking-widest text-text-muted absolute top-1 left-0 transition-colors group-focus-within/input:text-text-primary">
                  Passkey
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-border py-3 text-lg sm:text-xl font-medium focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="h-6">
                {error && (
                  <span className="font-mono text-xs text-danger uppercase tracking-wider animate-in fade-in slide-in-from-left-2">
                    [Err] {error}
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="group flex items-center gap-3 bg-text-primary text-base px-6 py-3 rounded-none font-medium hover:bg-text-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Enter</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
      
    </div>
  );
}
