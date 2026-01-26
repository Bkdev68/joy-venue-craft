import { ReactNode } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export interface AdminPageWrapperProps {
  children: ReactNode;
  title: string;
  publicPath?: string;
}

export function AdminPageWrapper({ children, title, publicPath }: AdminPageWrapperProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {publicPath && (
            <p className="text-muted-foreground text-sm mt-1">
              Klicken Sie auf Texte oder Bilder, um sie zu bearbeiten
            </p>
          )}
        </div>
        {publicPath && (
          <Button asChild variant="outline" size="sm">
            <Link to={publicPath} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Live ansehen
            </Link>
          </Button>
        )}
      </div>
      
      <div className="bg-background border rounded-2xl overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}
