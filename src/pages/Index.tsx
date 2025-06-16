
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

const Index = () => {
  const { profile, signOut, loading } = useAuth();
  const { needsOnboarding, loading: onboardingLoading, completeOnboarding } = useOnboarding();
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

  // Mostrar loading enquanto carrega o perfil e onboarding
  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há perfil após loading, algo deu errado
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar perfil</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar suas informações de perfil.
          </p>
          <Button onClick={handleLogout}>
            Fazer Logout
          </Button>
        </div>
      </div>
    );
  }

  console.log('🔒 [SECURITY] Index - Perfil carregado:', {
    role: profile.role,
    store_id: profile.store_id,
    needsOnboarding
  });

  // Para store_admin, SEMPRE verificar loja válida
  if (profile.role === 'store_admin') {
    // SEGURANÇA CRÍTICA: Bloquear se não tem store_id
    if (!profile.store_id) {
      console.log('🚨 [SECURITY] Store admin sem store_id - ACESSO NEGADO');
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <Store className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Loja Não Configurada</h2>
            <p className="text-gray-600 mb-6">
              Sua conta não está associada a nenhuma loja. É necessário configurar sua loja antes de continuar.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  console.log('🔄 Forçando wizard para usuário sem loja');
                  // Forçar onboarding
                  window.location.reload();
                }} 
                className="w-full"
              >
                Configurar Loja
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Fazer Logout
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
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

    // APENAS com loja válida E onboarding completo
    console.log('✅ [SECURITY] Store admin com loja válida - liberando dashboard');
    return (
      <AppLayout 
        title="Dashboard da Loja"
        subtitle="Gerencie seus produtos e vendas"
        breadcrumbs={[
          { label: 'Dashboard', current: true }
        ]}
      >
        <StoreDashboard />
      </AppLayout>
    );
  }

  // Para superadmin, mostrar dashboard administrativo
  if (profile.role === 'superadmin') {
    console.log('✅ Superadmin - liberando dashboard administrativo');
    return (
      <AppLayout 
        title="Dashboard Administrativo"
        subtitle="Visão geral de todas as lojas do sistema"
        breadcrumbs={[
          { label: 'Dashboard', current: true }
        ]}
      >
        <SuperadminDashboard />
      </AppLayout>
    );
  } 

  // Fallback - papel não reconhecido
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Perfil não reconhecido</h2>
        <p className="text-muted-foreground mb-4">
          Seu perfil não está configurado corretamente. Entre em contato com o administrador.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Papel atual: {profile.role}
        </p>
        <Button onClick={handleLogout}>
          Fazer Logout
        </Button>
      </div>
    </div>
  );
};

export default Index;
