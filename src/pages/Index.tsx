
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuperadminDashboard from '@/components/dashboard/SuperadminDashboard';
import StoreDashboard from '@/components/dashboard/StoreDashboard';
import StoreSetup from '@/components/onboarding/StoreSetup';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Loader2 } from 'lucide-react';

const Index = () => {
  const { profile, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  // Mostrar loading enquanto carrega o perfil
  if (loading || !profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Renderizar dashboard específico baseado no papel do usuário
  if (profile.role === 'superadmin') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">
                  Bem-vindo, {profile.full_name || profile.email}
                </h2>
                <p className="text-muted-foreground">
                  Superadministrador
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut size={16} />
                Sair
              </Button>
            </div>
            
            <SuperadminDashboard />
          </div>
        </div>
      </ProtectedRoute>
    );
  } 
  
  // Para store_admin, verificar se tem loja associada
  if (profile.role === 'store_admin') {
    // Se não tem store_id, mostrar o wizard de configuração
    if (!profile.store_id) {
      return (
        <ProtectedRoute>
          <StoreSetup />
        </ProtectedRoute>
      );
    }

    // Se tem store_id, mostrar o dashboard da loja
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">
                  Bem-vindo, {profile.full_name || profile.email}
                </h2>
                <p className="text-muted-foreground">
                  Administrador da Loja
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut size={16} />
                Sair
              </Button>
            </div>
            
            <StoreDashboard />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Fallback - não deveria chegar aqui
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Perfil não reconhecido</h2>
          <p className="text-muted-foreground mb-4">
            Seu perfil não está configurado corretamente. Entre em contato com o administrador.
          </p>
          <Button onClick={handleLogout}>
            Fazer Logout
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
