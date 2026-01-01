import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceModeContextType {
  isMaintenanceMode: boolean;
  loading: boolean;
  setMaintenanceMode: (enabled: boolean) => Promise<void>;
}

const MaintenanceModeContext = createContext<MaintenanceModeContextType | undefined>(undefined);

export function MaintenanceModeProvider({ children }: { children: ReactNode }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceMode();
  }, []);

  const fetchMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('text_value')
        .eq('section', 'settings')
        .eq('key', 'maintenance_mode')
        .maybeSingle();

      if (error) {
        console.error('Error fetching maintenance mode:', error);
        setIsMaintenanceMode(false);
      } else {
        setIsMaintenanceMode(data?.text_value === 'true');
      }
    } catch (err) {
      console.error('Error in fetchMaintenanceMode:', err);
      setIsMaintenanceMode(false);
    } finally {
      setLoading(false);
    }
  };

  const setMaintenanceMode = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section: 'settings',
          key: 'maintenance_mode',
          content_type: 'text',
          text_value: enabled ? 'true' : 'false',
        }, {
          onConflict: 'section,key'
        });

      if (error) {
        console.error('Error setting maintenance mode:', error);
        throw error;
      }

      setIsMaintenanceMode(enabled);
    } catch (err) {
      console.error('Error in setMaintenanceMode:', err);
      throw err;
    }
  };

  return (
    <MaintenanceModeContext.Provider value={{ isMaintenanceMode, loading, setMaintenanceMode }}>
      {children}
    </MaintenanceModeContext.Provider>
  );
}

export function useMaintenanceMode() {
  const context = useContext(MaintenanceModeContext);
  if (context === undefined) {
    throw new Error('useMaintenanceMode must be used within a MaintenanceModeProvider');
  }
  return context;
}
