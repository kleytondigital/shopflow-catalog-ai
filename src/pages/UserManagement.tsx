import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { useStores } from "@/hooks/useStores";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Users,
  Store,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  UserPlus,
  Shield,
} from "lucide-react";

const UserManagement = () => {
  const {
    users,
    loading: usersLoading,
    updateUserStore,
    updateUserRole,
    fetchUsers,
  } = useUsers();
  const { stores, loading: storesLoading } = useStores();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");

  const handleUpdateUserStore = async (userId: string, storeId: string) => {
    setUpdating(userId);

    try {
      const { error } = await updateUserStore(
        userId,
        storeId === "none" ? null : storeId
      );

      if (error) {
        console.error("Erro na atualização:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a associação da loja",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Usuário associado à loja com sucesso",
        });
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar usuário",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateUserRole = async (
    userId: string,
    role: "superadmin" | "store_admin"
  ) => {
    setUpdating(userId);

    try {
      const { error } = await updateUserRole(userId, role);

      if (error) {
        console.error("Erro na atualização do papel:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o papel do usuário",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Papel do usuário atualizado com sucesso",
        });
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar papel",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRefresh = async () => {
    await fetchUsers();
    toast({
      title: "Atualizado",
      description: "Lista de usuários atualizada",
    });
  };

  // Filtros
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesStore =
      storeFilter === "all" ||
      (storeFilter === "no-store" && !user.store_id) ||
      (storeFilter === "with-store" && user.store_id) ||
      user.store_id === storeFilter;

    return matchesSearch && matchesRole && matchesStore;
  });

  const usersWithoutStore = users.filter(
    (user) => user.role === "store_admin" && !user.store_id
  );
  const superadmins = users.filter((user) => user.role === "superadmin");
  const storeAdmins = users.filter((user) => user.role === "store_admin");

  const breadcrumbs = [
    { href: "/", label: "Dashboard" },
    { label: "Gerenciamento de Usuários", current: true },
  ];

  if (profile?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  if (usersLoading || storesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros e ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os papéis</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
              <SelectItem value="store_admin">Admin da Loja</SelectItem>
            </SelectContent>
          </Select>
          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Loja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="no-store">Sem loja</SelectItem>
              <SelectItem value="with-store">Com loja</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold">{superadmins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Admins de Loja</p>
                <p className="text-2xl font-bold">{storeAdmins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Sem Loja</p>
                <p className="text-2xl font-bold">{usersWithoutStore.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {usersWithoutStore.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Existem {usersWithoutStore.length} usuários do tipo "Admin da Loja"
            sem loja associada.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário encontrado
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        {user.full_name || user.email}
                      </h3>
                      <Badge
                        variant={
                          user.role === "superadmin" ? "default" : "secondary"
                        }
                      >
                        {user.role === "superadmin"
                          ? "Super Admin"
                          : "Admin da Loja"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.store_id && (
                      <p className="text-sm text-blue-600">
                        Loja:{" "}
                        {stores.find((s) => s.id === user.store_id)?.name ||
                          "Não encontrada"}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {user.role === "store_admin" && (
                      <Select
                        value={user.store_id || "none"}
                        onValueChange={(value) =>
                          handleUpdateUserStore(user.id, value)
                        }
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Selecionar loja" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma loja</SelectItem>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleUpdateUserRole(
                          user.id,
                          value as "superadmin" | "store_admin"
                        )
                      }
                      disabled={updating === user.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                        <SelectItem value="store_admin">
                          Admin da Loja
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
