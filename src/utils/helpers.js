// ✅ src/utils/helpers.js

export function loadLinksFromStorage() {
  const saved = localStorage.getItem('communityLinks');
  return saved ? JSON.parse(saved) : [];
}

export function saveLinksToStorage(links) {
  localStorage.setItem('communityLinks', JSON.stringify(links));
}

export function displaySupportLinks(links, containerId) {
  const container = document.getElementById(containerId);
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
      <p>Supports: ${item.clickCount || 0}</p>
      <button onclick="handleCommunityLink(${index})">Support</button>
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
