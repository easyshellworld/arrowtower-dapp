"use client";

import { useState, useEffect } from "react";
import { 
  useAccount, 
  useConnect, 
  useDisconnect,
  useChainId,
} from "wagmi";
import { metaMask } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Check, Copy, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// MetaMask 狐狸图标 SVG 组件
const MetaMaskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M36.0112 3L21.7937 13.6762L24.4187 7.5675L36.0112 3Z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.00562 3L18.1 13.7837L15.5812 7.5675L4.00562 3Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30.6562 26.4937L26.9937 32.1075L35.2687 34.3037L37.5662 26.6187L30.6562 26.4937Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.45 26.6187L4.73125 34.3037L12.9937 32.1075L9.34375 26.4937L2.45 26.6187Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.4625 17.6287L10.2 21.2075L18.4 21.5862L18.1125 12.6862L12.4625 17.6287Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M27.5375 17.6287L21.8 12.5787L21.7937 21.5862L29.8 21.2075L27.5375 17.6287Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.9937 32.1075L17.75 29.7825L13.6187 26.675L12.9937 32.1075Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22.25 29.7825L26.9937 32.1075L26.3812 26.675L22.25 29.7825Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26.9937 32.1075L22.25 29.7825L22.6125 32.7862L22.5687 34.1962L26.9937 32.1075Z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.9937 32.1075L17.4187 34.1962L17.3875 32.7862L17.75 29.7825L12.9937 32.1075Z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.4812 24.5287L13.5062 23.3287L16.2812 22.0537L17.4812 24.5287Z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22.5188 24.5287L23.7188 22.0537L26.5063 23.3287L22.5188 24.5287Z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.9937 32.1075L13.6437 26.4937L9.34375 26.6187L12.9937 32.1075Z" fill="#CD6116" stroke="#CD6116" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26.3562 26.4937L26.9937 32.1075L30.6562 26.6187L26.3562 26.4937Z" fill="#CD6116" stroke="#CD6116" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M29.8 21.2075L21.7937 21.5862L22.5187 24.5287L23.7187 22.0537L26.5062 23.3287L29.8 21.2075Z" fill="#CD6116" stroke="#CD6116" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5062 23.3287L16.2812 22.0537L17.4812 24.5287L18.2187 21.5862L10.2 21.2075L13.5062 23.3287Z" fill="#CD6116" stroke="#CD6116" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.2 21.2075L13.6187 26.675L13.5062 23.3287L10.2 21.2075Z" fill="#E4751F" stroke="#E4751F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26.5062 23.3287L26.3812 26.675L29.8 21.2075L26.5062 23.3287Z" fill="#E4751F" stroke="#E4751F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.2187 21.5862L17.4812 24.5287L18.4187 29.3287L18.6437 22.9537L18.2187 21.5862Z" fill="#E4751F" stroke="#E4751F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21.7937 21.5862L21.3812 22.9412L21.5687 29.3287L22.5187 24.5287L21.7937 21.5862Z" fill="#E4751F" stroke="#E4751F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22.5187 24.5287L21.5687 29.3287L22.25 29.7825L26.3812 26.675L26.5062 23.3287L22.5187 24.5287Z" fill="#F6851B" stroke="#F6851B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5062 23.3287L13.6187 26.675L17.75 29.7825L18.4187 29.3287L17.4812 24.5287L13.5062 23.3287Z" fill="#F6851B" stroke="#F6851B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22.5688 34.1962L22.6125 32.7862L22.2813 32.5037H17.7188L17.3875 32.7862L17.4188 34.1962L12.9938 32.1075L14.6063 33.4462L17.6813 35.6237H22.3188L25.4063 33.4462L26.9938 32.1075L22.5688 34.1962Z" fill="#C0AD9E" stroke="#C0AD9E" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22.25 29.7825L21.5687 29.3287H18.4187L17.75 29.7825L17.3875 32.7862L17.7187 32.5037H22.2812L22.6125 32.7862L22.25 29.7825Z" fill="#161616" stroke="#161616" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M36.5438 14.3787L37.8188 8.43619L36.0125 3L22.25 13.3912L27.5375 17.6287L35.0188 19.9537L36.6063 18.0787L35.9188 17.5787L37.1063 16.4912L36.2563 15.8537L37.4438 14.9412L36.5438 14.3787Z" fill="#763D16" stroke="#763D16" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.18125 8.43619L3.45625 14.3787L2.54375 14.9412L3.73125 15.8537L2.89375 16.4912L4.08125 17.5787L3.39375 18.0787L4.96875 19.9537L12.4625 17.6287L17.75 13.3912L3.9875 3L2.18125 8.43619Z" fill="#763D16" stroke="#763D16" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35.0188 19.9537L27.5375 17.6287L29.8 21.2075L26.3812 26.675L30.6562 26.6187H37.5662L35.0188 19.9537Z" fill="#F6851B" stroke="#F6851B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.4625 17.6287L4.96875 19.9537L2.45 26.6187H9.34375L13.6187 26.675L10.2 21.2075L12.4625 17.6287Z" fill="#F6851B" stroke="#F6851B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21.7937 21.5862L22.25 13.3912L24.4312 7.5675H15.5812L17.75 13.3912L18.2187 21.5862L18.4062 22.9662L18.4187 29.3287H21.5812L21.5937 22.9662L21.7937 21.5862Z" fill="#F6851B" stroke="#F6851B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function ConnectWallet() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, isPending } = useConnect({
    mutation: {
      onError: (error: Error) => {
        console.error("Connection error:", error);
        setError(error.message);
        setTimeout(() => setError(null), 5000);
      },
    },
  });
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected) {
      setError(null);
    }
  }, [isConnected]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const metaMaskConnector = metaMask();

  const viewOnExplorer = () => {
    if (!address) return;
    const explorerUrl = `https://blockscout-asset-hub.parity-chains-scw.parity.io/${address}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center space-y-3 w-full max-w-md">
      {isConnected ? (
        <>
          <div className="flex items-center space-x-2 bg-emerald-100 p-3 rounded-lg border-2 border-emerald-200 shadow-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center cursor-pointer hover:bg-emerald-200 px-2 py-1 rounded transition-colors" onClick={copyAddress}>
                    <span className="text-sm font-semibold text-emerald-900">
                      {shortenAddress(address)}
                    </span>
                    {copied ? (
                      <Check className="h-4 w-4 ml-2 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 ml-2 text-emerald-600" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? t('wallet.copied') : t('wallet.copyAddress')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hover:bg-emerald-200 p-1 rounded transition-colors cursor-pointer">
                    <ExternalLink 
                      className="h-4 w-4 text-emerald-600" 
                      onClick={viewOnExplorer}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {t('wallet.viewExplorer')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button 
            onClick={() => disconnect()} 
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg transition-all duration-200"
          >
            {t('wallet.disconnect')}
          </Button>
        </>
      ) : (
        <div className="flex flex-col space-y-3 w-full">
          <Button
            onClick={() => connect({ connector: metaMaskConnector })}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-6 shadow-xl transition-all duration-200 flex items-center justify-center gap-3 border-2 border-orange-400"
          >
            <MetaMaskIcon />
            <span className="text-lg">
              {isPending ? t('wallet.connecting') : t('wallet.connectMetamask')}
            </span>
          </Button>
          
          {error && (
            <div className="flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function shortenAddress(address?: `0x${string}`) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "N/A";
}