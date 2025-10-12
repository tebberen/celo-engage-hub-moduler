// 🔧 app.js — Final stable version (modüler yapı)
import { WalletService } from './services/walletService.js';
import { ContractService } from './services/contractService.js';
import { 
    loadLinksFromStorage, 
    saveLinksToStorage, 
    displaySupportLinks,
    handleCommunityLink 
} from './utils/helpers.js';

class CeloEngageHub {
    constructor() {
        this.walletService = new WalletService();
        this.contractService = new ContractService(this.walletService);
        this.allCommunityLinks = loadLinksFromStorage();
        this.userProfile = null;

        this.initializeApp();
    }

    initializeApp() {
        // Olay bağlama
        this.bindEvents();
        this.checkWalletConnection();

        // Linkleri yükle
        displaySupportLinks(this.allCommunityLinks, 'linksContainer');
        window.handleCommunityLink = handleCommunityLink;
    }

    bindEvents() {
        const connectBtn = document.getElementById('connectWalletBtn');
        const modalMetaMaskBtn = document.getElementById('modalMetaMaskBtn');
        const closeModalBtn = document.getElementById('closeWalletModalBtn');
        const disconnectBtn = document.getElementById('disconnectWalletBtn');

        if (connectBtn) connectBtn.addEventListener('click', () => this.openWalletModal());
        if (modalMetaMaskBtn) modalMetaMaskBtn.addEventListener('click', () => this.connectMetaMask());
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeWalletModal());
        if (disconnectBtn) disconnectBtn.addEventListener('click', () => this.disconnectWallet());
    }

    openWalletModal() {
        const modal = document.getElementById('walletModal');
        if (modal) modal.classList.remove('hidden');
    }

    closeWalletModal() {
        const modal = document.getElementById('walletModal');
        if (modal) modal.classList.add('hidden');
    }

    async connectMetaMask() {
        const connected = await this.walletService.connectMetaMask();
        if (connected) {
            this.onWalletConnected();
        } else {
            alert('MetaMask bağlantısı başarısız. Lütfen tekrar deneyin.');
        }
    }

    onWalletConnected() {
        this.updateUI();
        this.closeWalletModal();
    }

    disconnectWallet() {
        this.walletService.disconnect();
        this.updateUI();
    }

    updateUI() {
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');
        const networkInfo = document.getElementById('networkInfo');
        const connectBtn = document.getElementById('connectWalletBtn');

        if (this.walletService.getIsConnected()) {
            walletAddress.textContent = this.walletService.getShortAddress();
            const network = this.walletService.getNetworkInfo();
            networkInfo.textContent = `🌐 ${network.name}`;
            networkInfo.style.color = network.color;
            walletInfo.classList.remove('hidden');
            connectBtn.style.display = 'none';
        } else {
            walletInfo.classList.add('hidden');
            connectBtn.style.display = 'inline-block';
        }
    }

    async checkWalletConnection() {
        this.updateUI();
    }
}

// ✅ Uygulama başlatma
window.addEventListener('DOMContentLoaded', () => {
    new CeloEngageHub();
});
