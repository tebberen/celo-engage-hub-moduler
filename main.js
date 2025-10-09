// Bu dosya Vite için giriş noktası olarak kullanılabilir
// Eğer Vite kullanıyorsanız, bu dosya app.js'i import edebilir

import './src/app.js';

console.log('🚀 Celo Engage Hub başlatılıyor...');

// Vite için hot module replacement (HMR) desteği
if (import.meta.hot) {
    import.meta.hot.accept();
}
