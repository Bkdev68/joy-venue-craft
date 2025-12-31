import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  Image, 
  FileText, 
  Star, 
  HelpCircle, 
  Package, 
  LogOut,
  Settings,
  BarChart3,
  Home,
  Layers,
  CreditCard,
  Mail,
  CalendarCheck,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/insights', icon: BarChart3, label: 'Insights' },
  { href: '/admin/buchungen', icon: CalendarCheck, label: 'Buchungen' },
  { type: 'divider', label: 'Seiten' },
  { href: '/admin/seite/home', icon: Home, label: 'Home' },
  { href: '/admin/seite/leistungen', icon: Layers, label: 'Leistungen' },
  { href: '/admin/seite/preise', icon: CreditCard, label: 'Preise' },
  { href: '/admin/seite/kontakt', icon: Mail, label: 'Kontakt' },
  { type: 'divider', label: 'Inhalte' },
  { href: '/admin/galerie', icon: Image, label: 'Galerie' },
  { href: '/admin/services', icon: Package, label: 'Services' },
  { href: '/admin/testimonials', icon: Star, label: 'Testimonials' },
  { href: '/admin/faq', icon: HelpCircle, label: 'FAQ' },
  { href: '/admin/inhalte', icon: FileText, label: 'Sonstige Inhalte' },
  { type: 'divider', label: 'System' },
  { href: '/admin/einstellungen', icon: Settings, label: 'Einstellungen' },
];

interface NavContentProps {
  location: ReturnType<typeof useLocation>;
  user: any;
  onSignOut: () => void;
  onNavClick?: () => void;
}

function NavContent({ location, user, onSignOut, onNavClick }: NavContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <img src={logo} alt="Pixelpalast" className="h-8 w-auto" />
        <span className="text-sm font-medium text-muted-foreground">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={index} className="pt-4 pb-2">
                <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          }
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href!}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <div className="text-xs text-muted-foreground px-3 py-1 truncate">
          {user?.email}
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground" 
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Pixelpalast" className="h-7 w-auto" />
          <span className="text-sm font-medium text-muted-foreground">Admin</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent 
              location={location} 
              user={user} 
              onSignOut={handleSignOut}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-64 bg-background border-r">
        <NavContent 
          location={location} 
          user={user} 
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
