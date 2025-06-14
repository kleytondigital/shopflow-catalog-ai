
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { 
  LogOut, Settings, User, Crown, Store, 
  Zap, Calendar, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlanUpgradeModal } from './PlanUpgradeModal';

const ProfileDropdown: React.FC = () => {
  const { profile } = useAuth();
  const { signOut } = useAuthSession();
  const { subscription, featureUsage, isTrialing, getTrialDaysLeft } = useSubscription();
  const { getPlanBadgeInfo } = usePlanPermissions();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  const planBadge = getPlanBadgeInfo();
  const trialDaysLeft = getTrialDaysLeft();

  const getNextBillingDate = () => {
    if (!subscription?.ends_at) return null;
    return new Date(subscription.ends_at).toLocaleDateString('pt-BR');
  };

  // Features importantes para mostrar no dropdown
  const importantFeatures = featureUsage.filter(usage => 
    ['max_images_per_product', 'max_team_members'].includes(usage.feature_type)
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-white">
                {profile?.full_name 
                  ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : profile?.email.substring(0, 2).toUpperCase()
                }
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" align="end" forceMount>
          {/* Informações da Conta */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'Usuário'}
                </p>
                <Badge variant="outline" className="text-xs">
                  {getRoleIcon()}
                  <span className="ml-1">{getRoleLabel()}</span>
                </Badge>
              </div>
              <p className="text-xs leading-none text-muted-foreground">
                {profile?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />

          {/* Plano Atual */}
          <div className="p-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Plano Atual</CardTitle>
                  <Badge variant={planBadge.variant}>
                    {planBadge.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Trial warning */}
                {isTrialing() && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div className="text-xs">
                      <p className="font-medium text-yellow-800">
                        Trial: {trialDaysLeft} dias restantes
                      </p>
                    </div>
                  </div>
                )}

                {/* Preço */}
                <div className="text-center">
                  <p className="text-lg font-bold">
                    R$ {subscription?.plan.price_monthly.toFixed(2)}
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </p>
                </div>

                {/* Próximo vencimento */}
                {getNextBillingDate() && !isTrialing() && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Próximo vencimento: {getNextBillingDate()}</span>
                  </div>
                )}

                {/* Uso de Features */}
                {importantFeatures.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Uso Atual:</p>
                    {importantFeatures.map(feature => (
                      <div key={feature.feature_type} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            {feature.feature_type === 'max_images_per_product' 
                              ? 'Imagens/Produto' 
                              : 'Membros da Equipe'
                            }
                          </span>
                          <span>{feature.current_usage}/{feature.limit}</span>
                        </div>
                        <Progress 
                          value={feature.percentage} 
                          className="h-1"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão de Upgrade */}
                {subscription?.plan.type === 'basic' && (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <DropdownMenuSeparator />

          {/* Menu Actions */}
          <DropdownMenuItem onClick={() => navigate('/billing')} className="cursor-pointer">
            <Zap className="mr-2 h-4 w-4" />
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

      <PlanUpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </>
  );
};

export default ProfileDropdown;
