import { connectWalletMetaMask, disconnectWallet } from "./src/services/walletService.js";
import { loadProposals } from "./src/services/contractService.js";

// 🟡 Governance görünürlüğü kontrolü
const governanceButton = document.getElementById("governanceButton");
if (governanceButton) {
  governanceButton.addEventListener("click", async () => {
    const homeSection = document.getElementById("homeSection");
    const governanceSection = document.getElementById("governanceSection");

    // Ana sayfayı gizle, governance bölümünü göster
    homeSection.classList.add("hidden");
    governanceSection.classList.remove("hidden");

    // Governance bölümüne girince önerileri yükle
    await loadProposals();
  });
}

// 🏠 Governance içindeyken geri dön butonu ekle
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

// 🔗 Cüzdan bağlantılarını bağla
document.getElementById("connectWalletBtn").addEventListener("click", connectWalletMetaMask);
document.getElementById("disconnectWalletBtn").addEventListener("click", disconnectWallet);

// Sayfa yüklendiğinde linkleri göster
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Celo Engage Hub frontend loaded successfully!");
});
