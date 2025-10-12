import './src/styles/main.css';
import { displaySupportLinks } from './main.js';
import { connectWalletMetaMask, disconnectWallet, checkCurrentNetwork } from './src/services/walletService.js';
import { loadUserProfile } from './src/services/contractService.js';

// ✅ Uygulama başlatma fonksiyonu
async function initApp() {
  console.log("🚀 Celo Engage Hub initializing...");

  // Sayfa yüklendiğinde destek linklerini göster
  displaySupportLinks();

  // Eğer MetaMask varsa olay dinleyicilerini ata
  if (window.ethereum) {
    window.ethereum.on('chainChanged', async (chainId) => {
      console.log("Chain changed:", chainId);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await checkCurrentNetwork(provider);
    });

    window.ethereum.on('accountsChanged', async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        await loadUserProfile(provider, signer, userAddress);
      }
    });
  }

  console.log("✅ Celo Engage Hub loaded successfully!");
}

// 🔹 DOM tamamen yüklendiğinde uygulamayı başlat
window.addEventListener('DOMContentLoaded', initApp);
