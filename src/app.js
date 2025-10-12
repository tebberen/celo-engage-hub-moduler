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

    // Global function for HTML onclick
    window.handleCommunityLink = handleCommunityLink;
    window.voteProposal = (proposalId, support) => this.voteProposal(proposalId, support);
  }

  bindEvents() {
    // Wallet connection events
    const connectBtn = document.getElementById('connectWalletBtn');
    const metamaskBtn = document.getElementById('modalMetaMaskBtn');
    const walletConnectBtn = document.getElementById('modalWalletConnectBtn');
    const closeModalBtn = document.getElementById('closeWalletModalBtn');
    const disconnectBtn = document.getElementById('disconnectWalletBtn');

    if (connectBtn) connectBtn.addEventListener('click', () => this.connectWallet());
    if (metamaskBtn) metamaskBtn.addEventListener('click', () => this.connectMetaMask());
    if (walletConnectBtn) walletConnectBtn.addEventListener('click', () => this.connectWalletConnect());
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeWalletModal());
    if (disconnectBtn) disconnectBtn.addEventListener('click', () => this.disconnectWallet());

    // Application events
    const submitBtn = document.getElementById('submitLinkBtn');
    const setupBtn = document.getElementById('setupProfileBtn');
    const proposalBtn = document.getElementById('createProposalBtn');

    if (submitBtn) submitBtn.addEventListener('click', () => this.submitLink());
    if (setupBtn) setupBtn.addEventListener('click', () => this.setupUserProfile());
    if (proposalBtn) proposalBtn.addEventListener('click', () => this.createProposal());

    // Ethereum events
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        console.log("Chain changed to:", chainId);
        this.walletService.currentChainId = parseInt(chainId, 16).toString();
        this.checkCurrentNetwork();
        if (this.walletService.getIsConnected()) {
          this.loadPlatformStats();
          this.loadUserProfile();
        }
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else if (this.walletService.getIsConnected()) {
          location.reload();
        }
      });
    }
  }

  async connectWallet() {
    this.openWalletModal();
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
    if (connected) this.onWalletConnected();
    else alert('MetaMask bağlantısı başarısız. Lütfen tekrar deneyin.');
  }

  async connectWalletConnect() {
    const connected = await this.walletService.connectWalletConnect();
    if (connected) this.onWalletConnected();
    else alert('WalletConnect bağlantısı başarısız. Lütfen tekrar deneyin.');
  }

  onWalletConnected() {
    this.updateUI();
    this.loadPlatformStats();
    this.loadUserProfile();
    this.closeWalletModal();
  }

  disconnectWallet() {
    this.walletService.disconnect();
    this.updateUI();
    this.allCommunityLinks = loadLinksFromStorage();
    displaySupportLinks(this.allCommunityLinks, 'linksContainer');

    const step2 = document.getElementById('step2');
    const step1 = document.getElementById('step1');
    if (step2) step2.classList.add('hidden');
    if (step1) step1.classList.remove('hidden');
  }

  updateUI() {
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    const networkInfo = document.getElementById('networkInfo');
    const connectBtn = document.getElementById('connectWalletBtn');

    if (this.walletService.getIsConnected()) {
      if (walletAddress) walletAddress.textContent = this.walletService.getShortAddress();

      const network = this.walletService.getNetworkInfo();
      if (networkInfo) {
        networkInfo.textContent = `🌐 ${network.name}`;
        networkInfo.style.color = network.color;
      }

      if (walletInfo) walletInfo.classList.remove('hidden');
      if (connectBtn) connectBtn.style.display = 'none';
    } else {
      if (walletInfo) walletInfo.classList.add('hidden');
      if (connectBtn) connectBtn.style.display = 'inline-block';
    }
  }

  async checkWalletConnection() {
    this.updateUI();
  }

  async checkCurrentNetwork() {
    const isCorrectNetwork = await this.walletService.checkCurrentNetwork();
    const networkWarning = document.getElementById('networkWarning');
    const networkInfo = document.getElementById('networkInfo');

    if (isCorrectNetwork) {
      if (networkWarning) networkWarning.classList.add('hidden');
      if (networkInfo) {
        const network = this.walletService.getNetworkInfo();
        networkInfo.textContent = `🌐 ${network.name}`;
        networkInfo.style.color = network.color;
      }
    } else {
      if (networkWarning) networkWarning.classList.remove('hidden');
      if (networkInfo) {
        networkInfo.textContent = '⚠️ Wrong Network';
        networkInfo.style.color = '#EF4444';
      }
    }
    return isCorrectNetwork;
  }

  async loadPlatformStats() {
    try {
      const stats = await this.contractService.getPlatformStats();
      document.getElementById('totalUsers').textContent = stats.totalUsers;
      document.getElementById('totalProposals').textContent = stats.totalProposals;
      document.getElementById('totalBadges').textContent = "0";
      document.getElementById('totalSupports').textContent = "0";
      document.getElementById('platformStats').classList.remove('hidden');
    } catch (error) {
      console.error("Error loading platform stats:", error);
    }
  }

  async loadUserProfile() {
    try {
      this.userProfile = await this.contractService.getUserProfile();

      const profileSection = document.getElementById('userProfileSection');
      const governance = document.getElementById('governanceSection');
      const badges = document.getElementById('badgesSection');

      if (this.userProfile && this.userProfile.isActive) {
        if (profileSection) profileSection.classList.add('hidden');
        if (governance) governance.classList.remove('hidden');
        if (badges) badges.classList.remove('hidden');
        this.loadUserBadges();
        this.loadProposals();
      } else {
        if (profileSection) profileSection.classList.remove('hidden');
        if (governance) governance.classList.add('hidden');
        if (badges) badges.classList.add('hidden');
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      const profileSection = document.getElementById('userProfileSection');
      if (profileSection) profileSection.classList.remove('hidden');
    }
  }

  async setupUserProfile() {
    if (!this.walletService.getIsConnected()) {
      const connected = await this.connectMetaMask();
      if (!connected) return;
    }

    const username = document.getElementById("userUsername").value.trim();
    if (!username) {
      alert("Lütfen kullanıcı adınızı girin");
      return;
    }

    try {
      const btn = document.getElementById("setupProfileBtn");
      btn.disabled = true;
      btn.textContent = "⏳ Ayarlanıyor...";

      const profile = await this.contractService.getUserProfile();
      let receipt;

      if (profile && profile.isActive) {
        receipt = await this.contractService.updateProfile(username);
      } else {
        receipt = await this.contractService.registerUser(username);
      }

      console.log("Profile setup successful:", receipt);
      this.loadUserProfile();
    } catch (error) {
      console.error("Profile setup error:", error);
      alert("Profil ayarlanırken hata: " + error.message);
    } finally {
      const btn = document.getElementById("setupProfileBtn");
      btn.disabled = false;
      btn.textContent = "🚀 Profili Ayarla";
    }
  }

  async submitLink() {
    if (!this.walletService.getIsConnected()) {
      const connected = await this.connectMetaMask();
      if (!connected) return;
    }

    if (!this.hasSupported) {
      alert("Lütfen önce en az bir topluluk üyesini destekleyin!");
      return;
    }

    const isCorrectNetwork = await this.checkCurrentNetwork();
    if (!isCorrectNetwork) {
      alert("Lütfen linkinizi göndermek için Celo ağına geçin");
      return;
    }

    const userLink = document.getElementById("userLinkInput").value.trim();
    if (!userLink) {
      alert("Lütfen önce linkinizi girin.");
      return;
    }

    if (!userLink.startsWith('http://') && !userLink.startsWith('https://')) {
      alert("Lütfen http:// veya https:// ile başlayan geçerli bir URL girin");
      return;
    }

    try {
      const btn = document.getElementById("submitLinkBtn");
      btn.disabled = true;
      btn.textContent = "⏳ Gönderiliyor...";

      const profile = await this.contractService.getUserProfile();
      if (!profile.isActive) {
        await this.contractService.registerUser("User");
      }

      const newLinkData = {
        link: userLink,
        clickCount: 0,
        timestamp: Date.now(),
        submitter: this.walletService.getUserAddress()
      };

      this.allCommunityLinks.unshift(newLinkData);
      saveLinksToStorage(this.allCommunityLinks);
      displaySupportLinks(this.allCommunityLinks, 'linksContainer');

      document.getElementById("userLinkInput").value = "";
      this.hasSupported = false;
      document.getElementById('step2').classList.add('hidden');
      document.getElementById('step1').classList.remove('hidden');

      alert("Link başarıyla gönderildi!");
    } catch (error) {
      console.error("Submit error:", error);
      alert("Link gönderilirken hata: " + error.message);
    } finally {
      const btn = document.getElementById("submitLinkBtn");
      btn.disabled = false;
      btn.textContent = "✍️ Link Gönder";
    }
  }
}

// ✅ DOM tamamen yüklendikten sonra başlat
window.addEventListener('DOMContentLoaded', () => {
  new CeloEngageHub();
});
