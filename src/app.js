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
        document.getElementById('connectWalletBtn').addEventListener('click', () => this.connectWallet());
        document.getElementById('modalMetaMaskBtn').addEventListener('click', () => this.connectMetaMask());
        document.getElementById('modalWalletConnectBtn').addEventListener('click', () => this.connectWalletConnect());
        document.getElementById('closeWalletModalBtn').addEventListener('click', () => this.closeWalletModal());
        document.getElementById('disconnectWalletBtn').addEventListener('click', () => this.disconnectWallet());

        // Application events
        document.getElementById('submitLinkBtn').addEventListener('click', () => this.submitLink());
        document.getElementById('setupProfileBtn').addEventListener('click', () => this.setupUserProfile());
        document.getElementById('createProposalBtn').addEventListener('click', () => this.createProposal());

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
        const connected = await this.walletService.connectWalletConnect();
        if (connected) {
            this.onWalletConnected();
        } else {
            alert('WalletConnect bağlantısı başarısız. Lütfen tekrar deneyin.');
        }
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
        
        // Reset UI state
        document.getElementById('step2').classList.add('hidden');
        document.getElementById('step1').classList.remove('hidden');
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
        // Daha sonra persist wallet connection kontrolü eklenebilir
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
            
            if (this.userProfile && this.userProfile.isActive) {
                document.getElementById('userProfileSection').classList.add('hidden');
                document.getElementById('governanceSection').classList.remove('hidden');
                document.getElementById('badgesSection').classList.remove('hidden');
                this.loadUserBadges();
                this.loadProposals();
            } else {
                document.getElementById('userProfileSection').classList.remove('hidden');
                document.getElementById('governanceSection').classList.add('hidden');
                document.getElementById('badgesSection').classList.add('hidden');
            }
        } catch (error) {
            console.error("Error loading user profile:", error);
            document.getElementById('userProfileSection').classList.remove('hidden');
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

            // Check if user exists and update accordingly
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

            // Ensure user profile is active
            const profile = await this.contractService.getUserProfile();
            if (!profile.isActive) {
                await this.contractService.registerUser("User");
            }

            // Add link to local storage
            const newLinkData = {
                link: userLink,
                clickCount: 0,
                timestamp: Date.now(),
                submitter: this.walletService.getUserAddress()
            };
            
            this.allCommunityLinks.unshift(newLinkData);
            saveLinksToStorage(this.allCommunityLinks);
            displaySupportLinks(this.allCommunityLinks, 'linksContainer');

            // Reset form
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

    async loadProposals() {
        try {
            const activeProposals = await this.contractService.getActiveProposals();
            const container = document.getElementById('proposalsContainer');
            container.innerHTML = '';

            if (activeProposals.length === 0) {
                container.innerHTML = '<p>Henüz aktif öneri yok.</p>';
                return;
            }

            for (let i = 0; i < activeProposals.length; i++) {
                const proposalId = activeProposals[i];
                const details = await this.contractService.getProposalDetails(proposalId);
                
                const proposalCard = document.createElement('div');
                proposalCard.className = 'proposal-card';
                proposalCard.innerHTML = `
                    <h4>${details.title}</h4>
                    <p>${details.description}</p>
                    <div class="link-stats">
                        <div class="stat-item">
                            <div>👍 For</div>
                            <div class="stat-value">${details.votesFor}</div>
                        </div>
                        <div class="stat-item">
                            <div>👎 Against</div>
                            <div class="stat-value">${details.votesAgainst}</div>
                        </div>
                    </div>
                    <button onclick="voteProposal(${proposalId}, true)">👍 Destekle</button>
                    <button onclick="voteProposal(${proposalId}, false)">👎 Karşı Çık</button>
                `;
                container.appendChild(proposalCard);
            }
        } catch (error) {
            console.error("Error loading proposals:", error);
        }
    }

    async createProposal() {
        const title = document.getElementById("proposalTitle").value.trim();
        const description = document.getElementById("proposalDescription").value.trim();
        
        if (!title || !description) {
            alert("Lütfen hem başlık hem de açıklama girin");
            return;
        }

        try {
            const btn = document.getElementById("createProposalBtn");
            btn.disabled = true;
            btn.textContent = "⏳ Oluşturuluyor...";

            await this.contractService.createProposal(title, description);
            
            document.getElementById("proposalTitle").value = "";
            document.getElementById("proposalDescription").value = "";
            
            this.loadProposals();
            alert("Öneri başarıyla oluşturuldu!");
        } catch (error) {
            console.error("Proposal creation error:", error);
            alert("Öneri oluşturulurken hata: " + error.message);
        } finally {
            const btn = document.getElementById("createProposalBtn");
            btn.disabled = false;
            btn.textContent = "📝 Öneri Oluştur";
        }
    }

    async voteProposal(proposalId, support) {
        try {
            await this.contractService.voteProposal(proposalId, support);
            this.loadProposals();
            alert("Oyunuz başarıyla gönderildi!");
        } catch (error) {
            console.error("Voting error:", error);
            alert("Oy verilirken hata: " + error.message);
        }
    }

    async loadUserBadges() {
        try {
            const badges = await this.contractService.getUserBadges();
            const container = document.getElementById('userBadgesContainer');
            container.innerHTML = '';

            if (badges.length === 0) {
                container.innerHTML = '<p>Henüz rozet yok. Toplulukta aktif olarak rozet kazanın!</p>';
                return;
            }

            badges.forEach(badge => {
                const badgeCard = document.createElement('div');
                badgeCard.className = 'badge-card';
                badgeCard.innerHTML = `
                    <strong>${badge}</strong>
                    <p>Topluluk katılımıyla kazanıldı</p>
                `;
                container.appendChild(badgeCard);
            });
        } catch (error) {
            console.error("Error loading badges:", error);
        }
    }
}

// Uygulamayı başlat
new CeloEngageHub();
