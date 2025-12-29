import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteContent {
  [section: string]: {
    [key: string]: string;
  };
}

interface SiteContentContextType {
  content: SiteContent;
  loading: boolean;
  getContent: (section: string, key: string, fallback?: string) => string;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*');

        if (error) throw error;

        const contentMap: SiteContent = {};
        (data || []).forEach((item) => {
          if (!contentMap[item.section]) {
            contentMap[item.section] = {};
          }
          contentMap[item.section][item.key] = item.text_value || item.image_url || '';
        });

        setContent(contentMap);
      } catch (error) {
        console.error('Error fetching site content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const getContent = (section: string, key: string, fallback: string = '') => {
    return content[section]?.[key] || fallback;
  };

  return (
    <SiteContentContext.Provider value={{ content, loading, getContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
}
