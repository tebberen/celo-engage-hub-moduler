import { CONTRACT_ADDRESS, CONTRACT_ABI, CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "./src/utils/constants.js";
import { connectWalletMetaMask, disconnectWallet, switchToCeloNetwork, checkCurrentNetwork } from "./src/services/walletService.js";
import { loadUserProfile, setupUserProfile, createProposal, voteProposal, loadProposals, loadUserBadges } from "./src/services/contractService.js";

let provider = null;
let signer = null;
let userAddress = "";
let allCommunityLinks = [];

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

// ✅ Local Storage yönetimi
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

// ✅ Platform adı
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

    const openStep2 = linkData.link !== "https://tebberen.github.io/celo-engage-hub/";
    linkCard.innerHTML = `
      <div>
        <div class="link-platform">${platform}</div>
        <a href="${linkData.link}" target="_blank" class="support-link" onclick="handleCommunityLink('${linkData.link}', ${openStep2}, event)">
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

// ✅ Link tıklama
window.handleCommunityLink = function (url, openStep2 = true, event) {
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
      links[index].clickCount = (links[index].clickCount || 0) + 1;
      localStorage.setItem("celoEngageHubLinks", JSON.stringify(links));
    }
  } catch (_) {}

  console.log(`🟡 Link clicked: ${url}`);
};

// ✅ Uygulama başlatma
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Celo Engage Hub initializing...");
  allCommunityLinks = loadLinksFromStorage();
  displaySupportLinks();

  const connectBtn = document.getElementById("connectWalletBtn");
  const disconnectBtn = document.getElementById("disconnectWalletBtn");
  const submitBtn = document.getElementById("submitLinkBtn");
  const input = document.getElementById("userLinkInput");

  // 🔹 MetaMask bağlantısı
  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      try {
        console.log("⏳ Connecting to MetaMask...");
        const result = await connectWalletMetaMask();
        if (result.connected) {
          provider = result._provider;
          signer = result._signer;
          userAddress = result._address;

          await checkCurrentNetwork(provider);
          await loadUserProfile(provider, signer, userAddress);

          console.log("✅ Wallet connected:", userAddress);
        } else {
          alert("⚠️ Wallet connection failed.");
        }
      } catch (err) {
        console.error("❌ MetaMask connect error:", err);
        alert("MetaMask not responding. Please check your wallet and try again.");
      }
    });
  }

  // 🔹 Wallet bağlantısını kes
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", () => {
      disconnectWallet();
      provider = null;
      signer = null;
      userAddress = "";
    });
  }

  // 🔹 Yeni link ekleme
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const newLink = input.value.trim();
      if (!newLink) {
        alert("Please enter a valid link!");
        return;
      }

      allCommunityLinks.push({
        link: newLink,
        clickCount: 0,
        timestamp: Date.now(),
        submitter: "user"
      });

      saveLinksToStorage(allCommunityLinks);
      displaySupportLinks();
      input.value = "";
      document.getElementById("newLinkFormSection").classList.add("hidden");
      alert("✅ Your link has been added successfully!");
    });
  }

  console.log("✅ Celo Engage Hub ready!");
});
