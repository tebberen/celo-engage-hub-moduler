import { initialSupportLinks } from './constants.js';

export function loadLinksFromStorage() {
  const saved = localStorage.getItem('communityLinks');
  if (saved) return JSON.parse(saved);
  // ilk açılışta başlangıç linkleri
  const seed = initialSupportLinks.map(link => ({ link, clickCount: 0, timestamp: Date.now() }));
  localStorage.setItem('communityLinks', JSON.stringify(seed));
  return seed;
}

export function saveLinksToStorage(links) {
  localStorage.setItem('communityLinks', JSON.stringify(links));
}

export function displaySupportLinks(links, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!links || links.length === 0) {
    container.innerHTML = '<p>No community links yet. Be the first to share!</p>';
    return;
  }

  links.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'link-card';
    card.innerHTML = `
      <a href="${item.link}" target="_blank">${item.link}</a>
      <div class="link-stats">
        <div class="stat-item"><div>👍 Supports</div><div class="stat-value">${item.clickCount || 0}</div></div>
      </div>
      <button class="support-btn" onclick="handleCommunityLink(${index})">Support This Content</button>
    `;
    container.appendChild(card);
  });
}

export function handleCommunityLink(index) {
  const links = loadLinksFromStorage();
  links[index].clickCount = (links[index].clickCount || 0) + 1;
  saveLinksToStorage(links);
  displaySupportLinks(links, 'linksContainer');
}
