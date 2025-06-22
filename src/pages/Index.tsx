
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuperadminDashboard from '@/components/dashboard/SuperadminDashboard';
import StoreDashboard from '@/components/dashboard/StoreDashboard';
import { ImprovedStoreWizard } from '@/components/onboarding/ImprovedStoreWizard';
import { useOnboarding } from '@/hooks/useOnboarding';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Loader2, AlertTriangle, Store } from 'lucide-react';
import '@/styles/dashboard-apple.css';

const Index = () => {
  const { profile, signOut, loading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading, completeOnboarding, recheckOnboarding } = useOnboarding();
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

  const handleStartWizard = () => {
    console.log('🔄 Forçando início do wizard');
    recheckOnboarding();
  };

  // Mostrar loading enquanto carrega o perfil e onboarding
  if (loading || onboardingLoading) {
    return (
      <div className="dashboard-container">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="apple-loading mb-4" />
            <p className="apple-text-body">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não há perfil após loading, algo deu errado
  if (!profile) {
    return (
      <div className="dashboard-container">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="apple-heading-2 mb-4">Erro ao carregar perfil</h2>
            <p className="apple-text-body mb-4">
              Não foi possível carregar suas informações de perfil.
            </p>
            <button onClick={handleLogout} className="apple-button apple-button-primary">
              Fazer Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('🔒 [SECURITY] Index - Perfil carregado:', {
    role: profile.role,
    store_id: profile.store_id,
    needsOnboarding
  });

  // Para superadmin, sempre mostrar dashboard administrativo (nunca wizard)
  if (profile.role === 'superadmin') {
    console.log('✅ Superadmin - liberando dashboard administrativo');
    return (
      <div className="dashboard-container">
        <AppLayout 
          title="Dashboard Administrativo"
          subtitle="Visão geral de todas as lojas do sistema"
          breadcrumbs={[
            { label: 'Dashboard', current: true }
          ]}
        >
          <SuperadminDashboard />
        </AppLayout>
      </div>
    );
  }

  // Para store_admin, verificar se precisa de onboarding
  if (profile.role === 'store_admin') {
    // Se precisa de onboarding, mostrar o wizard
    if (needsOnboarding) {
      console.log('🔧 Store admin precisa de onboarding - mostrando wizard');
      return (
        <ImprovedStoreWizard
          open={true}
          onComplete={completeOnboarding}
        />
      );
    }

    // Se não precisa de onboarding mas não tem store_id, erro crítico
    if (!profile.store_id) {
      console.log('🚨 [CRITICAL] Store admin sem loja mas onboarding completo');
      return (
        <div className="dashboard-container">
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <Store className="h-16 w-16 text-orange-500 mx-auto mb-6" />
              <h2 className="apple-heading-2 mb-4 text-gray-900">Erro de Configuração</h2>
              <p className="apple-text-body mb-6">
                Sua conta parece estar em um estado inconsistente. Vamos reconfigurar sua loja.
              </p>
              <div className="apple-space-y-4">
                <button 
                  onClick={handleStartWizard}
                  className="apple-button apple-button-primary w-full"
                >
                  Reconfigurar Loja
                </button>
                <button 
                  onClick={handleLogout} 
                  className="apple-button apple-button-secondary w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Fazer Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Store admin com loja válida - mostrar dashboard
    console.log('✅ [SECURITY] Store admin com loja válida - liberando dashboard');
    return (
      <div className="dashboard-container">
        <AppLayout 
          title="Dashboard da Loja"
          subtitle="Gerencie seus produtos e vendas"
          breadcrumbs={[
            { label: 'Dashboard', current: true }
          ]}
        >
          <StoreDashboard />
        </AppLayout>
      </div>
    );
  }

  // Fallback - papel não reconhecido
  return (
    <div className="dashboard-container">
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="apple-heading-2 mb-4">Perfil não reconhecido</h2>
          <p className="apple-text-body mb-4">
            Seu perfil não está configurado corretamente. Entre em contato com o administrador.
          </p>
          <p className="apple-text-small mb-4">
            Papel atual: {profile.role}
          </p>
          <button onClick={handleLogout} className="apple-button apple-button-primary">
            Fazer Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
