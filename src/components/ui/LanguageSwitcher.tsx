"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'zh' : 'en');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="rounded-full border-emerald-200 hover:bg-emerald-50 text-emerald-700 gap-2 transition-all duration-300 hover:shadow-md bg-white/50 backdrop-blur-sm"
    >
      <Globe className="h-4 w-4" />
      <span className="min-w-[2rem] font-medium">
        {locale === 'en' ? 'EN' : 'ZH'}
      </span>
      <span className="sr-only">Switch Language</span>
    </Button>
  );
}
