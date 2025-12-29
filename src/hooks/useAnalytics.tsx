import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location.pathname]);
}

// Track custom events
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
    console.log('Analytics event:', eventName, params);
  }
}

// Track button clicks
export function trackClick(
  buttonName: string,
  category: string = 'engagement'
) {
  trackEvent('click', {
    event_category: category,
    event_label: buttonName,
  });
}

// Track booking funnel steps
export function trackBookingStep(
  step: number,
  stepName: string,
  additionalData?: Record<string, any>
) {
  trackEvent('booking_step', {
    step_number: step,
    step_name: stepName,
    ...additionalData,
  });
  
  // Also track as funnel progress for Google Ads
  trackEvent('funnel_progress', {
    funnel_name: 'booking',
    step_number: step,
    step_name: stepName,
  });
}

// Track booking completion (conversion)
export function trackBookingComplete(
  serviceName: string,
  packageName: string,
  value: number
) {
  // Google Analytics conversion
  trackEvent('purchase', {
    transaction_id: `booking_${Date.now()}`,
    value: value,
    currency: 'EUR',
    items: [{
      item_name: `${serviceName} - ${packageName}`,
      price: value,
    }],
  });
  
  // Google Ads conversion tracking
  trackEvent('conversion', {
    send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // User needs to update this
    value: value,
    currency: 'EUR',
  });
  
  trackEvent('booking_complete', {
    service: serviceName,
    package: packageName,
    value: value,
  });
}

// Track booking abandonment
export function trackBookingAbandonment(
  step: number,
  stepName: string,
  serviceName?: string
) {
  trackEvent('booking_abandoned', {
    abandoned_at_step: step,
    step_name: stepName,
    service: serviceName,
  });
}

// Track CTA clicks
export function trackCTA(ctaName: string, location: string) {
  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: location,
  });
}

// Track form interactions
export function trackFormStart(formName: string) {
  trackEvent('form_start', {
    form_name: formName,
  });
}

export function trackFormSubmit(formName: string) {
  trackEvent('form_submit', {
    form_name: formName,
  });
}

// Track scroll depth
export function useScrollTracking() {
  useEffect(() => {
    const thresholds = [25, 50, 75, 90];
    const tracked = new Set<number>();

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !tracked.has(threshold)) {
          tracked.add(threshold);
          trackEvent('scroll_depth', {
            percent_scrolled: threshold,
            page_path: window.location.pathname,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Track time on page
export function useTimeOnPage() {
  const location = useLocation();

  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent('time_on_page', {
        page_path: location.pathname,
        time_seconds: timeSpent,
      });
    };
  }, [location.pathname]);
}

// Track outbound links
export function trackOutboundLink(url: string, linkText: string) {
  trackEvent('outbound_link', {
    link_url: url,
    link_text: linkText,
  });
}

// Track phone/contact clicks
export function trackContactClick(type: 'phone' | 'email' | 'whatsapp') {
  trackEvent('contact_click', {
    contact_type: type,
  });
}

// Track service page views
export function trackServiceView(serviceName: string) {
  trackEvent('view_item', {
    item_name: serviceName,
    item_category: 'service',
  });
}

// Track gallery interactions
export function trackGalleryView(category: string, imageIndex: number) {
  trackEvent('gallery_view', {
    category: category,
    image_index: imageIndex,
  });
}

// Hook for tracking with cleanup
export function useTrackOnMount(eventName: string, params?: Record<string, any>) {
  useEffect(() => {
    trackEvent(eventName, params);
  }, []);
}
