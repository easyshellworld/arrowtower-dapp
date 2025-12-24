'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { translateData } from '@/lib/i18n/dataTranslations';

export interface POI {
  id: string;
  name: string;
  description: string;
  order: number;
  taskType: string;
  taskContent: string | null;
}

interface POIDetailModalProps {
  open: boolean;
  onClose: () => void;
  poiNumber: string;
  imageUrl: string;
  poiData?: POI | null;
  onCheckin: () => void;
  isLoading?: boolean;
  isCompleted?: boolean;
}

export function POIDetailModal({
  open,
  onClose,
  poiNumber,
  imageUrl,
  poiData,
  onCheckin,
  isLoading = false,
  isCompleted = false,
}: POIDetailModalProps) {
  const { t, locale } = useLanguage();
  const isArrowTower = poiNumber === '0';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className={cn(
          "overflow-auto",
          "w-[95vw] sm:w-[90vw]",
          isArrowTower && "max-w-3xl max-h-[90vh]",
          !isArrowTower && "md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[85vh]"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-emerald-900">
            {poiData ? translateData(poiData.name, 'pois', locale) : `${t('poi.landmark')} ${poiNumber}`}
          </DialogTitle>
        </DialogHeader>
        
        {/* 箭塔介绍：上下布局 */}
        {isArrowTower ? (
          <div className="space-y-4">
            <div className="relative w-full bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl overflow-hidden shadow-md border-2 border-emerald-100">
              <img
                src={imageUrl}
                alt={poiData?.name || `${t('poi.landmark')} ${poiNumber}`}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  console.error('Image load failed:', imageUrl);
                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%2310b981"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">${t('poi.imageError')}</text></svg>`;
                }}
              />
            </div>

            <div className="space-y-4">
              {poiData && (
                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-lg">
                  <p className="text-base text-gray-700 leading-relaxed text-justify">{translateData(poiData.description, 'descriptions', locale)}</p>
                </Card>
              )}
              
              <Button
                size="lg"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-lg"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        ) : (
          /* 其他景点：左右布局 */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative w-full bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl overflow-hidden shadow-md border-2 border-emerald-100">
            <img
              src={imageUrl}
              alt={poiData?.name || `${t('poi.landmark')} ${poiNumber}`}
              className="w-full h-auto object-cover"
              onError={(e) => {
                console.error('Image load failed:', imageUrl);
                e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%2310b981"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">${t('poi.imageError')}</text></svg>`;
              }}
            />
          </div>

          <div className="flex flex-col justify-between space-y-4">
            {poiData && (
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-lg flex-1 flex items-center">
                <p className="text-base text-gray-700 leading-relaxed">{translateData(poiData.description, 'descriptions', locale)}</p>
              </Card>
            )}

            {poiNumber !== '0' ? (
              <div className="space-y-3">
                {isCompleted ? (
                  <>
                    <Button
                      className="w-full bg-gray-400 text-gray-200 font-bold shadow-lg cursor-not-allowed"
                      size="lg"
                      disabled
                    >
                      ✓ {t('poi.checkedIn')}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onClose}
                      className="w-full border-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                    >
                      {t('common.close')}
                    </Button>
                    <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                      <p className="text-sm text-gray-600 text-center">
                        ✓ {t('poi.alreadyChecked')}
                      </p>
                    </Card>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-lg"
                      size="lg"
                      onClick={onCheckin}
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.processing') : `✓ ${t('poi.checkinNow')}`}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onClose}
                      className="w-full border-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                    >
                      {t('common.cancel')}
                    </Button>
                    
                    <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                      <h4 className="font-bold text-xs mb-2 text-emerald-900 flex items-center">
                        <span className="mr-1">📍</span> {t('poi.checkinGuide')}
                      </h4>
                      <ul className="text-xs text-emerald-700 space-y-1">
                        <li className="flex items-start"><span className="mr-1">•</span><span>{t('poi.guideWallet')}</span></li>
                        <li className="flex items-start"><span className="mr-1">•</span><span>{t('poi.guideLocation')}</span></li>
                        <li className="flex items-start"><span className="mr-1">•</span><span>{t('poi.guideOnce')}</span></li>
                      </ul>
                    </Card>
                  </>
                )}
              </div>
            ) : (
              <Button
                size="lg"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-lg"
              >
                {t('common.close')}
              </Button>
            )}
          </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
