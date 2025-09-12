import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uytkhyqwikdpplwsesoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGtoeXF3aWtkcHBsd3Nlc296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTQ5NTgsImV4cCI6MjA2NTI3MDk1OH0.EYnAN1U_m7kbHKLAFEmTcengj901O9FuVR_-fSJEArA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrdersData() {
  console.log('🔍 Testando dados de pedidos...\n');

  try {
    // 1. Contar total de pedidos
    console.log('1. Total de pedidos na tabela:');
    const { count: totalOrders, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erro ao contar pedidos:', countError);
    } else {
      console.log(`✅ Total de pedidos: ${totalOrders}`);
    }

    // 2. Verificar status dos pedidos
    console.log('\n2. Status dos pedidos:');
    const { data: statusData, error: statusError } = await supabase
      .from('orders')
      .select('status')
      .not('status', 'is', null);

    if (statusError) {
      console.error('❌ Erro ao buscar status:', statusError);
    } else {
      const statusGroups = statusData?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      console.log('✅ Status dos pedidos:', statusGroups);
    }

    // 3. Verificar pedidos por loja
    console.log('\n3. Pedidos por loja:');
    const { data: storeData, error: storeError } = await supabase
      .from('orders')
      .select('store_id, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (storeError) {
      console.error('❌ Erro ao buscar pedidos por loja:', storeError);
    } else {
      console.log('✅ Últimos 10 pedidos:');
      storeData?.forEach((order, index) => {
        console.log(`  ${index + 1}. Loja: ${order.store_id}, Status: ${order.status}, Valor: R$ ${order.total_amount}, Data: ${new Date(order.created_at).toLocaleDateString('pt-BR')}`);
      });
    }

    // 4. Testar consulta do Analytics (status delivered)
    console.log('\n4. Pedidos com status "delivered":');
    const { data: deliveredData, error: deliveredError } = await supabase
      .from('orders')
      .select('total_amount, status, created_at')
      .eq('status', 'delivered')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (deliveredError) {
      console.error('❌ Erro ao buscar pedidos delivered:', deliveredError);
    } else {
      console.log(`✅ Pedidos delivered (últimos 30 dias): ${deliveredData?.length || 0}`);
      const totalRevenue = deliveredData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      console.log(`✅ Receita total: R$ ${totalRevenue.toFixed(2)}`);
    }

    // 5. Testar consulta sem filtro de status
    console.log('\n5. Todos os pedidos (últimos 30 dias):');
    const { data: allOrdersData, error: allOrdersError } = await supabase
      .from('orders')
      .select('total_amount, status, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (allOrdersError) {
      console.error('❌ Erro ao buscar todos os pedidos:', allOrdersError);
    } else {
      console.log(`✅ Todos os pedidos (últimos 30 dias): ${allOrdersData?.length || 0}`);
      const totalRevenue = allOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      console.log(`✅ Receita total: R$ ${totalRevenue.toFixed(2)}`);
    }

    // 6. Verificar lojas disponíveis
    console.log('\n6. Lojas disponíveis:');
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('id, name')
      .limit(5);

    if (storesError) {
      console.error('❌ Erro ao buscar lojas:', storesError);
    } else {
      console.log('✅ Lojas disponíveis:');
      storesData?.forEach((store, index) => {
        console.log(`  ${index + 1}. ${store.name} (${store.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testOrdersData();

