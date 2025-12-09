// /src/components/maps/ArrowTowerHeader.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect, useReconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function ArrowTowerHeader() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { reconnect, status } = useReconnect();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [autoReconnectCount, setAutoReconnectCount] = useState(0);
  const reconnectAttempted = useRef(false);
  
  // 引入多语言
  const { t } = useLanguage();

  // 自动重连逻辑
  useEffect(() => {
    // 如果用户有 session 但钱包未连接，且未超过重连次数限制
    if (session && !isConnected && autoReconnectCount < 3 && !reconnectAttempted.current) {
      reconnectAttempted.current = true;
      
      const timer = setTimeout(() => {
        console.log(`尝试自动重连钱包 (${autoReconnectCount + 1}/3)...`);
        const metaMaskConnector = metaMask();
        reconnect({ connectors: [metaMaskConnector] });
        setAutoReconnectCount(prev => prev + 1);
        reconnectAttempted.current = false;
      }, 1000); // 延迟1秒后重连，避免过于频繁

      return () => clearTimeout(timer);
    }
  }, [session, isConnected, autoReconnectCount, reconnect]);

  // 当连接成功时重置重连计数
  useEffect(() => {
    if (isConnected) {
      setAutoReconnectCount(0);
      reconnectAttempted.current = false;
    }
  }, [isConnected]);

  // 处理手动重连钱包
  const handleReconnect = () => {
    const metaMaskConnector = metaMask();
    reconnect({ connectors: [metaMaskConnector] });
    // 手动重连时重置自动重连计数
    setAutoReconnectCount(0);
    reconnectAttempted.current = false;
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // 1. 断开钱包连接
      if (isConnected) {
        await disconnect();
      }
      
      // 2. 退出 NextAuth 会话
      await signOut({ redirect: false });
      
      // 3. 重置重连计数
      setAutoReconnectCount(0);
      reconnectAttempted.current = false;
      
      // 4. 跳转到首页
      router.push('/');
    } catch (error) {
      console.error('退出失败:', error);
      // 即使失败也跳转
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Card className="mb-4 p-4 bg-white/90 backdrop-blur-md shadow-xl border-2 border-emerald-200/50 max-w-6xl mx-auto rounded-2xl transition-all duration-300 hover:shadow-emerald-100/50">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              🗺️ {t('home.title')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* 显示钱包地址 */}
            {(address || session?.user?.address) && (
              <Badge variant="outline" className="border-emerald-600/50 text-emerald-700 bg-emerald-50/50">
                💼 {(address || session?.user?.address)?.slice(0, 6)}...
                {(address || session?.user?.address)?.slice(-4)}
              </Badge>
            )}
            
            {/* 连接状态指示 */}
            {isConnected ? (
              <Badge className="bg-emerald-600 text-white shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  {t('common.walletConnected')}
                </div>
              </Badge>
            ) : (
              <>
                <Button
                  onClick={handleReconnect}
                  disabled={status === 'pending'}
                  variant="outline"
                  size="sm"
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-6 px-2 text-xs"
                >
                  <RefreshCcw className="w-3 h-3 mr-1" />
                  {status === 'pending' ? t('home.connecting') : t('common.connectWallet')}
                </Button>
                {/* 显示自动重连尝试次数 */}
                {session && autoReconnectCount > 0 && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700 text-xs">
                    Retry {autoReconnectCount}/3
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 语言切换器 */}
          <LanguageSwitcher />

          {/* 登出按钮 */}
          {(isConnected || session) && (
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              size="sm"
              className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold ml-2 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
