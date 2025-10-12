const { ethers } = window;
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants.js';

export class ContractService {
  constructor(walletService) {
    this.walletService = walletService;
    this.contract = null;
  }

  initializeContract() {
    const provider = this.walletService.getProvider();
    if (!provider) return;
    try {
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      console.log("Contract initialized");
    } catch (e) {
      console.error("initializeContract error:", e);
    }
  }

  async getUserProfile(userAddress = null) {
    if (!this.contract) this.initializeContract();
    try {
      const addr = userAddress || this.walletService.getUserAddress();
      const p = await this.contract.getUserProfile(addr);
      return {
        username: p[0],
        supportCount: p[1].toString(),
        reputation: p[2].toString(),
        badgeCount: p[3].toString(),
        isActive: p[4],
        timestamp: p[5].toString(),
      };
    } catch (e) {
      console.error("getUserProfile error:", e);
      return null;
    }
  }

  async registerUser(username) {
    if (!this.contract) this.initializeContract();
    try {
      const c = this.contract.connect(this.walletService.getSigner());
      const tx = await c.registerUser(username, { gasLimit: 500000 });
      return await tx.wait();
    } catch (e) { console.error("registerUser error:", e); throw e; }
  }

  async updateProfile(username) {
    if (!this.contract) this.initializeContract();
    try {
      const c = this.contract.connect(this.walletService.getSigner());
      const tx = await c.updateProfile(username, { gasLimit: 300000 });
      return await tx.wait();
    } catch (e) { console.error("updateProfile error:", e); throw e; }
  }

  async createProposal(title, description, duration = 3*24*60*60) {
    if (!this.contract) this.initializeContract();
    try {
      const c = this.contract.connect(this.walletService.getSigner());
      const tx = await c.createProposal(title, description, duration, { gasLimit: 600000 });
      return await tx.wait();
    } catch (e) { console.error("createProposal error:", e); throw e; }
  }

  async voteProposal(id, support) {
    if (!this.contract) this.initializeContract();
    try {
      const c = this.contract.connect(this.walletService.getSigner());
      const tx = await c.voteProposal(id, support, { gasLimit: 400000 });
      return await tx.wait();
    } catch (e) { console.error("voteProposal error:", e); throw e; }
  }

  async getActiveProposals() {
    if (!this.contract) this.initializeContract();
    try {
      const list = await this.contract.getActiveProposals();
      return list.map(x => x.toString());
    } catch (e) { console.error("getActiveProposals error:", e); return []; }
  }

  async getProposalDetails(id) {
    if (!this.contract) this.initializeContract();
    try {
      const d = await this.contract.getProposalDetails(id);
      return {
        id: d[0].toString(), title: d[1], description: d[2], creator: d[3],
        votesFor: d[4].toString(), votesAgainst: d[5].toString(),
        deadline: d[6].toString(), executed: d[7]
      };
    } catch (e) { console.error("getProposalDetails error:", e); return null; }
  }

  async getUserBadges(addr = null) {
    if (!this.contract) this.initializeContract();
    try {
      const a = addr || this.walletService.getUserAddress();
      return await this.contract.getUserBadges(a);
    } catch (e) { console.error("getUserBadges error:", e); return []; }
  }

  async getPlatformStats() {
    if (!this.contract) this.initializeContract();
    try {
      const totalUsers = await this.contract.totalUsers();
      const proposalCount = await this.contract.proposalCount();
      return { totalUsers: totalUsers.toString(), totalProposals: proposalCount.toString() };
    } catch (e) { console.error("getPlatformStats error:", e); return { totalUsers:"0", totalProposals:"0" }; }
  }
}
