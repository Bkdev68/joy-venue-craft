import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useIdleTimeout } from './useIdleTimeout';
import { toast } from 'sonner';

type UserRole = 'admin' | 'editor' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  userRole: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has any admin panel access (admin or editor)
  const checkUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking user role:', error);
        return null;
      }
      return data?.role as UserRole || null;
    } catch (err) {
      console.error('Error in checkUserRole:', err);
      return null;
    }
  };

  // isAdmin means user has access to admin panel (admin OR editor)
  const isAdmin = userRole === 'admin' || userRole === 'editor';

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role check with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id).then(setUserRole);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id).then(setUserRole);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  }, []);

  // Auto-logout after 5 minutes of inactivity for admin users
  const handleIdleTimeout = useCallback(() => {
    if (isAdmin && user) {
      toast.info('Sie wurden wegen Inaktivität abgemeldet.');
      signOut();
    }
  }, [isAdmin, user, signOut]);

  useIdleTimeout({
    timeout: 5 * 60 * 1000, // 5 minutes
    onIdle: handleIdleTimeout,
    enabled: isAdmin && !!user,
  });

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, userRole, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
