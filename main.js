import { CONTRACT_ADDRESS, CONTRACT_ABI, CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "./src/utils/constants.js";
import { connectWalletMetaMask, disconnectWallet, checkCurrentNetwork } from "./src/services/walletService.js";
import { loadUserProfile } from "./src/services/contractService.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// 🟢 Yeni eklendi: Governance servisleri
import { fetchActiveProposals, createProposal, voteProposal } from "./src/services/governanceService.js";

let provider = null;
let signer = null;
let userAddress = "";
let allCommunityLinks = [];
let governanceInitialized = false; // 🟢 Yeni eklendi

// ✅ Başlangıç linkleri
const initialSupportLinks = [
  "https://farcaster.xyz/teberen/0x391c5713",
  "https://farcaster.xyz/ertu",
  "https://farcaster.xyz/ratmubaba",
  "https://x.com/erturulsezar13",
  "https://x.com/egldmvx",
  "https://tebberen.github.io/celo-engage-hub/",
  "https://x.com/meelioodas",
  "https://x.com/luckyfromnecef/status/1972371920290259437",
  "https://github.com/tebberen"
];

// ✅ Local storage
function loadLinksFromStorage() {
  const stored = localStorage.getItem("celoEngageHubLinks");
  if (stored) return JSON.parse(stored);
  return initialSupportLinks.map(link => ({
    link,
    clickCount: 0,
    timestamp: Date.now(),
    submitter: "community"
  }));
}

function saveLinksToStorage(links) {
  localStorage.setItem("celoEngageHubLinks", JSON.stringify(links));
}

// ✅ Platform ismi
function getPlatformName(url) {
  if (url.includes("x.com") || url.includes("twitter.com")) return "🐦 X";
  if (url.includes("farcaster.xyz") || url.includes("warpcast.com")) return "🔮 Farcaster";
  if (url.includes("github.com")) return "💻 GitHub";
  if (url.includes("youtube.com")) return "📺 YouTube";
  if (url.includes("discord.com")) return "💬 Discord";
  return "🌐 Website";
}

// ✅ Linkleri listele
function displaySupportLinks() {
  const container = document.getElementById("linksContainer");
  if (!container) return;

  container.innerHTML = "";
  const activeLinks = allCommunityLinks.filter(l => l.clickCount < 5);

  if (activeLinks.length === 0) {
    container.innerHTML = `
      <div class="link-card">
        <p>🌟 All links have reached maximum support! Submit new links to continue.</p>
      </div>`;
    return;
  }

  activeLinks.forEach(linkData => {
    const platform = getPlatformName(linkData.link);
    const linkCard = document.createElement("div");
    linkCard.classList.add("link-card");

    linkCard.innerHTML = `
      <div>
        <div class="link-platform">${platform}</div>
        <a href="${linkData.link}" target="_blank" class="support-link" onclick="handleCommunityLink('${linkData.link}', event)">
          ${linkData.link}
        </a>
      </div>
      <div class="link-stats">
        <div class="stat-item">
          <div>Supports</div>
          <div class="stat-value">${linkData.clickCount}/5</div>
        </div>
      </div>`;
    container.appendChild(linkCard);
  });
}

// ✅ Tıklama işlemi
window.handleCommunityLink = function (url, event) {
  if (event) event.stopPropagation();

  const formSection = document.getElementById("newLinkFormSection");
  if (formSection) {
    formSection.classList.remove("hidden");
    formSection.style.display = "block";
    formSection.scrollIntoView({ behavior: "smooth" });
  }

  try {
    let links = JSON.parse(localStorage.getItem("celoEngageHubLinks")) || [];
    const index = links.findIndex(l => l.link === url);
    if (index !== -1) {
      links[index].clickCount++;
      saveLinksToStorage(links);
      displaySupportLinks();
    }
  } catch (error) {
    console.error("Error updating link:", error);
  }
};

// ✅ Uygulama başlat
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Celo Engage Hub initializing...");

  allCommunityLinks = loadLinksFromStorage();
  displaySupportLinks();

  // 🟡 Wallet bağlantısı
  const connectBtn = document.getElementById("connectWalletBtn");
  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      const result = await connectWalletMetaMask();
      if (result.connected) {
        provider = result._provider;
        signer = result._signer;
        userAddress = result._address;
      }
    });
  }

  // 🟡 Governance butonu
  const governanceBtn = document.getElementById("governanceButton");
  if (governanceBtn) {
    governanceBtn.addEventListener("click", async () => {
      const section = document.getElementById("governanceSection");
      if (section) section.classList.remove("hidden");

      if (!provider && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      }

      if (!governanceInitialized) {
        console.log("🗳️ Loading proposals...");
        try {
          const list = await fetchActiveProposals(provider);
          console.log("Active Proposals:", list);
        } catch (err) {
          console.error("Error fetching proposals:", err);
        }
        governanceInitialized = true;
      }
    });
  }

  console.log("✅ Celo Engage Hub loaded successfully!");
});
