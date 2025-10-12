import { connectWalletMetaMask, disconnectWallet } from "./src/services/walletService.js";
import { loadProposals, createProposal, voteProposal } from "./src/services/contractService.js";

// 🔗 Cüzdan bağlantıları
document.getElementById("connectWalletBtn").addEventListener("click", connectWalletMetaMask);
document.getElementById("disconnectWalletBtn").addEventListener("click", disconnectWallet);

// 🏛️ Governance butonuna tıklayınca açılır
const governanceButton = document.getElementById("governanceButton");
if (governanceButton) {
  governanceButton.addEventListener("click", async () => {
    const homeSection = document.getElementById("homeSection");
    const governanceSection = document.getElementById("governanceSection");
    homeSection.classList.add("hidden");
    governanceSection.classList.remove("hidden");

    // Governance içeriğini yenile
    await loadProposals();
  });
}

// 🏠 Geri dön butonu
const governanceSection = document.getElementById("governanceSection");
if (governanceSection) {
  const backButton = document.createElement("button");
  backButton.textContent = "🏠 Back to Home";
  backButton.className = "connect-btn";
  backButton.style.marginTop = "20px";

  backButton.addEventListener("click", () => {
    governanceSection.classList.add("hidden");
    document.getElementById("homeSection").classList.remove("hidden");
  });

  governanceSection.appendChild(backButton);
}

// 🎯 Governance işlemleri
document.getElementById("createProposalBtn").addEventListener("click", async () => {
  const title = document.getElementById("proposalTitle").value.trim();
  const desc = document.getElementById("proposalDescription").value.trim();
  if (!title || !desc) return alert("Please fill title and description!");
  await createProposal(title, desc);
});

// 🗳️ Oy verme butonları — loadProposals içinden dinamik olarak bağlanır
export function renderProposal(proposalId, title, description, votesFor, votesAgainst) {
  const container = document.getElementById("proposalsContainer");
  const card = document.createElement("div");
  card.className = "proposal-card";
  card.innerHTML = `
    <h4>${title}</h4>
    <p>${description}</p>
    <div class="link-stats">
      <div class="stat-item"><div>👍 For</div><div class="stat-value">${votesFor}</div></div>
      <div class="stat-item"><div>👎 Against</div><div class="stat-value">${votesAgainst}</div></div>
    </div>
  `;
  const voteForBtn = document.createElement("button");
  voteForBtn.textContent = "👍 Support";
  voteForBtn.onclick = async () => await voteProposal(proposalId, true);

  const voteAgainstBtn = document.createElement("button");
  voteAgainstBtn.textContent = "👎 Oppose";
  voteAgainstBtn.onclick = async () => await voteProposal(proposalId, false);

  card.appendChild(voteForBtn);
  card.appendChild(voteAgainstBtn);
  container.appendChild(card);
}

// ✅ Sayfa yüklenince linkleri göster
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Celo Engage Hub loaded!");
});
