import { CONTRACT_ADDRESS, CONTRACT_ABI, CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "./src/utils/constants.js";
import { connectWalletMetaMask, disconnectWallet, checkCurrentNetwork } from "./src/services/walletService.js";
import { loadUserProfile } from "./src/services/contractService.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// 🟢 Governance servisleri
import { fetchActiveProposals, createProposal, voteProposal } from "./src/services/governanceService.js";

let provider = null;
let signer = null;
let userAddress = "";
let allCommunityLinks = [];
let governanceInitialized = false; // 🟢 Governance flag

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

  // 🔗 Wallet bağlantısı
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

  // 🏛️ Governance butonu
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
        await renderProposals();
        governanceInitialized = true;
      } else {
        await renderProposals();
      }
    });
  }

  console.log("✅ Celo Engage Hub loaded successfully!");
});

// =======================================
// 🗳️ Governance render & voting functions
// =======================================
async function renderProposals() {
  const proposalsContainer = document.getElementById("proposalsContainer");
  if (!proposalsContainer) return;

  proposalsContainer.innerHTML = "Loading proposals...";
  try {
    const list = await fetchActiveProposals(provider);
    if (!list.length) {
      proposalsContainer.innerHTML = `<p>No active proposals yet.</p>`;
      return;
    }

    proposalsContainer.innerHTML = list.map(p => `
      <div class="proposal-card">
        <div class="proposal-header">
          <div class="proposal-title">${p.title}</div>
          <div class="proposal-sub">${p.description}</div>
        </div>
        <div class="proposal-stats">
          <div class="vote-pill">🟩 For <strong>${p.forVotes}</strong></div>
          <div class="vote-pill">🟥 Against <strong>${p.againstVotes}</strong></div>
        </div>
        <div class="proposal-actions">
          <button class="support-btn" data-id="${p.id}" data-act="for">Support</button>
          <button class="oppose-btn" data-id="${p.id}" data-act="against">Oppose</button>
        </div>
      </div>
    `).join("");
  } catch (e) {
    console.error(e);
    proposalsContainer.innerHTML = `<p style="color:red;">Failed to load proposals.</p>`;
  }
}

// ✅ Proposal oluşturma
document.getElementById("createProposalBtn")?.addEventListener("click", async () => {
  const title = document.getElementById("proposalTitle").value.trim();
  const desc = document.getElementById("proposalDescription").value.trim();
  if (!title) return alert("Please enter a proposal title.");
  try {
    if (!signer && window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
    }
    await createProposal(signer, title, desc, 3);
    document.getElementById("proposalTitle").value = "";
    document.getElementById("proposalDescription").value = "";
    await renderProposals();
    alert("Proposal created successfully ✅");
  } catch (e) {
    console.error(e);
    alert("❌ Failed to create proposal: " + e.message);
  }
});

// ✅ Oy kullanma (support/oppose)
document.getElementById("proposalsContainer")?.addEventListener("click", async (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  const act = t.getAttribute("data-act");
  if (!act) return;
  const id = Number(t.getAttribute("data-id"));
  try {
    if (!signer && window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
    }
    const support = act === "for";
    await voteProposal(signer, id, support);
    await renderProposals();
    alert(support ? "🟩 Supported!" : "🟥 Opposed!");
  } catch (e2) {
    console.error(e2);
    alert("Vote failed: " + e2.message);
  }
});
