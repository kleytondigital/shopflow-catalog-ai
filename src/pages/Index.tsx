
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperadminDashboard from '@/components/dashboard/SuperadminDashboard';
import StoreDashboard from '@/components/dashboard/StoreDashboard';
import ProductList from '@/components/products/ProductList';
import AIDescriptionGenerator from '@/components/ai/AIDescriptionGenerator';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { profile, signOut } = useAuth();
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data para produtos - será substituído pelos dados reais do hook useProducts
  const mockProducts = [
    {
      id: '1',
      name: 'Camiseta Premium Algodão',
      category: 'Roupas',
      price: 49.90,
      wholesalePrice: 35.00,
      stock: 25,
      status: 'active' as const,
      image: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Tênis Esportivo Confort',
      category: 'Calçados',
      price: 189.90,
      wholesalePrice: 140.00,
      stock: 12,
      status: 'active' as const,
      image: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Mochila Executiva',
      category: 'Acessórios',
      price: 89.90,
      stock: 3,
      status: 'inactive' as const,
      image: '/placeholder.svg'
    }
  ];

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

  const handleProductEdit = (product: any) => {
    toast({
      title: "Editar Produto",
      description: `Abrindo editor para ${product.name}`,
    });
  };

  const handleProductDelete = (id: string) => {
    toast({
      title: "Produto Excluído",
      description: "Produto removido com sucesso",
    });
  };

  const handleGenerateDescription = (id: string) => {
    const product = mockProducts.find(p => p.id === id);
    if (product) {
      setSelectedProduct(product);
      setShowAIDialog(true);
    }
  };

  const handleAddProduct = () => {
    toast({
      title: "Adicionar Produto",
      description: "Abrindo formulário de novo produto",
    });
  };

  // Renderizar dashboard específico baseado no papel do usuário
  if (profile?.role === 'superadmin') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">
                  Bem-vindo, {profile?.full_name || profile?.email}
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
  } else {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">
                  Bem-vindo, {profile?.full_name || profile?.email}
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

          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerar Descrição com IA</DialogTitle>
              </DialogHeader>
              {selectedProduct && (
                <AIDescriptionGenerator
                  productName={selectedProduct.name}
                  category={selectedProduct.category}
                  onDescriptionGenerated={(description, seo) => {
                    console.log('Descrição gerada:', description);
                    console.log('SEO gerado:', seo);
                    setShowAIDialog(false);
                    toast({
                      title: "Sucesso!",
                      description: "Descrição e SEO aplicados ao produto",
                    });
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </ProtectedRoute>
    );
  }
};

export default Index;
