'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { translateData } from '@/lib/i18n/dataTranslations';
import { Map, Flag } from 'lucide-react';

interface Route {
  id: string;
  name: string;
  description: string | null;
  poiCount: number;
}

interface RouteSelectorProps {
  routes: Route[];
  selectedRoute: string;
  onSelectRoute: (routeId: string) => void;
  completedCount?: number;
}

export function RouteSelector({ 
  routes, 
  selectedRoute, 
  onSelectRoute,
  completedCount = 0 
}: RouteSelectorProps) {
  const { t, locale } = useLanguage();

  if (routes.length === 0) {
    return null;
  }

  // 如果只有一个路线，显示卡片样式
  if (routes.length === 1) {
    const route = routes[0];
    return (
      <Card className="p-6 bg-white/95 backdrop-blur-md shadow-xl border border-stone-200/50 rounded-2xl transition-all hover:shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <Map className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-stone-800">{t('route.currentRoute')}</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="font-bold text-emerald-700 text-xl mb-1">{translateData(route.name, 'routes', locale)}</p>
            <p className="text-stone-600 text-sm leading-relaxed">{translateData(route.description, 'descriptions', locale)}</p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
              <Flag className="w-3 h-3 mr-1" />
              {route.poiCount} {t('route.checkpoints')}
            </Badge>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700">
              {t('route.completed')} {completedCount}
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  // 多个路线时显示选择器
  return (
    <Card className="p-6 bg-white/95 backdrop-blur-md shadow-xl border border-stone-200/50 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
          <Map className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-lg text-stone-800">{t('route.selectRoute')}</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <button
            key={route.id}
            onClick={() => onSelectRoute(route.id)}
            className={`
              relative p-5 rounded-xl border text-left transition-all duration-300 group
              ${selectedRoute === route.id 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-200/50 scale-[1.02]' 
                : 'bg-stone-50 hover:bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:shadow-md'
              }
            `}
          >
            <div className="space-y-3">
              <div>
                <p className={`font-bold text-lg ${selectedRoute === route.id ? 'text-white' : 'text-stone-800 group-hover:text-emerald-700'}`}>
                  {translateData(route.name, 'routes', locale)}
                </p>
                {route.description && (
                  <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${selectedRoute === route.id ? 'text-emerald-50' : 'text-stone-500'}`}>
                    {translateData(route.description, 'descriptions', locale)}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  className={selectedRoute === route.id 
                    ? 'bg-white/20 text-white border border-white/20' 
                    : 'bg-white text-stone-600 border border-stone-200'
                  }
                >
                  <Flag className="w-3 h-3 mr-1" />
                  {route.poiCount}
                </Badge>
                {selectedRoute === route.id && completedCount > 0 && (
                  <Badge className="bg-white/20 text-white border border-white/20">
                    ✓ {completedCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
