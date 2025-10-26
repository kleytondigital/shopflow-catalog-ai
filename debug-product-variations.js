/**
 * Script de debug para verificar variações de produtos no catálogo
 * Execute: node debug-product-variations.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wxfuhsxhsiqrmqfphwaz.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnVoc3hoc2lxcm1xZnBod2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDE4NjgsImV4cCI6MjA1MjAxNzg2OH0.3eaWowGS4TRkXIW5ub4nHXV5T3DUuNqO_p3pWyIiMBA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProductVariations() {
    try {
        console.log('🔍 DEBUG - Iniciando verificação de variações...\n');

        // 1. Buscar produtos que trabalham apenas com varejo
        const { data: stores, error: storesError } = await supabase
            .from('stores')
            .select('id, name, price_model')
            .eq('price_model', 'retail_only');

        if (storesError) {
            console.error('❌ Erro ao buscar lojas:', storesError);
            return;
        }

        console.log(`📊 Lojas "retail_only" encontradas: ${stores?.length || 0}\n`);

        if (!stores || stores.length === 0) {
            console.log('⚠️  Nenhuma loja "retail_only" encontrada');
            return;
        }

        // 2. Para cada loja, buscar produtos e suas variações
        for (const store of stores) {
            console.log(`\n🏪 Loja: ${store.name} (ID: ${store.id})`);
            console.log('─'.repeat(80));

            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, name')
                .eq('store_id', store.id)
                .eq('is_active', true)
                .limit(5); // Limitar a 5 produtos por loja para debug

            if (productsError) {
                console.error('❌ Erro ao buscar produtos:', productsError);
                continue;
            }

            console.log(`📦 Produtos encontrados: ${products?.length || 0}`);

            if (!products || products.length === 0) {
                console.log('⚠️  Nenhum produto encontrado para esta loja');
                continue;
            }

            // 3. Para cada produto, buscar variações
            for (const product of products) {
                console.log(`\n   📦 Produto: ${product.name}`);

                const { data: variations, error: variationsError } = await supabase
                    .from('product_variations')
                    .select('*')
                    .eq('product_id', product.id)
                    .eq('is_active', true);

                if (variationsError) {
                    console.error('   ❌ Erro ao buscar variações:', variationsError);
                    continue;
                }

                console.log(`   🎨 Variações encontradas: ${variations?.length || 0}`);

                if (!variations || variations.length === 0) {
                    console.log('   ⚠️  Produto sem variações');
                    continue;
                }

                // Agrupar cores e tamanhos únicos
                const colors = [...new Set(variations.filter(v => v.color).map(v => v.color))];
                const sizes = [...new Set(variations.filter(v => v.size).map(v => v.size))];
                const grades = variations.filter(v => v.is_grade || v.variation_type === 'grade');

                console.log(`   🎨 Cores únicas: ${colors.length} → [${colors.join(', ')}]`);
                console.log(`   📏 Tamanhos únicos: ${sizes.length} → [${sizes.join(', ')}]`);
                console.log(`   📦 Grades: ${grades.length}`);

                // Mostrar detalhes de cada variação
                variations.forEach((v, idx) => {
                    console.log(`\n      Variação ${idx + 1}:`);
                    console.log(`         ID: ${v.id}`);
                    console.log(`         Cor: ${v.color || 'N/A'}`);
                    console.log(`         Tamanho: ${v.size || 'N/A'}`);
                    console.log(`         SKU: ${v.sku || 'N/A'}`);
                    console.log(`         Tipo: ${v.variation_type || 'N/A'}`);
                    console.log(`         É Grade?: ${v.is_grade ? 'SIM' : 'NÃO'}`);
                    if (v.is_grade) {
                        console.log(`         Grade Nome: ${v.grade_name || 'N/A'}`);
                        console.log(`         Grade Cor: ${v.grade_color || 'N/A'}`);
                        console.log(`         Grade Tamanhos: ${v.grade_sizes ? JSON.stringify(v.grade_sizes) : 'N/A'}`);
                        console.log(`         Grade Pares: ${v.grade_pairs ? JSON.stringify(v.grade_pairs) : 'N/A'}`);
                    }
                    console.log(`         Estoque: ${v.stock || 0}`);
                    console.log(`         Ativo?: ${v.is_active ? 'SIM' : 'NÃO'}`);
                });
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ DEBUG concluído!');
    } catch (error) {
        console.error('💥 Erro inesperado:', error);
    }
}

debugProductVariations();

