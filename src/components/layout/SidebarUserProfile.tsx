
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useSubscription } from '@/hooks/useSubscription';
import { LogOut, Settings, Crown, Store, User, Zap, Clock, CreditCard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SidebarUserProfile: React.FC = () => {
  const { profile } = useAuth();
  const { signOut } = useAuthSession();
  const { 
    subscription, 
    loading, 
    isTrialing, 
    getTrialDaysLeft, 
    getPlanDisplayName, 
    getPlanValue,
    getExpirationDate
  } = useSubscription();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Erro ao fazer logout');
        return;
      }
      toast.success('Logout realizado com sucesso');
      navigate('/auth');
    } catch (err) {
      toast.error('Erro inesperado');
    }
  };

  const handleUpgrade = () => {
    navigate('/billing');
    toast.info('Redirecionando para página de faturamento...');
  };

  const getRoleIcon = () => {
    if (profile?.role === 'superadmin') return <Crown className="h-3 w-3" />;
    if (profile?.role === 'store_admin') return <Store className="h-3 w-3" />;
    return <User className="h-3 w-3" />;
  };

  const getRoleLabel = () => {
    if (profile?.role === 'superadmin') return 'Superadmin';
    if (profile?.role === 'store_admin') return 'Admin da Loja';
    return 'Usuário';
  };

  const getPlanInfo = () => {
    if (profile?.role === 'superadmin') {
      return { 
        label: 'Superadmin', 
        variant: 'default' as const, 
        color: 'bg-purple-100 text-purple-800',
        showUpgrade: false
      };
    }

    if (loading) {
      return { 
        label: 'Carregando...', 
        variant: 'outline' as const, 
        color: 'bg-gray-50 text-gray-600',
        showUpgrade: false
      };
    }

    if (!subscription) {
      return { 
        label: 'Sem Plano', 
        variant: 'destructive' as const, 
        color: 'bg-red-50 text-red-700',
        showUpgrade: true,
        urgent: true
      };
    }

    const planName = getPlanDisplayName();
    const trialDays = getTrialDaysLeft();

    if (isTrialing()) {
      return { 
        label: `${planName} (Trial - ${trialDays}d)`, 
        variant: 'secondary' as const, 
        color: 'bg-blue-50 text-blue-700',
        showUpgrade: true,
        urgent: trialDays <= 3
      };
    }

    if (subscription.status === 'active') {
      return { 
        label: planName, 
        variant: 'default' as const, 
        color: 'bg-green-50 text-green-700',
        showUpgrade: subscription.plan?.type === 'basic'
      };
    }

    return { 
      label: `${planName} (Inativo)`, 
      variant: 'destructive' as const, 
      color: 'bg-red-50 text-red-700',
      showUpgrade: true,
      urgent: true
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const planInfo = getPlanInfo();
  const planValue = getPlanValue();
  const expirationDate = getExpirationDate();

  if (!profile) return null;

  return (
    <div className="p-4 border-t border-gray-200">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full p-2 h-auto justify-start">
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {profile.full_name 
                    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : profile.email.substring(0, 2).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.full_name || 'Usuário'}
                </p>
                <Badge 
                  variant={planInfo.variant}
                  className={`text-xs ${planInfo.color} border-none ${planInfo.urgent ? 'animate-pulse' : ''}`}
                >
                  {planInfo.urgent && <Clock className="h-3 w-3 mr-1" />}
                  {planInfo.label}
                </Badge>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">
                {profile.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile.email}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getRoleIcon()}
                  <span className="ml-1">{getRoleLabel()}</span>
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          
          {/* Informações detalhadas do plano */}
          {profile.role === 'store_admin' && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-3">
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plano Atual</span>
                    <Badge 
                      variant={planInfo.variant}
                      className={`text-xs ${planInfo.color} border-none`}
                    >
                      {planInfo.label}
                    </Badge>
                  </div>
                  
                  {subscription && (
                    <>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Valor mensal:</span>
                        <span className="font-medium">{formatCurrency(planValue)}</span>
                      </div>
                      
                      {expirationDate && (
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{isTrialing() ? 'Trial expira:' : 'Renova em:'}</span>
                          <span className="font-medium">{formatDate(expirationDate)}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {planInfo.showUpgrade && (
                    <Button 
                      onClick={handleUpgrade}
                      className="w-full mt-2" 
                      size="sm"
                      variant={planInfo.urgent ? "default" : "outline"}
                    >
                      <TrendingUp className="mr-2 h-3 w-3" />
                      {planInfo.urgent ? 'Ativar Plano' : 'Fazer Upgrade'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate('/billing')} className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Faturamento</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SidebarUserProfile;
