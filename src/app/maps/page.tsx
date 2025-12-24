// /app/maps/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapViewer, POIInfo } from '@/components/maps/MapViewer';
import { POIDetailModal, POI } from '@/components/maps/POIDetailModal';
import { WalletConnector } from '@/components/maps/WalletConnector';
import { SignatureConfirm } from '@/components/maps/SignatureConfirm';
import { CheckinProgress } from '@/components/maps/CheckinProgress';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { PageTransition } from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';

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

// 声明 window.ethereum 类型
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function MapsPage() {
  const { t } = useLanguage();

  // 状态管理
  const [selectedPOI, setSelectedPOI] = useState<POIInfo | null>(null);
  const [poiData, setPOIData] = useState<POI | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
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
          // 使用默认位置
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
          // 自动选择第一条路线
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

  // 加载 POI 数据
  useEffect(() => {
    if (selectedRoute) {
      const fetchPOIs = async () => {
        try {
          const response = await fetch(`/api/pois?routeId=${selectedRoute}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            setPois(result.data);
          }
        } catch (error) {
          console.error('获取打卡点失败:', error);
        }
      };
      fetchPOIs();
    }
  }, [selectedRoute]);

  // 连接钱包
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showNotification('error', t('common.installWallet'));
      return;
    }

    try {
      setIsLoading(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setWalletAddress(accounts[0]);
      setIsWalletConnected(true);
      showNotification('success', t('common.walletConnected'));
    } catch (error) {
      console.error('连接钱包失败:', error);
      showNotification('error', 'Wallet connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理地图点击
  const handlePOIClick = (poiInfo: POIInfo) => {
    setSelectedPOI(poiInfo);
    
    // 根据 POI 编号查找对应的 POI 数据
    const matchedPOI = pois.find(poi => poi.order === parseInt(poiInfo.poiNumber));
    setPOIData(matchedPOI || null);
  };

  // 开始打卡流程
  const handleStartCheckin = () => {
    if (!isWalletConnected) {
      showNotification('error', t('common.connectPrompt'));
      return;
    }

    if (!poiData) {
      showNotification('error', t('common.error'));
      return;
    }

    setShowSignatureDialog(true);
  };

  // 生成签名消息
  const generateSignatureMessage = (poiId: string) => {
    const nonce = Math.random().toString(36).substring(7);
    return `ArrowTower Checkin: poi=${poiId}, nonce=${nonce}, timestamp=${Date.now()}`;
  };

  // 使用 MetaMask 签名
  const signMessage = async (messageToSign: string) => {
    if (!isWalletConnected || !walletAddress) {
      throw new Error(t('common.connectWallet'));
    }

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [messageToSign, walletAddress],
      });
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw new Error(t('home.userRejected'));
    }
  };

  // 确认签名并提交打卡
  const handleConfirmSignature = async () => {
    if (!poiData) return;

    setIsLoading(true);
    try {
      // 生成签名消息
      const message = generateSignatureMessage(poiData.id);
      
      // 请求签名
      const signature = await signMessage(message);
      
      showNotification('success', t('home.signing'));

      // 提交打卡
      const submitData = {
        routeId: selectedRoute,
        poiId: poiData.id,
        walletAddress,
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

      console.log('提交打卡数据:', JSON.stringify(submitData, null, 2));

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
        
        // 添加到已完成列表
        if (poiData) {
          setCompletedPOIs(prev => new Set([...prev, poiData.order]));
        }
      } else {
        showNotification('error', result.message || t('common.error'));
      }
    } catch (error: any) {
      console.error('打卡失败:', error);
      showNotification('error', error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-4 relative">
       {/* 语言切换器 */}
       <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <PageTransition className="max-w-[98vw] mx-auto px-2 sm:px-4">
        {/* 通知栏 */}
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-2xl border ${
              notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400' :
              notification.type === 'error' ? 'bg-red-500/90 border-red-400' : 'bg-amber-500/90 border-amber-400'
            } text-white max-w-md backdrop-blur-md`}
          >
            <p className="font-semibold">{notification.message}</p>
          </motion.div>
        )}

        {/* 头部 - 紧凑 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4 pt-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-700 mb-1">
             {t('user.title')}
          </h1>
          <p className="text-gray-600 font-medium">{t('user.subtitle')}</p>
        </motion.div>

        {/* 地图居中显示 - 限制宽度 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 max-w-6xl mx-auto"
        >
          <MapViewer
            mapSvgUrl="/map.svg"
            onPOIClick={handlePOIClick}
            routePOIs={pois.map(poi => poi.order)}
            completedPOIs={completedPOIs}
          />
        </motion.div>

        {/* 底部：控制面板 - 水平排列，宽度与地图一致 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto"
        >
          {/* 钱包连接 */}
          <WalletConnector
            isConnected={isWalletConnected}
            walletAddress={walletAddress}
            onConnect={connectWallet}
            isLoading={isLoading}
          />

          {/* 路线信息 */}
          {selectedRoute && routes.length > 0 && (
            <Card className="p-5 bg-white/80 backdrop-blur-sm shadow-lg border-2 border-emerald-200">
              <h3 className="font-bold mb-3 text-emerald-900">{t('user.currentRoute')}</h3>
              {routes.find(r => r.id === selectedRoute) && (
                <div className="space-y-2 text-sm">
                  <p className="font-bold text-emerald-700">
                    {routes.find(r => r.id === selectedRoute)?.name}
                  </p>
                  <p className="text-gray-700">
                    {routes.find(r => r.id === selectedRoute)?.description}
                  </p>
                  <p className="text-gray-600 font-medium">
                    {routes.find(r => r.id === selectedRoute)?.poiCount} {t('user.points')}
                  </p>
                </div>
              )}
            </Card>
          )}
        </motion.div>

        {/* 打卡结果 - 与地图宽度一致 */}
        {checkinResult && (
          <div className="mt-4 max-w-6xl mx-auto">
            <CheckinProgress result={checkinResult} />
          </div>
        )}

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
