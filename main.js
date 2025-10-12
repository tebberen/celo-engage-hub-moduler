import { connectWalletMetaMask, disconnectWallet } from "./src/services/walletService.js";
import { loadProposals, createProposal } from "./src/services/contractService.js";

// 🔹 Sayfa yüklendiğinde linkleri göster
function displaySupportLinks() {
  const links = [
    { link: "https://farcaster.xyz/teberen", label: "🔮 Farcaster" },
    { link: "https://farcaster.xyz/ertu", label: "🔮 Farcaster (Ertu)" },
    { link: "https://x.com/luckyfromnecef", label: "🐦 X (Twitter)" },
    { link: "https://x.com/egldmvx", label: "🐦 X (EGLDMVX)" },
    { link: "https://github.com/tebberen", label: "💻 GitHub" },
    { link: "https://tebberen.github.io/celo-engage-hub/", label: "🌐 Celo Engage Hub" },
    { link: "https://x.com/meelioodas", label: "🐦 X (Meelio)" },
    { link: "https://x.com/erturulsezar13", label: "🐦 X (Sezar)" },
  ];

  const container = document.getElementById("linksContainer");
  container.innerHTML = "";

  links.forEach((item) => {
    const div = document.createElement("div");
    div.className = "link-card";
    div.innerHTML = `
      <div class="link-platform">${item.label}</div>
      <a href="${item.link}" target="_blank" class="support-link">${item.link}</a>
    `;
    container.appendChild(div);
  });
  console.log("✅ Support links loaded successfully!");
}

// 🔗 Wallet bağlantısı
document.getElementById("connectWalletBtn").addEventListener("click", connectWalletMetaMask);
document.getElementById("disconnectWalletBtn").addEventListener("click", disconnectWallet);

// 🏛️ Governance açma butonu
const governanceButton = document.getElementById("governanceButton");
if (governanceButton) {
  governanceButton.addEventListener("click", async () => {
    document.getElementById("step1").classList.add("hidden");
    document.getElementById("step2").classList.add("hidden");
    document.getElementById("governanceSection").classList.remove("hidden");
    await loadProposals(); // aktif proposalları getir
  });
}

// 🏠 Governance'tan geri dönme butonu
const governanceSection = document.getElementById("governanceSection");
if (governanceSection) {
  const backButton = document.createElement("button");
  backButton.textContent = "🏠 Back to Home";
  backButton.className = "connect-btn";
  backButton.style.marginTop = "20px";

  backButton.addEventListener("click", () => {
    governanceSection.classList.add("hidden");
    document.getElementById("step1").classList.remove("hidden");
    displaySupportLinks();
  });

  governanceSection.appendChild(backButton);
}

// 🗳️ Proposal oluşturma
const createProposalBtn = document.getElementById("createProposalBtn");
if (createProposalBtn) {
  createProposalBtn.addEventListener("click", async () => {
    const title = document.getElementById("proposalTitle").value.trim();
    const description = document.getElementById("proposalDescription").value.trim();

    if (!title || !description) {
      alert("⚠️ Please fill in all fields!");
      return;
    }

    await createProposal(title, description);
    await loadProposals();
  });
}

// 🚀 Sayfa yüklendiğinde otomatik başlat
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Celo Engage Hub fully loaded!");
  displaySupportLinks(); // 🔹 linkleri göster
});
