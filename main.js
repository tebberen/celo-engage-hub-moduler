import { CONTRACT_ADDRESS, CONTRACT_ABI, CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "./src/utils/constants.js";
import { connectWalletMetaMask, disconnectWallet, switchToCeloNetwork, checkCurrentNetwork } from "./src/services/walletService.js";
import { loadUserProfile, setupUserProfile, createProposal, voteProposal, loadProposals, loadUserBadges } from "./src/services/contractService.js";

let provider = null;
let signer = null;
let isConnected = false;
let userAddress = '';
let hasSupported = false;
let currentChainId = null;
let userProfile = null;

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

// 🔹 Link depolama
function loadLinksFromStorage() {
  const storedLinks = localStorage.getItem('celoEngageHubLinks');
  if (storedLinks) {
    return JSON.parse(storedLinks);
  } else {
    return initialSupportLinks.map(link => ({ link: link, clickCount: 0, timestamp: Date.now(), submitter: "community" }));
  }
}

function saveLinksToStorage(links) {
  localStorage.setItem('celoEngageHubLinks', JSON.stringify(links));
}

let allCommunityLinks = loadLinksFromStorage();

function getPlatformName(url) {
  if (url.includes('x.com') || url.includes('twitter.com')) return '🐦 X';
  if (url.includes('farcaster.xyz') || url.includes('warpcast.com')) return '🔮 Farcaster';
  if (url.includes('github.com')) return '💻 GitHub';
  if (url.includes('youtube.com')) return '📺 YouTube';
  if (url.includes('discord.com')) return '💬 Discord';
  return '🌐 Website';
}

export function displaySupportLinks() {
  const container = document.getElementById('linksContainer');
  container.innerHTML = '';
  const activeLinks = allCommunityLinks.filter(linkData => linkData.clickCount < 5);
  if (activeLinks.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div class="link-card">
          <p>🌟 All links have reached maximum support! Submit new links to continue.</p>
        </div>
      </div>`;
    return;
  }
  activeLinks.sort((a, b) => a.clickCount - b.clickCount);
  activeLinks.forEach((linkData, index) => {
    const platform = getPlatformName(linkData.link);
    const linkCard = document.createElement('div');
    let openStep2 = 'true';
    if (linkData.link === "https://tebberen.github.io/celo-engage-hub/") openStep2 = 'false';
    linkCard.innerHTML = `
      <div class="link-card">
        <div>
          <div class="link-platform">${platform}</div>
          <a href="${linkData.link}" target="_blank" class="support-link" onclick="handleCommunityLink('${linkData.link}', ${openStep2})">
            ${linkData.link}
          </a>
        </div>
        <div class="link-stats">
          <div class="stat-item">
            <div>Supports</div>
            <div class="stat-value">${linkData.clickCount}/5</div>
          </div>
        </div>
      </div>`;
    container.appendChild(linkCard);
  });
}

// 🔹 Link tıklama işlemi
window.handleCommunityLink = function (linkUrl, openStep2) {
  window.open(linkUrl, '_blank');
  if (openStep2) {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
  }
};

// 🔹 GM, Deploy, Governance butonları
document.getElementById("gmButton").addEventListener("click", () => alert("🌞 GM, Celo Builder! Keep shining."));
document.getElementById("deployButton").addEventListener("click", () => alert("🚀 Deployment feature coming soon!"));
document.getElementById("governanceButton").addEventListener("click", () => alert("🏛️ Governance dashboard under development."));

// 🔹 Sayfa yüklenince linkleri göster
window.addEventListener('load', () => {
  displaySupportLinks();
});

// 🔹 Wallet eventleri
document.getElementById("connectWalletBtn").addEventListener("click", async () => {
  const { connected, _provider, _signer, _address } = await connectWalletMetaMask();
  if (connected) {
    provider = _provider;
    signer = _signer;
    userAddress = _address;
    isConnected = true;
    displaySupportLinks();
    loadUserProfile(provider, signer, userAddress);
  }
});

document.getElementById("disconnectWalletBtn").addEventListener("click", disconnectWallet);
document.getElementById("setupProfileBtn").addEventListener("click", () => setupUserProfile(provider, signer, userAddress));
document.getElementById("createProposalBtn").addEventListener("click", () => createProposal(provider, signer));
import { submitSupportLink } from "./src/services/contractService.js";

// 🔹 Submit Link tıklanınca
window.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitLinkBtn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", async () => {
    const linkInput = document.getElementById("userLink");
    if (!linkInput || !linkInput.value.trim()) {
      alert("Please enter a valid link first!");
      return;
    }

    const linkUrl = linkInput.value.trim();

    if (!window.ethereum) {
      alert("⚠️ Please connect MetaMask first!");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const success = await submitSupportLink(provider, signer, linkUrl);

    if (success) {
      // Yeni linki en üste ekle
      const storedLinks = JSON.parse(localStorage.getItem('celoEngageHubLinks')) || [];
      storedLinks.unshift({
        link: linkUrl,
        clickCount: 0,
        timestamp: Date.now(),
        submitter: "user"
      });
      localStorage.setItem('celoEngageHubLinks', JSON.stringify(storedLinks));

      // Ana sayfayı güncelle
      displaySupportLinks();
      linkInput.value = "";
    }
  });
});
