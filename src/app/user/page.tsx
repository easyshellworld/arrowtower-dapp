// /app/user/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAccount, useSignMessage } from 'wagmi';
import { MapViewer, POIInfo } from '@/components/maps/MapViewer';
import { POIDetailModal, POI } from '@/components/maps/POIDetailModal';
import { SignatureConfirm } from '@/components/maps/SignatureConfirm';
import { CheckinProgress } from '@/components/maps/CheckinProgress';
import { ArrowTowerHeader } from '@/components/maps/ArrowTowerHeader';
import { RouteSelector } from '@/components/maps/RouteSelector';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PageTransition } from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// 类型定义
interface Route {
  id: string;
  name: string;
  description: string | null;
  poiCount: number;
}

interface CheckinResponse {
  success: boolean;
  data?: {
    checkinId: string;
    status: string;
    poi: {
      id: string;
      name: string;
      order: number;
    };
    routeProgress: {
      completed: number;
      total: number;
      nextPOI: { id: string; name: string } | null;
      isRouteCompleted: boolean;
      completedPOIs?: Array<{ name: string; order: number }>;
    };
    nftStatus: {
      willMint: boolean;
      remainingPOIs: number;
    };
    timestamp: string;
  };
  message?: string;
  timestamp: string;
}

export default function UserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { t } = useLanguage();

  // 状态管理
  const [selectedPOI, setSelectedPOI] = useState<POIInfo | null>(null);
  const [poiData, setPOIData] = useState<POI | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkinResult, setCheckinResult] = useState<CheckinResponse | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [completedPOIs, setCompletedPOIs] = useState<Set<number>>(new Set());

  // 路线和 POI 数据
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  // 用户位置
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null>(null);

  // 保护路由
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // 显示通知
  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // 获取用户位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.warn('获取位置失败:', error);
          // 默认位置
          setUserLocation({
            latitude: 30.123567,
            longitude: 103.456890,
            accuracy: 12.5,
            timestamp: new Date().toISOString()
          });
        }
      );
    }
  }, []);

  // 加载路线数据
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/route_list?page=1&limit=20&isActive=true');
        const result = await response.json();
        
        if (result.success && result.data?.routes) {
          setRoutes(result.data.routes);
          if (result.data.routes.length > 0) {
            setSelectedRoute(result.data.routes[0].id);
          }
        }
      } catch (error) {
        console.error('获取路线失败:', error);
        showNotification('error', t('common.networkError'));
      }
    };
    fetchRoutes();
  }, [t]);

  // 加载 POI 数据和打卡记录
  useEffect(() => {
    if (selectedRoute && address) {
      const fetchPOIsAndCheckins = async () => {
        try {
          // 获取 POI 列表
          const poisResponse = await fetch(`/api/pois?routeId=${selectedRoute}`);
          const poisResult = await poisResponse.json();
          
          if (poisResult.success && poisResult.data) {
            // 过滤掉景点0（箭塔介绍），它不是打卡点
            const filteredPOIs = poisResult.data.filter((poi: POI) => poi.order !== 0);
            setPois(filteredPOIs);
          }

          // 获取该路线的打卡记录
          const checkinsResponse = await fetch(`/api/checkins?routeId=${selectedRoute}&status=approved`);
          const checkinsResult = await checkinsResponse.json();
          
          if (checkinsResult.success && checkinsResult.data?.checkins) {
            // 过滤出当前用户的打卡记录，并提取 POI order
            const userCheckins = checkinsResult.data.checkins.filter(
              (checkin: any) => 
                checkin.user?.walletAddress?.toLowerCase() === address?.toLowerCase() &&
                checkin.route?.id === selectedRoute
            );
            
            const completedOrders = new Set<number>(
              userCheckins.map((checkin: any) => checkin.poi.order as number)
            );
            
            console.log('📊 当前路线已完成的打卡:', Array.from(completedOrders), '用户:', address);
            setCompletedPOIs(completedOrders);
          } else {
            setCompletedPOIs(new Set());
          }
        } catch (error) {
          console.error('获取数据失败:', error);
        }
      };
      fetchPOIsAndCheckins();
    }
  }, [selectedRoute, address]);

  // 处理地图点击
  const handlePOIClick = (poiInfo: POIInfo) => {
    setSelectedPOI(poiInfo);
    const matchedPOI = pois.find(poi => poi.order === parseInt(poiInfo.poiNumber));
    setPOIData(matchedPOI || null);
  };

  // 开始打卡流程
  const handleStartCheckin = () => {
    if (!isConnected || !address) {
      showNotification('error', t('common.connectWallet'));
      return;
    }

    // 如果点击的 POI 不在当前路线上，给出友好提示
    if (!poiData) {
      showNotification('warning', t('poi.notInRoute'));
      return;
    }

    setShowSignatureDialog(true);
  };

  // 生成签名消息
  const generateSignatureMessage = (poiId: string) => {
    const nonce = Math.random().toString(36).substring(7);
    return `ArrowTower Checkin: poi=${poiId}, nonce=${nonce}, timestamp=${Date.now()}`;
  };

  // 确认签名并提交打卡
  const handleConfirmSignature = async () => {
    if (!poiData || !address) return;

    setIsLoading(true);
    try {
      const message = generateSignatureMessage(poiData.id);
      
      const signature = await signMessageAsync({ message });
      
      showNotification('success', t('common.success'));

      const submitData = {
        routeId: selectedRoute,
        poiId: poiData.id,
        walletAddress: address.toLowerCase().trim(),
        signature,
        message,
        location: userLocation,
        taskData: {
          type: poiData.taskType,
          answer: '',
          photoUrl: ''
        },
        deviceInfo: {
          fingerprint: `device_fp_${Math.random().toString(36).substring(2)}`,
          userAgent: navigator.userAgent
        }
      };

      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      setCheckinResult(result);

      if (result.success) {
        showNotification('success', t('user.checkinSuccess'));
        setShowSignatureDialog(false);
        setSelectedPOI(null);
        setPOIData(null);
        
        // 更新已完成的POI列表
        if (poiData) {
          setCompletedPOIs(prev => new Set([...prev, poiData.order]));
        }
      } else {
        showNotification('error', result.message || t('common.error'));
        
        setTimeout(() => {
          setCheckinResult(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('打卡失败:', error);
      showNotification('error', error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 加载中状态
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-emerald-800 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // 未登录重定向
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-4 relative font-sans">
      <div className="fixed inset-0 bg-stone-50/50 -z-10" />

      <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 通知栏 */}
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-4 z-50 p-4 rounded-xl shadow-2xl border ${
              notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400' :
              notification.type === 'error' ? 'bg-red-500/90 border-red-400' : 'bg-amber-500/90 border-amber-400'
            } text-white max-w-md backdrop-blur-md`}
          >
            <p className="font-semibold flex items-center gap-2">
              {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : '⚠️'}
              {notification.message}
            </p>
          </motion.div>
        )}

        {/* Header 组件 */}
        <div className="relative z-20 mb-8">
          <ArrowTowerHeader />
        </div>

        {/* 头部标题区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-800 mb-2 tracking-tight">
            {t('user.title')}
          </h1>
          <p className="text-stone-500 font-medium">{t('user.subtitle')}</p>
        </motion.div>

        {/* 主内容区域：网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          
          {/* 左侧/上方：地图 (占据2列) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 relative z-10"
          >
            <MapViewer
              mapSvgUrl="/map.svg"
              onPOIClick={handlePOIClick}
              routePOIs={pois.map(poi => poi.order)}
              completedPOIs={completedPOIs}
            />
          </motion.div>

          {/* 右侧/下方：控制面板 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* 1. 路线选择 */}
            {routes.length > 0 && (
              <RouteSelector
                routes={routes}
                selectedRoute={selectedRoute}
                onSelectRoute={setSelectedRoute}
                completedCount={completedPOIs.size}
              />
            )}

            {/* 2. 打卡进度 */}
            {selectedRoute && pois.length > 0 && (
              <CheckinProgress 
                result={checkinResult}
                completedPOIs={pois.filter(poi => completedPOIs.has(poi.order)).map(poi => ({
                  name: poi.name,
                  order: poi.order
                }))}
                routeName={routes.find(r => r.id === selectedRoute)?.name}
                totalPOIs={pois.length}
              />
            )}

            {/* 3. 前往NFT按钮 */}
            <div className="pt-4">
              <Button
                onClick={() => router.push('/user/checkmint')}
                className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
              >
                {t('user.viewNFT')} ➜
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* POI 详情对话框 */}
        {selectedPOI && (
          <POIDetailModal
            open={!!selectedPOI}
            onClose={() => {
              setSelectedPOI(null);
              setPOIData(null);
            }}
            poiNumber={selectedPOI.poiNumber}
            imageUrl={selectedPOI.imageUrl}
            poiData={poiData}
            onCheckin={handleStartCheckin}
            isLoading={isLoading}
            isCompleted={completedPOIs.has(parseInt(selectedPOI.poiNumber))}
          />
        )}

        {/* 签名确认对话框 */}
        <SignatureConfirm
          open={showSignatureDialog}
          onConfirm={handleConfirmSignature}
          onCancel={() => setShowSignatureDialog(false)}
          poiName={poiData?.name}
          isLoading={isLoading}
        />
      </PageTransition>
    </div>
  );
}
