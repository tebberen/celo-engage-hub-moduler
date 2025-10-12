// ✅ Linkleri localStorage’da yönetir
export function loadLinksFromStorage() {
  const storedLinks = localStorage.getItem("celoEngageHubLinks");
  if (storedLinks) {
    return JSON.parse(storedLinks);
  } else {
    const initialLinks = [
      "https://farcaster.xyz/teberen/0x391c5713",
      "https://farcaster.xyz/ertu",
      "https://x.com/luckyfromnecef/status/1972371920290259437",
      "https://github.com/tebberen",
      "https://x.com/egldmvx?s=21"
    ];
    return initialLinks.map(link => ({
      link,
      clickCount: 0,
      timestamp: Date.now(),
      submitter: "community"
    }));
  }
}

export function saveLinksToStorage(links) {
  localStorage.setItem("celoEngageHubLinks", JSON.stringify(links));
}

// ✅ Platform ismini döndürür (ikonla birlikte)
export function getPlatformName(url) {
  if (url.includes("x.com") || url.includes("twitter.com")) return "🐦 X";
  if (url.includes("farcaster.xyz") || url.includes("warpcast.com")) return "🔮 Farcaster";
  if (url.includes("github.com")) return "💻 GitHub";
  if (url.includes("youtube.com")) return "📺 YouTube";
  if (url.includes("discord.com")) return "💬 Discord";
  return "🌐 Website";
}

// ✅ Destek bağlantılarını ekrana basar
export function displaySupportLinks(links, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const activeLinks = links.filter(l => l.clickCount < 5);

  if (activeLinks.length === 0) {
    container.innerHTML = `
      <div class="link-card">
        <p>🌟 All links have reached maximum support!</p>
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
        <a href="${linkData.link}" target="_blank" class="support-link">${linkData.link}</a>
      </div>
      <div class="link-stats">
        <div class="stat-item">
          <div>Supports</div>
          <div class="stat-value">${linkData.clickCount}/5</div>
        </div>
      </div>
      <button class="supportBtn">👍 Support This Content</button>
    `;

    const btn = linkCard.querySelector(".supportBtn");
    btn.addEventListener("click", () => {
      linkData.clickCount++;
      saveLinksToStorage(links);
      displaySupportLinks(links, containerId);
    });

    container.appendChild(linkCard);
  });
}

// ✅ Link tıklama handler
export function handleCommunityLink(url) {
  window.open(url, "_blank");
}
