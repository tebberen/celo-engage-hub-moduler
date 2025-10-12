import { connectWalletMetaMask, disconnectWallet, checkCurrentNetwork } from "./src/services/walletService.js";
import { loadUserProfile, createProposal, voteProposal, loadProposals } from "./src/services/contractService.js";

// Sayfa yüklendiğinde destek linklerini göster
export function displaySupportLinks() {
  const links = [
    { link: "https://farcaster.xyz/teberen", label: "🔮 Farcaster" },
    { link: "https://x.com/luckyfromnecef", label: "🐦 X" },
    { link: "https://github.com/tebberen", label: "💻 GitHub" }
  ];

  const container = document.getElementById("linksContainer");
  container.innerHTML = "";

  links.forEach(item => {
    const div = document.createElement("div");
    div.className = "link-card";
    div.innerHTML = `
      <div class="link-platform">${item.label}</div>
      <a href="${item.link}" target="_blank" class="support-link">${item.link}</a>
    `;
    container.appendChild(div);
  });
}

// 🔹 Bağlantı butonları
const connectBtn = document.getElementById("connectWalletBtn");
const disconnectBtn = document.getElementById("disconnectWalletBtn");

if (connectBtn) connectBtn.addEventListener("click", connectWalletMetaMask);
if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectWallet);

// 🏛️ Governance butonuna tıklanınca Governance bölümü açılır
const governanceButton = document.getElementById("governanceButton");
if (governanceButton) {
  governanceButton.addEventListener("click", () => {
    const homeSection = document.getElementById("homeSection");
    const governanceSection = document.getElementById("governanceSection");

    // Ana sayfayı gizle, governance bölümünü göster
    if (homeSection && governanceSection) {
      homeSection.classList.add("hidden");
      governanceSection.classList.remove("hidden");
    }
  });
}

// 🏠 Geri dön butonunu da ekleyelim (governance içindeyken)
const governanceSection = document.getElementById("governanceSection");
if (governanceSection) {
  const backButton = document.createElement("button");
  backButton.textContent = "🏠 Back to Home";
  backButton.style.marginTop = "20px";
  backButton.style.padding = "10px 20px";
  backButton.style.borderRadius = "8px";
  backButton.style.border = "none";
  backButton.style.background = "#FBCC5C";
  backButton.style.color = "#000";
  backButton.style.fontWeight = "bold";
  backButton.style.cursor = "pointer";

  backButton.addEventListener("click", () => {
    governanceSection.classList.add("hidden");
    document.getElementById("homeSection").classList.remove("hidden");
  });

  governanceSection.appendChild(backButton);
}

// 🧩 Sayfa yüklendiğinde otomatik başlat
window.addEventListener("DOMContentLoaded", () => {
  displaySupportLinks();
  console.log("🚀 Celo Engage Hub frontend loaded!");
});
