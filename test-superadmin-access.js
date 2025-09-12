import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uytkhyqwikdpplwsesoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGtoeXF3aWtkcHBsd3Nlc296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTQ5NTgsImV4cCI6MjA2NTI3MDk1OH0.EYnAN1U_m7kbHKLAFEmTcengj901O9FuVR_-fSJEArA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSuperadminAccess() {
    console.log('🔍 Testando acesso do superadmin aos dados...\n');

    try {
        // 1. Verificar se há dados na tabela orders
        console.log('1. Verificando orders:');
        const { data: orders, error: ordersError, count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .limit(10);

        if (ordersError) {
            console.error('❌ Erro ao acessar orders:', ordersError);
            console.log('🔧 Código:', ordersError.code);
            console.log('🔧 Mensagem:', ordersError.message);
        } else {
            console.log(`✅ Orders encontrados: ${ordersCount || 0}`);

            if (orders && orders.length > 0) {
                console.log('📊 Primeiros pedidos:');
                orders.forEach((order, index) => {
                    console.log(`  ${index + 1}. ID: ${order.id}, Loja: ${order.store_id}, Status: ${order.status}, Valor: R$ ${order.total_amount}, Data: ${new Date(order.created_at).toLocaleDateString('pt-BR')}`);
                });
            }
        }

        // 2. Verificar status dos pedidos
        console.log('\n2. Verificando status dos pedidos:');
        const { data: statusData, error: statusError } = await supabase
            .from('orders')
            .select('status')
            .not('status', 'is', null);

        if (statusError) {
            console.error('❌ Erro ao verificar status:', statusError);
        } else {
            const statusGroups = statusData ? .reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {});
            console.log('✅ Status dos pedidos:', statusGroups);
        }

        // 3. Testar consulta específica do Analytics
        console.log('\n3. Testando consulta do Analytics:');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const { data: analyticsData, error: analyticsError } = await supabase
            .from('orders')
            .select('total_amount, status, created_at, store_id')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false });

        if (analyticsError) {
            console.error('❌ Erro na consulta do Analytics:', analyticsError);
        } else {
            console.log(`✅ Pedidos dos últimos 30 dias: ${analyticsData?.length || 0}`);

            if (analyticsData && analyticsData.length > 0) {
                const totalRevenue = analyticsData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
                const deliveredOrders = analyticsData.filter(order => order.status === 'delivered');
                const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

                console.log(`💰 Receita total (30 dias): R$ ${totalRevenue.toFixed(2)}`);
                console.log(`📦 Pedidos entregues: ${deliveredOrders.length}`);
                console.log(`💰 Receita entregue: R$ ${deliveredRevenue.toFixed(2)}`);

                // Agrupar por loja
                const storeStats = analyticsData.reduce((acc, order) => {
                    if (!acc[order.store_id]) {
                        acc[order.store_id] = { orders: 0, revenue: 0 };
                    }
                    acc[order.store_id].orders += 1;
                    acc[order.store_id].revenue += order.total_amount || 0;
                    return acc;
                }, {});

                console.log('\n📊 Estatísticas por loja:');
                Object.entries(storeStats).forEach(([storeId, stats]) => {
                    console.log(`  Loja ${storeId}: ${stats.orders} pedidos, R$ ${stats.revenue.toFixed(2)}`);
                });
            }
        }

        // 4. Verificar se há dados em outras tabelas
        console.log('\n4. Verificando outras tabelas:');
        const tables = ['stores', 'products', 'profiles'];

        for (const table of tables) {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: ${count || 0} registros`);
            }
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testSuperadminAccess();
