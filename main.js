import { connectWalletMetaMask, disconnectWallet } from "./src/services/walletService.js";
import { loadProposals, createProposal } from "./src/services/contractService.js";

// 🔗 Wallet bağlantısı
document.getElementById("connectWalletBtn").addEventListener("click", connectWalletMetaMask);
document.getElementById("disconnectWalletBtn").addEventListener("click", disconnectWallet);

// 🏛️ Governance açma
const governanceButton = document.getElementById("governanceButton");
if (governanceButton) {
  governanceButton.addEventListener("click", async () => {
    document.getElementById("homeSection").classList.add("hidden");
    document.getElementById("governanceSection").classList.remove("hidden");
    await loadProposals(); // mevcut proposalları yükle
  });
}

// 🏠 Governance içindeyken geri dönme butonu
const governanceSection = document.getElementById("governanceSection");
if (governanceSection) {
  const backButton = document.createElement("button");
  backButton.textContent = "🏠 Back to Home";
  backButton.className = "connect-btn";
  backButton.style.marginTop = "20px";

  backButton.addEventListener("click", () => {
    governanceSection.classList.add("hidden");
    document.getElementById("homeSection").classList.remove("hidden");
  });

  governanceSection.appendChild(backButton);
}

// 🗳️ Yeni proposal oluşturma
const createProposalBtn = document.getElementById("createProposalBtn");
if (createProposalBtn) {
  createProposalBtn.addEventListener("click", async () => {
    const title = document.getElementById("proposalTitle").value.trim();
    const description = document.getElementById("proposalDescription").value.trim();
    if (!title || !description) return alert("Please fill in all fields!");
    await createProposal(title, description);
    await loadProposals(); // yeni ekleneni hemen göster
  });
}

// 🚀 Sayfa yüklenince log
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Celo Engage Hub fully loaded!");
});
