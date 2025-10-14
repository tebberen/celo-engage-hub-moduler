import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

let proposals = [];

// ✅ Proposal’ları localStorage’dan yükle
function loadProposals() {
  const stored = localStorage.getItem("celoGovernanceProposals");
  if (stored) return JSON.parse(stored);
  return [];
}

// ✅ Proposal’ları kaydet
function saveProposals() {
  localStorage.setItem("celoGovernanceProposals", JSON.stringify(proposals));
}

// ✅ Proposal listesi oluştur
export function renderGovernanceSection() {
  const container = document.getElementById("governanceSection");
  const list = document.getElementById("proposalsContainer");
  if (!container || !list) return;

  list.innerHTML = "";
  if (proposals.length === 0) {
    list.innerHTML = `<p>No active proposals yet.</p>`;
  } else {
    proposals.forEach((p, i) => {
      const card = document.createElement("div");
      card.classList.add("link-card");
      card.innerHTML = `
        <h4>${p.title}</h4>
        <p>${p.description}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>🗳️ Votes: ${p.votes}</span>
          <button class="vote-btn" onclick="voteProposal(${i})">Vote ✅</button>
        </div>
      `;
      list.appendChild(card);
    });
  }
  container.classList.remove("hidden");
}

// ✅ Yeni Proposal oluştur
export async function createProposal(signer, userAddress) {
  const title = document.getElementById("proposalTitle").value.trim();
  const description = document.getElementById("proposalDescription").value.trim();
  if (!title || !description) {
    alert("Please enter title and description.");
    return;
  }

  try {
    const tx = await signer.sendTransaction({
      to: userAddress,
      value: 0,
      gasLimit: 120000,
    });
    await tx.wait();

    proposals.push({ title, description, votes: 0 });
    saveProposals();
    renderGovernanceSection();
    alert("✅ Proposal created successfully!");
  } catch (err) {
    console.error("❌ Proposal creation failed:", err);
    alert("Transaction rejected or failed.");
  }
}

// ✅ Oy verme işlemi
window.voteProposal = async function (index) {
  if (!window.signer || !window.userAddress) {
    alert("Please connect your wallet first!");
    return;
  }

  try {
    const tx = await window.signer.sendTransaction({
      to: window.userAddress,
      value: 0,
      gasLimit: 100000,
    });
    await tx.wait();

    proposals[index].votes++;
    saveProposals();
    renderGovernanceSection();
    alert("✅ Vote confirmed on-chain!");
  } catch (err) {
    console.error("❌ Voting failed:", err);
    alert("Transaction failed or cancelled.");
  }
};

// ✅ Başlatma
export function initGovernance() {
  proposals = loadProposals();
}
