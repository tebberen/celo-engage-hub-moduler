import { WalletService } from "./services/walletService.js";
import { ContractService } from "./services/contractService.js";
import { loadLinksFromStorage, displaySupportLinks } from "./utils/helpers.js";

// ✅ Başlatıcı sınıf
class CeloEngageHub {
  constructor() {
    this.walletService = new WalletService();
    this.contractService = new ContractService(this.walletService);
    this.allLinks = loadLinksFromStorage();
  }

  initializeApp() {
    this.bindEvents();
    this.showSupportSection();
  }

  bindEvents() {
    const connectBtn = document.getElementById("connectWalletBtn");
    const createProposalBtn = document.getElementById("createProposalBtn");
    const governanceBtn = document.getElementById("governanceBtn");
    const gmBtn = document.getElementById("gmBtn");
    const deployBtn = document.getElementById("deployBtn");

    if (connectBtn) {
      connectBtn.addEventListener("click", async () => {
        await this.walletService.connectWallet();
      });
    }

    if (createProposalBtn) {
      createProposalBtn.addEventListener("click", async () => {
        const title = document.getElementById("proposalTitle").value.trim();
        const description = document.getElementById("proposalDescription").value.trim();

        if (!title || !description) {
          alert("❌ Please enter both title and description");
          return;
        }

        await this.contractService.createProposal(title, description);
        await this.loadProposals();
      });
    }

    if (governanceBtn) {
      governanceBtn.addEventListener("click", () => this.showGovernanceSection());
    }

    if (gmBtn) {
      gmBtn.addEventListener("click", () => alert("☀️ GM fren! Celo vibes only 💛"));
    }

    if (deployBtn) {
      deployBtn.addEventListener("click", () => alert("🚀 Coming soon: Deploy mini dApp!"));
    }
  }

  showSupportSection() {
    document.getElementById("governanceSection").classList.add("hidden");
    document.getElementById("supportSection").classList.remove("hidden");
    displaySupportLinks(this.allLinks, "linksContainer");
  }

  async showGovernanceSection() {
    document.getElementById("supportSection").classList.add("hidden");
    document.getElementById("governanceSection").classList.remove("hidden");
    await this.loadProposals();
  }

  async loadProposals() {
    const proposals = await this.contractService.getActiveProposals();
    const container = document.getElementById("proposalsContainer");
    container.innerHTML = "";

    if (proposals.length === 0) {
      container.innerHTML = "<p>No active proposals yet.</p>";
      return;
    }

    proposals.forEach((p) => {
      const card = document.createElement("div");
      card.className = "proposal-card";
      card.innerHTML = `
        <h4>${p.title}</h4>
        <p>${p.description}</p>
        <div class="link-stats">
          <div class="stat-item">
            <div>👍 For</div><div class="stat-value">${p.votesFor}</div>
          </div>
          <div class="stat-item">
            <div>👎 Against</div><div class="stat-value">${p.votesAgainst}</div>
          </div>
        </div>
        <button class="voteFor">👍 Support</button>
        <button class="voteAgainst">👎 Oppose</button>
      `;
      card.querySelector(".voteFor").addEventListener("click", () => this.contractService.voteProposal(p.id, true));
      card.querySelector(".voteAgainst").addEventListener("click", () => this.contractService.voteProposal(p.id, false));
      container.appendChild(card);
    });
  }
}

// ✅ Sayfa yüklendiğinde başlat
window.addEventListener("DOMContentLoaded", () => {
  const app = new CeloEngageHub();
  app.initializeApp();
});
