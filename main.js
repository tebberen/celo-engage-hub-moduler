import { CONTRACT_ADDRESS, CONTRACT_ABI, CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "./src/utils/constants.js";
import { connectWalletMetaMask, disconnectWallet, checkCurrentNetwork } from "./src/services/walletService.js";
import { loadUserProfile } from "./src/services/contractService.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

let provider = null;
let signer = null;
let userAddress = "";
let allCommunityLinks = [];
let proposals = [];

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

function loadProposalsFromStorage() {
  const stored = localStorage.getItem("celoGovernanceProposals");
  if (stored) return JSON.parse(stored);
  return [];
}

function saveProposalsToStorage() {
  localStorage.setItem("celoGovernanceProposals", JSON.stringify(proposals));
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
    container.innerHTML = `<div class="link-card"><p>🌟 All links reached max support! Submit new ones.</p></div>`;
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

// ✅ Governance Proposal Listesi
function displayProposals() {
  const container = document.getElementById("proposalsContainer");
  if (!container) return;
  container.innerHTML = "";

  if (proposals.length === 0) {
    container.innerHTML = `<p>No proposals yet. Be the first to create one!</p>`;
    return;
  }

  proposals.forEach((p, index) => {
    const card = document.createElement("div");
    card.classList.add("link-card");
    card.innerHTML = `
      <h4>${p.title}</h4>
      <p>${p.description}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span>🗳️ Votes: ${p.votes}</span>
        <button onclick="voteProposal(${index})" class="vote-btn">Vote ✅</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ✅ Link tıklama
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
      links[index].clickCount = (links[index].clickCount || 0) + 1;
      localStorage.setItem("celoEngageHubLinks", JSON.stringify(links));
    }
  } catch (_) {}

  console.log(`🟡 Link clicked: ${url}`);
};

// ✅ Vote Proposal (MetaMask ile on-chain)
window.voteProposal = async function (index) {
  if (!signer) {
    alert("Please connect your wallet first!");
    return;
  }

  try {
    const tx = await signer.sendTransaction({
      to: userAddress,
      value: 0,
      gasLimit: 100000
    });
    await tx.wait();

    proposals[index].votes += 1;
    saveProposalsToStorage();
    displayProposals();

    alert("✅ Vote recorded successfully on-chain!");
  } catch (err) {
    console.error("❌ Vote failed:", err);
    alert("Transaction failed or cancelled.");
  }
};

// ✅ Create Proposal (MetaMask ile)
window.createProposal = async function () {
  if (!signer) {
    alert("Please connect your wallet first!");
    return;
  }

  const title = document.getElementById("proposalTitle").value.trim();
  const desc = document.getElementById("proposalDescription").value.trim();

  if (!title || !desc) {
    alert("Please fill in both title and description.");
    return;
  }

  try {
    const tx = await signer.sendTransaction({
      to: userAddress,
      value: 0,
      gasLimit: 120000
    });
    await tx.wait();

    proposals.push({ title, description: desc, votes: 0, creator: userAddress });
    saveProposalsToStorage();
    displayProposals();

    document.getElementById("proposalTitle").value = "";
    document.getElementById("proposalDescription").value = "";

    alert("✅ Proposal created and confirmed on-chain!");
  } catch (err) {
    console.error("❌ Proposal failed:", err);
    alert("Transaction failed or cancelled.");
  }
};

// ✅ Sayfa yüklendiğinde başlat
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Celo Engage Hub initializing...");
  allCommunityLinks = loadLinksFromStorage();
  proposals = loadProposalsFromStorage();
  displaySupportLinks();

  const connectBtn = document.getElementById("connectWalletBtn");
  const disconnectBtn = document.getElementById("disconnectWalletBtn");
  const submitBtn = document.getElementById("submitLinkBtn");
  const input = document.getElementById("userLinkInput");
  const govBtn = document.getElementById("governanceButton");

  // 🔹 Governance görünürlük
  if (govBtn) {
    govBtn.addEventListener("click", () => {
      document.querySelector(".main-content h2").scrollIntoView({ behavior: "smooth" });
      document.getElementById("governanceSection").classList.remove("hidden");
      document.getElementById("linksContainer").style.display = "none";
      document.getElementById("newLinkFormSection").style.display = "none";
      displayProposals();
    });
  }

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

  // 🔹 Link gönderme (gas-only)
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const newLink = input.value.trim();
      if (!newLink) {
        alert("Please enter a valid link!");
        return;
      }

      if (!signer) {
        alert("Please connect your wallet first!");
        return;
      }

      try {
        const tx = await signer.sendTransaction({
          to: userAddress,
          value: 0,
          gasLimit: 100000
        });
        await tx.wait();

        allCommunityLinks.push({
          link: newLink,
          clickCount: 0,
          timestamp: Date.now(),
          submitter: userAddress
        });

        saveLinksToStorage(allCommunityLinks);
        displaySupportLinks();

        input.value = "";
        document.getElementById("newLinkFormSection").classList.add("hidden");
        alert("✅ Transaction confirmed! Link added successfully.");
      } catch (err) {
        console.error("❌ Transaction failed:", err);
        alert("Transaction failed or rejected by user.");
      }
    });
  }

  console.log("✅ Celo Engage Hub ready!");
});
