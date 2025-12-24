// ./src/app/page.tsx
"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useSession, signIn } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { PageTransition } from "@/components/ui/PageTransition";
import { motion } from "framer-motion";

// Define authentication states
type AuthState =
  | "initial"
  | "connecting"
  | "signing"
  | "authenticating"
  | "registered"
  | "pending"
  | "error";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const { status, data: session } = useSession();
  const { t } = useLanguage();

  const [authState, setAuthState] = useState<AuthState>("initial");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // signingRef 用于防止重复发起签名请求（锁）
  const signingRef = useRef(false);
  // mountedRef 用于避免在组件卸载后 setState
  const mountedRef = useRef(true);

  useEffect(() => {
    // 在卸载时标记
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function checkAuth() {
      if (!isConnected || !address) return;

      // 如果已有签名进行中，直接返回，避免重复请求（例如 StrictMode 导致的双触发）
      if (signingRef.current) {
        console.log("签名请求已在进行中，跳过重复发起");
        return;
      }

      try {
        signingRef.current = true; // 上锁
        if (mountedRef.current) setAuthState("signing");
        setErrorMessage(null);

        const message = "login arrowtower";
        // 发起签名
        const signature = await signMessageAsync({ message });

        if (mountedRef.current) setAuthState("authenticating");

        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, signature }),
        });

        const data = await response.json();

        if (data?.token) {
          // 使用 next-auth 的 credentials 登录（不重定向）
          await signIn("credentials", {
            address,
            signature,
            redirect: false,
          });
          if (mountedRef.current) setAuthState("registered");
        } else if (data?.status === "not_found") {
          if (mountedRef.current) setAuthState("pending");
          // 引导到注册页
          router.push("/register");
        } else {
          if (mountedRef.current) {
            setAuthState("error");
            setErrorMessage("Unknown authentication status or rejected user.");
          }
        }
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        console.error("Auth check failed:", err);

        // 常见钱包提示：already pending / user rejected / denied 等
        if (
          msg.includes("already pending") ||
          msg.includes("Request of type 'personal_sign'") ||
          msg.includes("personal_sign already pending")
        ) {
          // 钱包中已有未完成签名
          if (mountedRef.current) {
            setAuthState("signing");
            setErrorMessage(t('home.walletPending'));
          }
        } else if (
          msg.toLowerCase().includes("user rejected") ||
          msg.toLowerCase().includes("denied") ||
          msg.toLowerCase().includes("rejected")
        ) {
          if (mountedRef.current) {
            setAuthState("error");
            setErrorMessage(t('home.userRejected'));
          }
        } else {
          if (mountedRef.current) {
            setAuthState("error");
            setErrorMessage(err instanceof Error ? err.message : t('home.authFailed'));
          }
        }
      } finally {
        // 解锁，允许后续尝试（如果你希望保持锁直到用户在钱包中处理完再解锁，可改为在用户动作后手动清理）
        signingRef.current = false;
      }
    }

    if (isConnected) {
      if (mountedRef.current) setAuthState("connecting");
      checkAuth();
    } else {
      // 如果断开连接，恢复初始态
      if (mountedRef.current) {
        setAuthState("initial");
        setErrorMessage(null);
      }
    }
    // 监听 isConnected 和 address 的变化来触发认证流程
  }, [isConnected, address, router, signMessageAsync, t]);

  useEffect(() => {
    // 当 session 可用时，根据 role 跳转
    if (session?.user) {
      const { role } = session.user as any;
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    }
  }, [session, router]);

  // Background component
  const Background = () => (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100/50" />
  );

  // Render different UI based on authentication state
  const renderAuthContent = () => {
    // Shared container class
    const containerClass = "flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden";
    
    // Language switcher absolute position
    const langSwitcher = (
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
    );

    switch (authState) {
      case "initial":
        return (
          <div className={containerClass}>
            <Background />
            {langSwitcher}
            
            <PageTransition className="flex flex-col items-center max-w-lg w-full">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 mb-2 text-center"
              >
                {t('home.title')}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-emerald-600/80 font-medium text-lg mb-8 text-center max-w-md"
              >
                {t('home.subtitle')}
              </motion.p>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mb-10 relative group"
              >
                <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                  <Image
                    src="/arrowtower.jpg"
                    alt="ArrowTower"
                    width={400}
                    height={400}
                    priority
                    className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full flex flex-col items-center"
              >
                <p className="mb-6 text-gray-600 font-medium text-lg text-center">{t('home.connectPrompt')}</p>
                <div className="w-full max-w-xs transform hover:scale-105 transition-transform duration-200">
                  <ConnectWallet />
                </div>
              </motion.div>
            </PageTransition>
          </div>
        );

      case "connecting":
        return (
          <div className={containerClass}>
            <Background />
            <PageTransition className="text-center bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/50">
              <p className="text-2xl font-bold mb-6 text-emerald-800">{t('home.connecting')}</p>
              <div className="relative w-20 h-20 mx-auto">
                 <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </PageTransition>
          </div>
        );

      case "signing":
        return (
          <div className={containerClass}>
            <Background />
            <PageTransition className="text-center bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/50 max-w-md">
              <p className="text-2xl font-bold mb-4 text-emerald-800">{t('home.signing')}</p>
              <div className="animate-pulse text-emerald-600 font-medium mb-4">{t('home.signPrompt')}</div>
              {errorMessage && (
                <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-sm border border-amber-200">
                  {errorMessage}
                </div>
              )}
            </PageTransition>
          </div>
        );

      case "authenticating":
        return (
          <div className={containerClass}>
            <Background />
            <PageTransition className="text-center bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/50">
              <p className="text-2xl font-bold mb-6 text-emerald-800">{t('home.authenticating')}</p>
              <div className="relative w-20 h-20 mx-auto">
                 <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </PageTransition>
          </div>
        );

      case "pending":
        return (
          <div className={containerClass}>
            <Background />
            <PageTransition className="text-center bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/50">
              <p className="text-2xl font-bold mb-4 text-emerald-800">{t('home.registering')}</p>
              <p className="text-gray-600">Please complete registration...</p>
            </PageTransition>
          </div>
        );

      case "error":
        return (
          <div className={containerClass}>
            <Background />
            <PageTransition className="text-center bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-red-100 max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <p className="text-2xl font-bold mb-4 text-red-600">{t('home.authFailed')}</p>
              {errorMessage && <p className="text-gray-600 mb-6 bg-red-50 p-3 rounded-lg text-sm">{errorMessage}</p>}
              <button
                onClick={() => {
                  setAuthState("initial");
                  setErrorMessage(null);
                }}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 font-bold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {t('home.retry')}
              </button>
            </PageTransition>
          </div>
        );

      default:
        return null;
    }
  };

  return renderAuthContent();
}
