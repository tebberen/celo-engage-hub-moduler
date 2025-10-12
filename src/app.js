import { WalletService } from './services/walletService.js';
import { ContractService } from './services/contractService.js';
import { 
  loadLinksFromStorage, saveLinksToStorage,
  displaySupportLinks, handleCommunityLink
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

    // global for onclick
    window.handleCommunityLink = handleCommunityLink;
    window.voteProposal = (proposalId, support) => this.voteProposal(proposalId, support);
  }

  bindEvents() {
    const byId = (id) => document.getElementById(id);

    byId('connectWalletBtn')?.addEventListener('click', () => this.connectWallet());
    byId('modalMetaMaskBtn')?.addEventListener('click', () => this.connectMetaMask());
    byId('closeWalletModalBtn')?.addEventListener('click', () => this.closeWalletModal());
    byId('disconnectWalletBtn')?.addEventListener('click', () => this.disconnectWallet());

    byId('submitLinkBtn')?.addEventListener('click', () => this.submitLink());
    byId('setupProfileBtn')?.addEventListener('click', () => this.setupUserProfile());
    byId('createProposalBtn')?.addEventListener('click', () => this.createProposal());

    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        this.walletService.currentChainId = parseInt(chainId, 16).toString();
        this.checkCurrentNetwork();
        if (this.walletService.getIsConnected()) {
          this.loadPlatformStats();
          this.loadUserProfile();
        }
      });
      window.ethereum.on('accountsChanged', (accounts) => {
        if (!accounts?.length) this.disconnectWallet();
        else if (this.walletService.getIsConnected()) location.reload();
      });
    }
  }

  async connectWallet() { this.openWalletModal(); }
  openWalletModal() { document.getElementById('walletModal')?.classList.remove('hidden'); }
  closeWalletModal() { document.getElementById('walletModal')?.classList.add('hidden'); }

  async connectMetaMask() {
    const ok = await this.walletService.connectMetaMask();
    if (ok) this.onWalletConnected(); else alert('MetaMask bağlantısı başarısız. Tekrar deneyin.');
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
    document.getElementById('step2')?.classList.add('hidden');
    document.getElementById('step1')?.classList.remove('hidden');
  }

  updateUI() {
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    const networkInfo = document.getElementById('networkInfo');
    const connectBtn = document.getElementById('connectWalletBtn');

    if (this.walletService.getIsConnected()) {
      if (walletAddress) walletAddress.textContent = this.walletService.getShortAddress();
      const net = this.walletService.getNetworkInfo();
      if (networkInfo) { networkInfo.textContent = `🌐 ${net.name}`; networkInfo.style.color = net.color; }
      walletInfo?.classList.remove('hidden');
      if (connectBtn) connectBtn.style.display = 'none';
    } else {
      walletInfo?.classList.add('hidden');
      if (connectBtn) connectBtn.style.display = 'inline-block';
    }
  }

  async checkWalletConnection() { this.updateUI(); }

  async checkCurrentNetwork() {
    const ok = await this.walletService.checkCurrentNetwork();
    const warn = document.getElementById('networkWarning');
    const netInfo = document.getElementById('networkInfo');
    if (ok) {
      warn?.classList.add('hidden');
      if (netInfo) {
        const net = this.walletService.getNetworkInfo();
        netInfo.textContent = `🌐 ${net.name}`; netInfo.style.color = net.color;
      }
    } else {
      warn?.classList.remove('hidden');
      if (netInfo) { netInfo.textContent = '⚠️ Wrong Network'; netInfo.style.color = '#EF4444'; }
    }
    return ok;
  }

  async loadPlatformStats() {
    try {
      const s = await this.contractService.getPlatformStats();
      document.getElementById('totalUsers').textContent = s.totalUsers;
      document.getElementById('totalProposals').textContent = s.totalProposals;
      document.getElementById('totalBadges').textContent = "0";
      document.getElementById('totalSupports').textContent = "0";
      document.getElementById('platformStats').classList.remove('hidden');
    } catch (e) { console.error("loadPlatformStats:", e); }
  }

  async loadUserProfile() {
    try {
      this.userProfile = await this.contractService.getUserProfile();
      const profile = document.getElementById('userProfileSection');
      const gov = document.getElementById('governanceSection');
      const badges = document.getElementById('badgesSection');

      if (this.userProfile?.isActive) {
        profile?.classList.add('hidden'); gov?.classList.remove('hidden'); badges?.classList.remove('hidden');
        this.loadUserBadges(); this.loadProposals();
      } else {
        profile?.classList.remove('hidden'); gov?.classList.add('hidden'); badges?.classList.add('hidden');
      }
    } catch (e) {
      console.error("loadUserProfile:", e);
      document.getElementById('userProfileSection')?.classList.remove('hidden');
    }
  }

  async setupUserProfile() {
    if (!this.walletService.getIsConnected()) { const ok = await this.connectMetaMask(); if (!ok) return; }
    const username = document.getElementById("userUsername").value.trim();
    if (!username) return alert("Lütfen kullanıcı adınızı girin");

    try {
      const btn = document.getElementById("setupProfileBtn");
      btn.disabled = true; btn.textContent = "⏳ Ayarlanıyor...";
      const p = await this.contractService.getUserProfile();
      let r; if (p?.isActive) r = await this.contractService.updateProfile(username);
      else r = await this.contractService.registerUser(username);
      console.log("Profile setup:", r); this.loadUserProfile();
    } catch (e) {
      console.error("setupUserProfile:", e); alert("Profil ayarlanırken hata: " + e.message);
    } finally {
      const btn = document.getElementById("setupProfileBtn");
      btn.disabled = false; btn.textContent = "🚀 Profili Ayarla";
    }
  }

  async submitLink() {
    if (!this.walletService.getIsConnected()) { const ok = await this.connectMetaMask(); if (!ok) return; }
    if (!this.hasSupported) return alert("Lütfen önce en az bir topluluk üyesini destekleyin!");
    const isOk = await this.checkCurrentNetwork(); if (!isOk) return alert("Lütfen Celo ağına geçin");

    const userLink = document.getElementById("userLinkInput").value.trim();
    if (!userLink) return alert("Önce link girin.");
    if (!(userLink.startsWith('http://') || userLink.startsWith('https://'))) return alert("Geçerli bir URL girin");

    try {
      const btn = document.getElementById("submitLinkBtn"); btn.disabled = true; btn.textContent = "⏳ Gönderiliyor...";
      const p = await this.contractService.getUserProfile(); if (!p?.isActive) await this.contractService.registerUser("User");

      const item = { link: userLink, clickCount: 0, timestamp: Date.now(), submitter: this.walletService.getUserAddress() };
      this.allCommunityLinks.unshift(item); saveLinksToStorage(this.allCommunityLinks); displaySupportLinks(this.allCommunityLinks, 'linksContainer');

      document.getElementById("userLinkInput").value = ""; this.hasSupported = false;
      document.getElementById('step2')?.classList.add('hidden'); document.getElementById('step1')?.classList.remove('hidden');
      alert("Link gönderildi!");
    } catch (e) {
      console.error("submitLink:", e); alert("Link gönderilirken hata: " + e.message);
    } finally {
      const btn = document.getElementById("submitLinkBtn"); btn.disabled = false; btn.textContent = "✍️ Link Gönder";
    }
  }

  async loadProposals() {
    try {
      const list = await this.contractService.getActiveProposals();
      const el = document.getElementById('proposalsContainer'); el.innerHTML = '';
      if (!list.length) { el.innerHTML = '<p>Henüz aktif öneri yok.</p>'; return; }
      for (const id of list) {
        const d = await this.contractService.getProposalDetails(id);
        const div = document.createElement('div');
        div.className = 'proposal-card';
        div.innerHTML = `
          <h4>${d.title}</h4>
          <p>${d.description}</p>
          <div class="link-stats">
            <div class="stat-item"><div>👍 For</div><div class="stat-value">${d.votesFor}</div></div>
            <div class="stat-item"><div>👎 Against</div><div class="stat-value">${d.votesAgainst}</div></div>
          </div>
          <button onclick="voteProposal(${d.id}, true)">👍 Destekle</button>
          <button onclick="voteProposal(${d.id}, false)">👎 Karşı Çık</button>
        `;
        el.appendChild(div);
      }
    } catch (e) { console.error("loadProposals:", e); }
  }

  async voteProposal(id, support) {
    try { await this.contractService.voteProposal(id, support); this.loadProposals(); alert("Oyunuz gönderildi!"); }
    catch (e) { console.error("voteProposal:", e); alert("Oy verilirken hata: " + e.message); }
  }

  async loadUserBadges() {
    try {
      const list = await this.contractService.getUserBadges();
      const el = document.getElementById('userBadgesContainer'); el.innerHTML = '';
      if (!list.length) { el.innerHTML = '<p>Henüz rozet yok. Toplulukta aktif olun!</p>'; return; }
      list.forEach(b => {
        const card = document.createElement('div'); card.className = 'badge-card';
        card.innerHTML = `<strong>${b}</strong><p>Topluluk katılımıyla kazanıldı</p>`; el.appendChild(card);
      });
    } catch (e) { console.error("loadUserBadges:", e); }
  }
}

// DOM yüklendikten sonra başlat
window.addEventListener('DOMContentLoaded', () => new CeloEngageHub());
