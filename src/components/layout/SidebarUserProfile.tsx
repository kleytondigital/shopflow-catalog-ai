
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Settings, Crown, Store, User, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProfilePlanCard } from '@/components/billing/ProfilePlanCard';

const SidebarUserProfile: React.FC = () => {
  const { profile, signOut } = useAuth();
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
                <p className="text-xs text-gray-500 truncate">
                  {profile.email}
                </p>
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
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {getRoleIcon()}
                  <span>{getRoleLabel()}</span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          
          {/* Card de plano detalhado - apenas para store_admin */}
          {profile.role === 'store_admin' && (
            <div className="px-2 py-3">
              <ProfilePlanCard />
            </div>
          )}

          <DropdownMenuSeparator />

          {/* Faturamento apenas para store_admin */}
          {profile.role === 'store_admin' && (
            <DropdownMenuItem onClick={() => navigate('/billing')} className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Faturamento</span>
            </DropdownMenuItem>
          )}

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
