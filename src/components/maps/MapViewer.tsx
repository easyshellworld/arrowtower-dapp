'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Loader2, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// SVG 地图文字翻译映射（包括分行显示的文字片段）
const SVG_TEXT_TRANSLATIONS: Record<string, string> = {
  // 完整名称
  "箭塔": "Arrow Tower",
  "箭塔村村史馆": "History Museum",
  "周先生的百草园": "Herb Garden",
  "山茶花社": "Camellia Society",
  // 分行文字 - 吾乡乡村创业孵化器
  "吾乡乡村": "Rural",
  "创业孵化器": "Incubator",
  // 分行文字 - 青年创客营地
  "青年": "Youth",
  "创客营地": "Maker Camp",
  // 分行文字 - 猫鼻子餐厅
  "猫鼻": "Cat's",
  "子餐厅": "Nose Cafe",
};

// ID 到 POI 编号的映射（根据 SVG 中的实际 id 和 ref 属性）
// text 元素：可点击触发详情对话框
// path 元素：圆点，显示打卡状态（变色）
const ID_TO_POI_MAP: { [key: string]: string } = {
  'text1-9-3': '0',    // ref0 → 箭塔介绍（特殊，不可打卡）
  'text1': '2',        // ref2="111"  → img_2.svg
  'text1-3': '9',      // ref9="111"  → img_9.svg
  'text1-9': '22',     // ref22="111" → img_22.svg
  'text1-32': '11',    // ref11="111" → img_11.svg
  'text1-7': '21',     // ref21="111" → img_21.svg
  'text1-92': '20',    // ref20="111" → img_20.svg
};

// path 圆点到 POI 编号的映射（用于显示打卡进度）
const PATH_TO_POI_MAP: { [key: string]: string } = {
  'path1': '21',   // 景点21
  'path2': '2',    // 景点2
  'path3': '9',    // 景点9
  'path4': '11',   // 景点11
  'path5': '22',   // 景点22
  'path6': '20',   // 景点20
};

export interface POIInfo {
  refId: string;
  poiNumber: string;
  imageUrl: string;
}

interface MapViewerProps {
  mapSvgUrl: string;
  onPOIClick: (poiInfo: POIInfo) => void;
  routePOIs?: number[];
  completedPOIs?: Set<number>;
  className?: string;
}

export function MapViewer({ 
  mapSvgUrl, 
  onPOIClick,
  routePOIs = [],
  completedPOIs = new Set(),
  className 
}: MapViewerProps) {
  const { t, locale } = useLanguage();
  console.log('🔵 MapViewer 组件渲染，mapSvgUrl:', mapSvgUrl);
  
  const [hoveredRef, setHoveredRef] = useState<string | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const onPOIClickRef = useRef(onPOIClick);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // 拖动状态
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    onPOIClickRef.current = onPOIClick;
  }, [onPOIClick]);

  useEffect(() => {
    if (!mapSvgUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    fetch(mapSvgUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(svgText => {
        const container = svgContainerRef.current;
        if (!container) {
          setError('DOM 容器未找到');
          setIsLoading(false);
          return;
        }
        
        container.innerHTML = svgText;
        
        setTimeout(() => {
          const svgElement = container.querySelector('svg');
          if (!svgElement) {
            setError('SVG 元素未找到');
            setIsLoading(false);
            return;
          }
          
          svgElement.removeAttribute('width');
          svgElement.removeAttribute('height');
          svgElement.style.width = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.display = 'block';
          
          // 翻译 SVG 中的文字（如果是英文模式）
          if (locale === 'en') {
            const tspanElements = svgElement.querySelectorAll('tspan');
            tspanElements.forEach((tspan) => {
              const text = tspan.textContent?.trim();
              if (text && SVG_TEXT_TRANSLATIONS[text]) {
                tspan.textContent = SVG_TEXT_TRANSLATIONS[text];
                // 确保翻译后的文字保持统一的蓝色
                (tspan as SVGTSpanElement).style.fill = '#2b3fff';
              }
            });
          }
          
          const elementIds = Object.keys(ID_TO_POI_MAP);
          
          elementIds.forEach(elementId => {
            const element = document.getElementById(elementId);
            
            if (element) {
              element.style.cursor = 'pointer';
              element.style.transition = 'all 0.3s ease';
              
              const handleClick = (e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                
                const poiNum = ID_TO_POI_MAP[elementId];
                onPOIClickRef.current({
                  refId: elementId,
                  poiNumber: poiNum,
                  imageUrl: poiNum === '0' ? '/arrowtower.jpg' : `/pic/svg_small/img_${poiNum}.svg`,
                });
              };
              
              element.addEventListener('click', handleClick);
            }
          });
          
          const pathIds = Object.keys(PATH_TO_POI_MAP);
          pathIds.forEach(pathId => {
            const pathElement = document.getElementById(pathId);
            
            if (pathElement) {
              pathElement.removeAttribute('pointer-events');
              pathElement.style.transition = 'all 0.3s ease';
              
              const poiNumber = parseInt(PATH_TO_POI_MAP[pathId]);
              const isInRoute = routePOIs.includes(poiNumber);
              const isCompleted = completedPOIs.has(poiNumber);
              
              if (isCompleted) {
                pathElement.style.fill = '#10b981';
                pathElement.style.fillOpacity = '1';
              } else if (isInRoute) {
                pathElement.style.fill = '#3b82f6';
                pathElement.style.fillOpacity = '0.9';
              } else {
                pathElement.style.fill = '#9ca3af';
                pathElement.style.fillOpacity = '0.6';
              }
            }
          });
          
          setIsLoading(false);
        }, 100);
      })
      .catch(err => {
        setError(`Failed to load map: ${err.message}`);
        setIsLoading(false);
      });
  }, [mapSvgUrl, locale]);

  useEffect(() => {
    if (isLoading) return;
    
    const pathIds = Object.keys(PATH_TO_POI_MAP);
    pathIds.forEach(pathId => {
      const pathElement = document.getElementById(pathId);
      if (pathElement) {
        const poiNumber = parseInt(PATH_TO_POI_MAP[pathId]);
        const isInRoute = routePOIs.includes(poiNumber);
        const isCompleted = completedPOIs.has(poiNumber);
        
        if (isCompleted) {
          pathElement.style.fill = '#10b981';
          pathElement.style.fillOpacity = '1';
        } else if (isInRoute) {
          pathElement.style.fill = '#3b82f6';
          pathElement.style.fillOpacity = '0.9';
        } else {
          pathElement.style.fill = '#9ca3af';
          pathElement.style.fillOpacity = '0.6';
        }
      }
    });
  }, [routePOIs, completedPOIs, isLoading]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={className}>
      <Card className="relative overflow-hidden bg-stone-50 shadow-2xl border border-stone-200/50 rounded-2xl">
        {/* 背景网格纹理 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* 加载提示 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center h-[600px] bg-stone-50/80 backdrop-blur-sm z-50">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-emerald-600 animate-spin" />
              <p className="text-emerald-800 font-medium">{t('common.loading')}</p>
            </div>
          </div>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center h-[600px] bg-white z-50">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">❌ {error}</p>
              <Button onClick={() => window.location.reload()}>{t('home.retry')}</Button>
            </div>
          </div>
        )}
        
        {/* 地图内容 */}
        {(
          <>
            {/* 缩放控制 */}
            <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-stone-200 p-1.5 flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                  className="w-8 h-8 hover:bg-stone-100 text-stone-600"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="h-px bg-stone-200 mx-2" />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="w-8 h-8 hover:bg-stone-100 text-stone-600"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <div className="h-px bg-stone-200 mx-2" />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { setZoom(1); setPan({x:0, y:0}); }}
                  className="w-8 h-8 hover:bg-stone-100 text-stone-600"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 地图容器 */}
            <div 
              className="relative w-full"
              style={{ height: '70vh', minHeight: '500px', cursor: isDragging ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                ref={svgContainerRef}
                className="w-full h-full flex items-center justify-center p-6"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                }}
              />
            </div>
            
            {/* 图例和操作提示 */}
            <div className="absolute bottom-6 left-6 z-20">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-stone-200 p-4 min-w-[200px]">
                <h4 className="font-bold text-sm mb-3 text-stone-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  {t('poi.landmark')}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm ring-2 ring-blue-100"></div>
                    <span className="text-stone-600 font-medium">{t('user.inProgress')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm ring-2 ring-emerald-100"></div>
                    <span className="text-stone-600 font-medium">{t('user.completed')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-stone-300 shadow-sm"></div>
                    <span className="text-stone-400">{t('user.locked')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作提示 - 仅在桌面端显示 */}
            <div className="absolute bottom-6 right-6 z-20 hidden sm:block">
              <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-stone-200 px-4 py-2 text-xs text-stone-500 font-medium">
                {t('progress.clickToStart')}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
