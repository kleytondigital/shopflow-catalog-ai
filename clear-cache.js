// Script para limpar cache e localStorage
console.log('🧹 Limpando cache do navegador...');

// Limpar localStorage
localStorage.clear();
console.log('✅ localStorage limpo');

// Limpar sessionStorage  
sessionStorage.clear();
console.log('✅ sessionStorage limpo');

// Forçar reload sem cache
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
            registration.unregister();
        }
        console.log('✅ Service Workers removidos');
    });
}

// Recarregar página sem cache
window.location.reload(true);