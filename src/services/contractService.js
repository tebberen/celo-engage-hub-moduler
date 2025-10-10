// ✅ TARAYICI (CDN) UYUMLU SÜRÜM
// Artık import kullanmıyoruz çünkü ethers.js <head> kısmında CDN ile yüklendi.
const { ethers } = window;

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants.js';

export class ContractService {
  constructor(walletService) {
    this.walletService = walletService;
    this.contract = null;
  }

  // ✅ Contract instance oluştur
  initializeContract() {
    if (!this.walletService.getProvider()) {
      console.error("Provider not available");
      return;
    }

    try {
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.walletService.getProvider()
      );
      console.log("✅ Contract initialized");
    } catch (error) {
      console.error("❌ Error initializing contract:", error);
    }
  }

  // ✅ Kullanıcı profilini getir
  async getUserProfile(userAddress = null) {
    if (!this.contract) this.initializeContract();

    try {
      const address = userAddress || this.walletService.getUserAddress();
      const profile = await this.contract.getUserProfile(address);
      return {
        username: profile[0],
        supportCount: profile[1].toString(),
        reputation: profile[2].toString(),
        badgeCount: profile[3].toString(),
        isActive: profile[4],
        timestamp: profile[5].toString(),
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  // ✅ Kullanıcıyı kaydet
  async registerUser(username) {
    if (!this.contract) this.initializeContract();

    try {
      const contractWithSigner = this.contract.connect(this.walletService.getSigner());
      const tx = await contractWithSigner.registerUser(username, { gasLimit: 500000 });
      console.log("Register TX sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Register TX confirmed:", receipt);
      return receipt;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  // ✅ Profili güncelle
  async updateProfile(username) {
    if (!this.contract) this.initializeContract();

    try {
      const contractWithSigner = this.contract.connect(this.walletService.getSigner());
      const tx = await contractWithSigner.updateProfile(username, { gasLimit: 300000 });
      console.log("Update TX sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Update TX confirmed:", receipt);
      return receipt;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // ✅ Proposal oluştur
  async createProposal(title, description, duration = 3 * 24 * 60 * 60) {
    if (!this.contract) this.initializeContract();

    try {
      const contractWithSigner = this.contract.connect(this.walletService.getSigner());
      const tx = await contractWithSigner.createProposal(title, description, duration, { gasLimit: 600000 });
      console.log("Create proposal TX sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Create proposal TX confirmed:", receipt);
      return receipt;
    } catch (error) {
      console.error("Error creating proposal:", error);
      throw error;
    }
  }

  // ✅ Proposal'a oy ver
  async voteProposal(proposalId, support) {
    if (!this.contract) this.initializeContract();

    try {
      const contractWithSigner = this.contract.connect(this.walletService.getSigner());
      const tx = await contractWithSigner.voteProposal(proposalId, support, { gasLimit: 400000 });
      console.log("Vote TX sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Vote TX confirmed:", receipt);
      return receipt;
    } catch (error) {
      console.error("Error voting:", error);
      throw error;
    }
  }

  // ✅ Aktif proposal'ları getir
  async getActiveProposals() {
    if (!this.contract) this.initializeContract();

    try {
      const activeProposals = await this.contract.getActiveProposals();
      return activeProposals.map((id) => id.toString());
    } catch (error) {
      console.error("Error getting active proposals:", error);
      return [];
    }
  }

  // ✅ Proposal detaylarını getir
  async getProposalDetails(proposalId) {
    if (!this.contract) this.initializeContract();

    try {
      const details = await this.contract.getProposalDetails(proposalId);
      return {
        id: details[0].toString(),
        title: details[1],
        description: details[2],
        creator: details[3],
        votesFor: details[4].toString(),
        votesAgainst: details[5].toString(),
        deadline: details[6].toString(),
        executed: details[7],
      };
    } catch (error) {
      console.error("Error getting proposal details:", error);
      return null;
    }
  }

  // ✅ Kullanıcı badge'lerini getir
  async getUserBadges(userAddress = null) {
    if (!this.contract) this.initializeContract();

    try {
      const address = userAddress || this.walletService.getUserAddress();
      const badges = await this.contract.getUserBadges(address);
      return badges;
    } catch (error) {
      console.error("Error getting user badges:", error);
      return [];
    }
  }

  // ✅ Platform istatistiklerini getir
  async getPlatformStats() {
    if (!this.contract) this.initializeContract();

    try {
      const totalUsers = await this.contract.totalUsers();
      const proposalCount = await this.contract.proposalCount();
      return {
        totalUsers: totalUsers.toString(),
        totalProposals: proposalCount.toString(),
      };
    } catch (error) {
      console.error("Error getting platform stats:", error);
      return { totalUsers: "0", totalProposals: "0" };
    }
  }
}
