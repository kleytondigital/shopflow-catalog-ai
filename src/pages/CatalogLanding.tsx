
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingBag, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StoreInfo {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  url_slug: string | null;
  is_active: boolean;
}

const CatalogLanding = () => {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        console.log('🏪 Buscando lojas ativas...');
        
        const { data, error } = await supabase
          .from('stores')
          .select('id, name, description, logo_url, url_slug, is_active')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Erro ao buscar lojas:', error);
          setError('Erro ao carregar lojas');
          return;
        }

        console.log('✅ Lojas carregadas:', data?.length || 0);
        setStores(data || []);
      } catch (err) {
        console.error('🚨 Erro geral:', err);
        setError('Erro ao carregar lojas');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando catálogos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Erro ao Carregar</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Catálogos Online</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Escolha uma Loja
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Navegue pelos catálogos das lojas disponíveis e descubra produtos incríveis.
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma loja disponível
            </h3>
            <p className="text-muted-foreground">
              Não há lojas ativas no momento. Tente novamente mais tarde.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-12 h-12 object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{store.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {store.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {store.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <Link
                      to={`/catalog/${store.url_slug || store.id}`}
                      className="block w-full"
                    >
                      <Button className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Ver Catálogo
                      </Button>
                    </Link>
                    
                    {store.url_slug && (
                      <p className="text-xs text-muted-foreground text-center">
                        /catalog/{store.url_slug}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Sistema de Catálogos Online - Encontre os melhores produtos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CatalogLanding;
