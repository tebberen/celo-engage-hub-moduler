import { submitLinkOnChain } from "./src/services/contractService.js";
import { loadLinksFromStorage, saveLinksToStorage } from "./helpers.js";

let communityLinks = [];

export function displaySupportLinks() {
  communityLinks = loadLinksFromStorage();

  const container = document.getElementById("linksContainer");
  if (!container) return;

  container.innerHTML = "";

  // Only show links with less than 5 supports
  const visibleLinks = communityLinks.filter((link) => link.clickCount < 5);

  if (visibleLinks.length === 0) {
    container.innerHTML = `
      <div class="link-card">
        <p>🌟 All links have reached their support goal.</p>
      </div>`;
    return;
  }

  visibleLinks.forEach((item) => {
    const linkCard = document.createElement("div");
    linkCard.className = "link-card";
    linkCard.innerHTML = `
      <div>
        <a href="${item.url}" target="_blank" class="support-link" onclick="handleCommunityLink('${item.url}')">
          ${item.url}
        </a>
      </div>
      <div class="link-stats">
        <div class="stat-item">
          <div>Supports</div>
          <div class="stat-value">${item.clickCount}/5</div>
        </div>
      </div>
    `;
    container.appendChild(linkCard);
  });

  updateSupportStats();
}

// Update sidebar stats
function updateSupportStats() {
  const totalSupports = communityLinks.reduce(
    (sum, l) => sum + (l.clickCount || 0),
    0
  );
  const totalSupportsEl = document.getElementById("totalSupports");
  if (totalSupportsEl) totalSupportsEl.textContent = String(totalSupports);
}

// Handle link click
function handleCommunityLink(url) {
  const index = communityLinks.findIndex((l) => l.url === url);
  if (index >= 0) {
    communityLinks[index].clickCount = (communityLinks[index].clickCount || 0) + 1;
    if (communityLinks[index].clickCount > 5)
      communityLinks[index].clickCount = 5;
    saveLinksToStorage(communityLinks);
  }

  // Show "Add Link" section after the first click
  localStorage.setItem("hasSupported", "true");
  showAddLinkSection();

  // Refresh visible links
  displaySupportLinks();
}
window.handleCommunityLink = handleCommunityLink;

function showAddLinkSection() {
  const addLinkSection = document.getElementById("addLinkSection");
  if (!addLinkSection) return;

  const hasSupported = localStorage.getItem("hasSupported") === "true";
  if (hasSupported) addLinkSection.classList.remove("hidden");
  else addLinkSection.classList.add("hidden");
}

export function initAddLinkUI() {
  const submitBtn = document.getElementById("submitLinkBtn");
  const input = document.getElementById("newLinkUrl");
  const hint = document.getElementById("addLinkHint");

  if (!submitBtn || !input) return;

  submitBtn.addEventListener("click", async () => {
    const url = String(input.value || "").trim();
    if (!/^https?:\/\//i.test(url)) {
      alert("Please enter a valid URL (https://...)");
      return;
    }

    try {
      submitBtn.disabled = true;
      hint.textContent = "⏳ Sending transaction to Celo network...";

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const txHash = await submitLinkOnChain(provider, signer, url);

      hint.textContent = `✅ Transaction confirmed: ${txHash.slice(0, 10)}...`;

      communityLinks.unshift({
        url,
        clickCount: 0,
        createdAt: Date.now(),
      });

      saveLinksToStorage(communityLinks);
      input.value = "";
      displaySupportLinks();
    } catch (err) {
      console.error(err);
      alert("Transaction failed or was rejected.");
      hint.textContent = "";
    } finally {
      submitBtn.disabled = false;
    }
  });

  showAddLinkSection();
}
