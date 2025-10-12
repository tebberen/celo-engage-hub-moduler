import { WalletService } from './services/walletService.js';
import { ContractService } from './services/contractService.js';
import { displaySupportLinks } from './utils/helpers.js';

class CeloEngageHub {
  constructor() {
    this.walletService = new WalletService();
    this.contractService = new ContractService(this.walletService);

    this.initializeApp();
  }

  initializeApp() {
    this.bindEvents();
    displaySupportLinks('linksContainer');
  }

  bindEvents() {
    document.getElementById('connectWalletBtn').addEventListener('click', () => this.connectWallet());
    document.getElementById('createProposalBtn').addEventListener('click', () => this.createProposal());
    document.getElementById('governanceBtn').addEventListener('click', () => this.toggleGovernanceSection());
    document.getElementById('gmBtn').addEventListener('click', () => alert('GM 🌞 Have a productive day on Celo!'));
    document.getElementById('deployBtn').addEventListener('click', () => alert('🚀 Deploy feature coming soon!'));
  }

  async connectWallet() {
    const connected = await this.walletService.connectMetaMask();
    if (connected) {
      this.updateUI();
    } else {
      alert('❌ MetaMask connection failed. Please try again.');
    }
  }

  async createProposal() {
    const title = document.getElementById('proposalTitle').value.trim();
    const description = document.getElementById('proposalDescription').value.trim();

    if (!title || !description) {
      alert("Please fill in both title and description.");
      return;
    }

    try {
      await this.contractService.createProposal(title, description);
      alert("✅ Proposal created successfully!");
    } catch (error) {
      alert("❌ Proposal creation failed: " + error.message);
    }
  }

  toggleGovernanceSection() {
    const section = document.getElementById('governanceSection');
    section.classList.toggle('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
}

// ✅ Uygulama başlat
window.addEventListener('DOMContentLoaded', () => new CeloEngageHub());
