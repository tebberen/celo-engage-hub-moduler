// Storage key
const LINKS_KEY = "communityLinks";

const initialLinks = [
  { url: "https://farcaster.xyz/teberen", clickCount: 0 },
  { url: "https://x.com/ertu", clickCount: 0 },
  { url: "https://github.com/tebberen", clickCount: 0 },
];

export function loadLinksFromStorage() {
  const data = localStorage.getItem(LINKS_KEY);
  if (!data) {
    localStorage.setItem(LINKS_KEY, JSON.stringify(initialLinks));
    return initialLinks;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialLinks;
  }
}

export function saveLinksToStorage(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}
