import './src/styles/main.css';
import { displaySupportLinks } from './main.js';
import { connectWalletMetaMask, disconnectWallet, checkCurrentNetwork } from './src/services/walletService.js';
import { loadUserProfile } from './src/services/contractService.js';
import { initGovernance } from './src/services/governanceService.js';
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

async function initApp() {
  console.log("🚀 Celo Engage Hub initializing...");
  displaySupportLinks();

  // 🏛️ Governance butonu
  const governanceBtn = document.getElementById("governanceButton");
  if (governanceBtn) {
    governanceBtn.addEventListener("click", () => {
      document.getElementById("governanceSection").classList.remove("hidden");
      document.getElementById("proposalsContainer").innerHTML = "";
      initGovernance();
    });
  }

  // 🔗 Wallet bağlantısı ve değişiklik olayları
  if (window.ethereum) {
    window.ethereum.on('chainChanged', async () => {
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

window.addEventListener('DOMContentLoaded', initApp);
