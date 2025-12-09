'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { translateData } from '@/lib/i18n/dataTranslations';
import { Progress } from '@/components/ui/progress';
import { MapPin, Trophy, Navigation, Footprints } from 'lucide-react';

interface CheckinResult {
  success: boolean;
  data?: {
    poi: {
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
  };
  message?: string;
}

interface CheckinProgressProps {
  result: CheckinResult | null;
  completedPOIs?: Array<{ name: string; order: number }>;
  routeName?: string;
  totalPOIs?: number;
}

export function CheckinProgress({ result, completedPOIs = [], routeName, totalPOIs }: CheckinProgressProps) {
  const router = useRouter();
  const { t, locale } = useLanguage();

  // 监听 NFT 铸造状态，自动跳转
  useEffect(() => {
    if (result?.success && result.data?.nftStatus.willMint) {
      const timer = setTimeout(() => {
        router.push('/user/checkmint');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [result, router]);

  // 如果没有 result，显示基本的进度卡片
  if (!result) {
    const completed = completedPOIs.length;
    const total = totalPOIs || 3;
    const isRouteCompleted = completed >= total;
    const progress = (completed / total) * 100;
    
    return (
      <Card className="relative overflow-hidden bg-white/95 backdrop-blur-md shadow-xl border border-stone-200/50 rounded-2xl p-6 transition-all hover:shadow-2xl">
        {/* 顶部标题 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">
              {routeName ? translateData(routeName, 'routes', locale) : t('route.currentRoute')}
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              {t('progress.title')}
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600 font-medium">
                {t('progress.completedCount')}: {completed}/{total}
              </span>
              <span className="text-emerald-600 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
            
          {/* 已打卡的景点列表 */}
          {completedPOIs.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">{t('progress.checkedPOIs')}</p>
              <div className="flex flex-wrap gap-2">
                {completedPOIs.map((poi, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="pl-2 pr-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-1.5" />
                    {translateData(poi.name, 'pois', locale)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 状态提示卡片 */}
          {isRouteCompleted ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100/50 flex items-start gap-3">
              <Trophy className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm mb-1">{t('progress.congratulations')}</h4>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  {t('progress.allCompleted')} {t('progress.nftReward')}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-start gap-3">
              <Navigation className="w-5 h-5 text-stone-400 mt-0.5" />
              <div>
                <h4 className="font-bold text-stone-700 text-sm mb-1">
                  {completed === 0 ? t('progress.startExploring') : t('progress.keepGoing')}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {completed === 0 ? t('progress.clickToStart') : `${total - completed} ${t('progress.remaining')}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }
  
  // 有 result 时，显示详细的打卡结果
  const isRouteCompleted = result.data?.routeProgress.isRouteCompleted || false;
  const willMint = result.data?.nftStatus.willMint || false;
  const progress = result.data ? (result.data.routeProgress.completed / result.data.routeProgress.total) * 100 : 0;

  return (
    <Card className={`relative overflow-hidden bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-6 transition-all ${
      result.success ? 'border-t-4 border-t-emerald-500' : 'border-t-4 border-t-red-500'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${result.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {result.success ? <MapPin className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-800">
            {result.success ? t('user.checkinSuccess') : t('user.checkinFailed')}
          </h3>
          {result.success && result.data && (
            <p className="text-xs text-stone-500 font-medium">
              {translateData(result.data.poi.name, 'pois', locale)} <span className="opacity-60">(#{result.data.poi.order})</span>
            </p>
          )}
        </div>
      </div>
      
      {result.success && result.data && (
        <div className="space-y-6">
          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600 font-medium">
                {t('progress.routeProgress')}
              </span>
              <span className="text-emerald-600 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
            
          {/* 已打卡列表 */}
          {completedPOIs.length > 0 && (
            <div className="space-y-3">
               <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">{t('progress.checkedPOIs')}</p>
              <div className="flex flex-wrap gap-2">
                {completedPOIs.map((poi, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="pl-2 pr-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-1.5" />
                    {translateData(poi.name, 'pois', locale)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 结果状态卡片 */}
          {isRouteCompleted || willMint ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100/50 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Trophy className="w-5 h-5 text-amber-500 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm mb-1">{t('progress.congratulations')}</h4>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  {t('progress.allCompleted')}{willMint && ` ${t('progress.nftReward')}`}
                </p>
                {willMint && (
                  <p className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1">
                     {t('progress.redirecting')}
                  </p>
                )}
              </div>
            </div>
          ) : result.data.routeProgress.nextPOI && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-start gap-3">
              <Navigation className="w-5 h-5 text-stone-400 mt-0.5" />
              <div>
                <h4 className="font-bold text-stone-700 text-sm mb-1">{t('progress.nextPOI')}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {result.data.routeProgress.nextPOI.name}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!result.success && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-red-600 text-sm">
          {result.message || t('user.checkinFailed')}
        </div>
      )}
    </Card>
  );
}

// 辅助图标组件
function Info({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
