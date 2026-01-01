import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import Maintenance from '@/pages/Maintenance';

interface MaintenanceWrapperProps {
  children: ReactNode;
}

export function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const { isAdmin, loading: authLoading } = useAuth();
  const { isMaintenanceMode, loading: maintenanceLoading } = useMaintenanceMode();
  const location = useLocation();

  // Allow access to admin routes regardless of maintenance mode
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Show loading state while checking
  if (maintenanceLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If maintenance mode is enabled and user is not admin and not on admin route
  if (isMaintenanceMode && !isAdmin && !isAdminRoute) {
    return <Maintenance />;
  }

  return <>{children}</>;
}
