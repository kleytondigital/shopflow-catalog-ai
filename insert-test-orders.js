import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uytkhyqwikdpplwsesoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGtoeXF3aWtkcHBsd3Nlc296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTQ5NTgsImV4cCI6MjA2NTI3MDk1OH0.EYnAN1U_m7kbHKLAFEmTcengj901O9FuVR_-fSJEArA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestOrders() {
  console.log('🔄 Inserindo dados de teste na tabela orders...\n');

  try {
    // Primeiro, buscar as lojas disponíveis
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name')
      .limit(5);

    if (storesError) {
      console.error('❌ Erro ao buscar lojas:', storesError);
      return;
    }

    console.log(`✅ Encontradas ${stores?.length || 0} lojas`);

    if (!stores || stores.length === 0) {
      console.log('❌ Nenhuma loja encontrada. Criando dados de teste...');
      return;
    }

    // Criar pedidos de teste para as últimas 30 dias
    const testOrders = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const randomStore = stores[Math.floor(Math.random() * stores.length)];
      const randomStatus = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'][Math.floor(Math.random() * 6)];
      const randomAmount = Math.floor(Math.random() * 2000) + 50; // R$ 50 a R$ 2050

      testOrders.push({
        store_id: randomStore.id,
        customer_name: `Cliente ${i + 1}`,
        customer_email: `cliente${i + 1}@email.com`,
        customer_phone: `1199999${String(i).padStart(4, '0')}`,
        total_amount: randomAmount,
        status: randomStatus,
        order_type: 'retail',
        items: [
          {
            product_id: `prod-${i + 1}`,
            product_name: `Produto ${i + 1}`,
            quantity: Math.floor(Math.random() * 5) + 1,
            price: randomAmount / (Math.floor(Math.random() * 3) + 1)
          }
        ],
        shipping_address: {
          street: `Rua ${i + 1}`,
          number: `${i + 1}00`,
          city: 'São Paulo',
          state: 'SP',
          zipCode: `0${i + 1}000-000`
        },
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString()
      });
    }

    // Inserir os pedidos
    const { data: insertedOrders, error: insertError } = await supabase
      .from('orders')
      .insert(testOrders)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir pedidos:', insertError);
      return;
    }

    console.log(`✅ ${insertedOrders?.length || 0} pedidos inseridos com sucesso!`);

    // Verificar os dados inseridos
    const { data: allOrders, error: countError } = await supabase
      .from('orders')
      .select('id, store_id, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (countError) {
      console.error('❌ Erro ao verificar pedidos:', countError);
    } else {
      console.log('\n📊 Últimos 10 pedidos inseridos:');
      allOrders?.forEach((order, index) => {
        console.log(`  ${index + 1}. Loja: ${order.store_id}, Status: ${order.status}, Valor: R$ ${order.total_amount}, Data: ${new Date(order.created_at).toLocaleDateString('pt-BR')}`);
      });
    }

    // Estatísticas por status
    const statusCounts = {};
    allOrders?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    console.log('\n📈 Estatísticas por status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} pedidos`);
    });

    // Calcular receita total
    const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    console.log(`\n💰 Receita total: R$ ${totalRevenue.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

insertTestOrders();

