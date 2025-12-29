import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function useGoogleAnalytics() {
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGaId = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('text_value')
        .eq('section', 'settings')
        .eq('key', 'google_analytics_id')
        .maybeSingle();
      
      if (data?.text_value) {
        setGaId(data.text_value);
      }
    };
    fetchGaId();
  }, []);

  useEffect(() => {
    if (!gaId) return;

    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
      return;
    }

    // Load gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);

    console.log('Google Analytics initialized:', gaId);
  }, [gaId]);

  return gaId;
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
