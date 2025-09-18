import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uytkhyqwikdpplwsesoz.supabase.co';
// Usando chave anônima para testar RLS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGtoeXF3aWtkcHBsd3Nlc296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTQ5NTgsImV4cCI6MjA2NTI3MDk1OH0.EYnAN1U_m7kbHKLAFEmTcengj901O9FuVR_-fSJEArA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWithServiceKey() {
    console.log('🔍 Verificando dados com chave anônima (RLS ativo)...\n');

    try {
        // 1. Verificar se há dados na tabela orders
        console.log('1. Verificando orders com RLS:');
        const { data: orders, error: ordersError, count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        if (ordersError) {
            console.error('❌ Erro ao acessar orders:', ordersError);
            console.log('🔧 Código do erro:', ordersError.code);
            console.log('🔧 Mensagem:', ordersError.message);
        } else {
            console.log(`✅ Orders encontrados: ${ordersCount || 0}`);
        }

        // 2. Verificar se há dados sem RLS (usando função SQL)
        console.log('\n2. Verificando orders sem RLS:');
        const { data: ordersNoRLS, error: ordersNoRLSError } = await supabase
            .rpc('get_orders_count');

        if (ordersNoRLSError) {
            console.log('❌ Função get_orders_count não existe, tentando consulta direta...');

            // Tentar consulta direta
            const { data: directOrders, error: directError } = await supabase
                .from('orders')
                .select('id')
                .limit(1);

            if (directError) {
                console.error('❌ Erro na consulta direta:', directError);
            } else {
                console.log(`✅ Consulta direta funcionou: ${directOrders?.length || 0} registros`);
            }
        } else {
            console.log(`✅ Orders sem RLS: ${ordersNoRLS || 0}`);
        }

        // 3. Verificar políticas RLS
        console.log('\n3. Verificando políticas RLS:');
        const { data: policies, error: policiesError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'orders');

        if (policiesError) {
            console.log('❌ Erro ao verificar políticas:', policiesError);
        } else {
            console.log(`✅ Políticas RLS encontradas: ${policies?.length || 0}`);
            policies ? .forEach((policy, index) => {
                console.log(`  ${index + 1}. ${policy.policyname}: ${policy.cmd} - ${policy.qual}`);
            });
        }

        // 4. Verificar se o usuário atual tem permissões
        console.log('\n4. Verificando usuário atual:');
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.log('❌ Erro ao verificar usuário:', userError);
        } else {
            console.log(`✅ Usuário atual: ${user ? 'Logado' : 'Anônimo'}`);
            if (user) {
                console.log(`   ID: ${user.id}`);
                console.log(`   Email: ${user.email}`);
            }
        }

        // 5. Verificar se há dados em outras tabelas relacionadas
        console.log('\n5. Verificando outras tabelas:');
        const tables = ['stores', 'products', 'profiles', 'catalogs'];

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

checkWithServiceKey();

