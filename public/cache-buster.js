// Cache Buster para VendeMais
// Força atualização quando há mudanças nos arquivos

(function() {
    'use strict';

    const CACHE_VERSION = 'v' + Date.now();
    const APP_VERSION = '2.0.1'; // Incrementar sempre que houver mudanças importantes

    console.log('🚀 VendeMais Cache Buster - Versão:', APP_VERSION);

    // Verificar se é uma nova versão
    const lastVersion = localStorage.getItem('vendemais-version');

    if (lastVersion !== APP_VERSION) {
        console.log('🔄 Nova versão detectada, limpando cache...');

        // Limpar localStorage específico (manter dados do usuário)
        const keysToKeep = ['supabase.auth.token', 'user-preferences'];
        const allKeys = Object.keys(localStorage);

        allKeys.forEach(key => {
            if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
                localStorage.removeItem(key);
            }
        });

        // Limpar cache do browser se possível
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            });
        }

        // Salvar nova versão
        localStorage.setItem('vendemais-version', APP_VERSION);

        // Recarregar página para garantir novos arquivos
        if (lastVersion) {
            console.log('♻️ Recarregando para aplicar atualizações...');
            window.location.reload(true);
        }
    }

    // Adicionar timestamp aos requests para evitar cache
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        if (args[0] && typeof args[0] === 'string') {
            const url = new URL(args[0], window.location.origin);
            if (url.origin === window.location.origin) {
                url.searchParams.set('_cb', CACHE_VERSION);
                args[0] = url.toString();
            }
        }
        return originalFetch.apply(this, args);
    };

    console.log('✅ Cache buster ativado');
})();