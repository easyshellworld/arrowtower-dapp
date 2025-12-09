'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface WalletConnectorProps {
  isConnected: boolean;
  walletAddress: string;
  onConnect: () => Promise<void>;
  isLoading?: boolean;
}

export function WalletConnector({
  isConnected,
  walletAddress,
  onConnect,
  isLoading = false,
}: WalletConnectorProps) {
  const { t } = useLanguage();

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-lg border-2 border-emerald-200">
      <h3 className="font-semibold mb-3 text-emerald-900">{t('common.connectWallet')}</h3>
      {isConnected ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <div>
            <p className="text-sm text-emerald-700 font-medium">
              {t('common.walletConnected')}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
          <span className="text-emerald-600 text-2xl">✓</span>
        </div>
      ) : (
        <Button
          onClick={onConnect}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          size="lg"
        >
          {isLoading ? t('home.connecting') : t('common.connectWallet')}
        </Button>
      )}
    </Card>
  );
}
