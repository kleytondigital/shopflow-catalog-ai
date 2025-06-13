
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('superadmin' | 'store_admin')[];
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles 
}) => {
  const { loading: sessionLoading, isAuthenticated } = useAuthSession();
  const { profile, loading: profileLoading } = useAuth();

  // Aguardar carregamento da sessão e perfil
  if (sessionLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticação
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar perfil se autenticado
  if (isAuthenticated && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Perfil não encontrado</h2>
          <p className="text-muted-foreground">
            Erro ao carregar informações do usuário.
          </p>
        </div>
      </div>
    );
  }

  // Verificar roles se especificados
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
