// 🔧 app.js (temiz sürüm)
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
        this.hasSupported = false;
        this.userProfile = null;

        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.checkWalletConnection();
        displaySupportLinks(this.allCommunityLinks, 'linksContainer');
        window.handleCommunityLink = handleCommunityLink;
    }

    bindEvents() {
        document.getElementById('connectWalletBtn').addEventListener('click', () => this.connectWallet());
        document.getElementById('modalMetaMaskBtn').addEventListener('click', () => this.connectMetaMask());
        // ⚠️ WalletConnect butonu geçici olarak devre dışı
        // document.getElementById('modalWalletConnectBtn').addEventListener('click', () => this.connectWalletConnect());
        document.getElementById('closeWalletModalBtn').addEventListener('click', () => this.closeWalletModal());
        document.getElementById('disconnectWalletBtn').addEventListener('click', () => this.disconnectWallet());
    }

    async connectWallet() {
        this.openWalletModal();
    }

    openWalletModal() {
        document.getElementById('walletModal').classList.remove('hidden');
    }

    closeWalletModal() {
        document.getElementById('walletModal').classList.add('hidden');
    }

    async connectMetaMask() {
        const connected = await this.walletService.connectMetaMask();
        if (connected) {
            this.onWalletConnected();
        } else {
            alert('MetaMask bağlantısı başarısız. Lütfen tekrar deneyin.');
        }
    }

    async connectWalletConnect() {
        // Şu anda devre dışı
        alert("WalletConnect geçici olarak devre dışı.");
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

// ✅ DOM tamamen yüklendikten sonra başlat
window.addEventListener('DOMContentLoaded', () => {
    new CeloEngageHub();
});
