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
        document.getElementById('disconnectWalletBtn').addEventListener('click', () => this.disconnectWallet());
        const governanceBtn = document.getElementById('governanceBtn');
        if (governanceBtn) governanceBtn.addEventListener('click', () => this.showGovernance());
    }

    async connectWallet() {
        const connected = await this.walletService.connectMetaMask();
        if (connected) {
            this.onWalletConnected();
        } else {
            alert('MetaMask bağlantısı başarısız. Lütfen tekrar deneyin.');
        }
    }

    onWalletConnected() {
        this.updateUI();
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

    showGovernance() {
        const govSection = document.getElementById('governanceSection');
        const otherSections = ['step1', 'badgesSection'];

        govSection.classList.remove('hidden');
        otherSections.forEach(id => {
            const section = document.getElementById(id);
            if (section) section.classList.add('hidden');
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ✅ DOM tamamen yüklendikten sonra başlat
window.addEventListener('DOMContentLoaded', () => {
    new CeloEngageHub();
});
