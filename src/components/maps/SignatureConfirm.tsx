'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { translateData } from '@/lib/i18n/dataTranslations';

interface SignatureConfirmProps {
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  poiName?: string;
  isLoading?: boolean;
}

export function SignatureConfirm({
  open,
  onConfirm,
  onCancel,
  poiName,
  isLoading = false,
}: SignatureConfirmProps) {
  const { t, locale } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('signature.title')}</DialogTitle>
          <DialogDescription>
            {t('signature.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 打卡信息 */}
          <Card className="p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">{t('signature.checkinInfo')}</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>{t('signature.checkpoint')}</span>
                <span className="font-medium">{poiName ? translateData(poiName, 'pois', locale) : t('poi.landmark')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('signature.time')}</span>
                <span>{new Date().toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
              </div>
            </div>
          </Card>

          {/* 签名说明 */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-semibold text-sm mb-2">🔒 {t('signature.securityTitle')}</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• {t('signature.securityFree')}</li>
              <li>• {t('signature.securityVerify')}</li>
              <li>• {t('signature.securityNoTransfer')}</li>
              <li>• {t('signature.securityMetamask')}</li>
            </ul>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>{t('signature.waitingSign')}</span>
                </div>
              ) : (
                t('signature.confirmSign')
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              size="lg"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
