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

// ✅ Artık çift sekme açılmaz: window.open kaldırıldı
window.handleCommunityLink = function (url, openStep2 = true) {
  if (!openStep2) return; // bazı linklerde form açılmasın istiyorsan
  const formSection = document.getElementById('newLinkFormSection');
  if (formSection) {
    formSection.classList.remove('hidden');
    try {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_) {}
  }
};

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
  activeLinks.forEach((linkData) => {
    const platform = getPlatformName(linkData.link);
    const linkCard = document.createElement('div');
    let openStep2 = true;
    if (linkData.link === "https://tebberen.github.io/celo-engage-hub/") openStep2 = false;
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
