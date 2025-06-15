
import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth, UserRole } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // Usuário não tem permissão para acessar esta rota
        navigate('/');
        return;
      }
    }
  }, [user, profile, loading, navigate, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
