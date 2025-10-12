import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../utils/constants.js';

export class ContractService {
  constructor(walletService) {
    this.walletService = walletService;
  }

  // ✅ Kontrata erişim (provider veya signer ile)
  getContract() {
    if (!this.walletService.provider) {
      throw new Error("❌ Wallet not connected");
    }
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.walletService.signer || this.walletService.provider
    );
  }

  // ✅ Proposal oluşturma
  async createProposal(title, description) {
    if (!this.walletService.getIsConnected()) {
      throw new Error("Wallet not connected");
    }

    try {
      const contract = this.getContract();
      const duration = 3 * 24 * 60 * 60; // 3 gün
      const tx = await contract.createProposal(title, description, duration, { gasLimit: 600000 });
      console.log("📤 TX sent:", tx.hash);
      await tx.wait();
      console.log("✅ TX confirmed!");
    } catch (error) {
      console.error("❌ Error creating proposal:", error);
      throw error;
    }
  }

  // ✅ Aktif proposal’ları getir
  async getActiveProposals() {
    try {
      const contract = this.getContract();
      const ids = await contract.getActiveProposals();
      const proposals = [];

      for (const id of ids) {
        const details = await contract.getProposalDetails(id);
        proposals.push({
          id: id.toString(),
          title: details.title,
          description: details.description,
          votesFor: details.votesFor.toString(),
          votesAgainst: details.votesAgainst.toString(),
        });
      }

      return proposals;
    } catch (error) {
      console.error("❌ Error loading proposals:", error);
      return [];
    }
  }

  // ✅ Proposal oylama
  async voteProposal(proposalId, support) {
    if (!this.walletService.getIsConnected()) {
      throw new Error("Wallet not connected");
    }

    try {
      const contract = this.getContract();
      const tx = await contract.voteProposal(proposalId, support, { gasLimit: 400000 });
      console.log("📤 Vote TX:", tx.hash);
      await tx.wait();
      alert("✅ Vote submitted successfully!");
    } catch (error) {
      console.error("❌ Error voting:", error);
      throw error;
    }
  }
}
