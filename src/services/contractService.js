// ✅ Ethers import (kök dizin için doğru)
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
// ✅ Constants kök dizinde
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants.js";

/** ----------------------------------------------------------------
 *  Helpers
 *  ---------------------------------------------------------------*/
function getContract(providerOrSigner) {
  // providerOrSigner: provider (read) veya signer (write)
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
}

/** ----------------------------------------------------------------
 *  Profile
 *  ---------------------------------------------------------------*/
export async function loadUserProfile(provider, signer, userAddress) {
  try {
    const contract = getContract(provider);
    // Kontratında isim farklı olabilir; yoksa bu çağrı try/catch’te sessiz düşer
    const p = await contract.getUserProfile(userAddress);

    const userProfile = {
      username: p[0],
      supportCount: p[1]?.toString?.() ?? "0",
      reputation: p[2]?.toString?.() ?? "0",
      badgeCount: p[3]?.toString?.() ?? "0",
      isActive: !!p[4],
      timestamp: p[5]?.toString?.() ?? "0"
    };

    console.log("✅ User profile loaded:", userProfile);

    // Basit UI örneği (eleman yoksa sorun çıkarmaz)
    document.getElementById("walletInfo")?.classList.remove("hidden");
  } catch (err) {
    // Buraya düşüyorsa kontratta getUserProfile olmayabilir; sorun değil, app çalışmaya devam eder
    console.warn("⚠️ Profile read skipped (contract view may not exist):", err?.message || err);
  }
}

/** ----------------------------------------------------------------
 *  Proposals (opsiyonel – kontratında karşılığı yoksa try/catch yakalar)
 *  ---------------------------------------------------------------*/
export async function loadProposals(provider) {
  try {
    const contract = getContract(provider);
    const list = await contract.getActiveProposals?.();
    const container = document.getElementById("proposalsContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!list || list.length === 0) {
      container.innerHTML = `<p>No active proposals yet.</p>`;
      return;
    }

    list.forEach((p, idx) => {
      const card = document.createElement("div");
      card.classList.add("link-card");
      const forVotes = p.votesFor?.toString?.() ?? "0";
      const againstVotes = p.votesAgainst?.toString?.() ?? "0";

      card.innerHTML = `
        <h4>${p.title ?? "Untitled"}</h4>
        <p>${p.description ?? ""}</p>
        <div style="display:flex;justify-content:space-between;margin:8px 0;">
          <span>🗳️ For: ${forVotes}</span>
          <span>❌ Against: ${againstVotes}</span>
        </div>
        <div style="display:flex;gap:10px;">
          <button onclick="window.voteProposal(${idx}, true)">👍 Support</button>
          <button onclick="window.voteProposal(${idx}, false)">👎 Oppose</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.warn("⚠️ loadProposals skipped (method may not exist):", err?.message || err);
  }
}

export async function createProposal(provider, signer) {
  try {
    const title = document.getElementById("proposalTitle")?.value.trim();
    const description = document.getElementById("proposalDescription")?.value.trim();
    if (!title || !description) {
      alert("Please fill in title and description.");
      return;
    }

    const contract = getContract(signer);
    const duration = 3 * 24 * 60 * 60; // 3 gün
    const tx = await contract.createProposal?.(title, description, duration, { gasLimit: 600000 });
    if (!tx) throw new Error("createProposal not found on contract");
    await tx.wait();

    alert("✅ Proposal created!");
    await loadProposals(provider);
  } catch (err) {
    console.error("❌ Proposal creation error:", err);
    alert("Failed to create proposal.");
  }
}

export async function voteProposal(provider, signer, proposalId, support) {
  try {
    const contract = getContract(signer);
    const tx = await contract.voteProposal?.(proposalId, !!support, { gasLimit: 400000 });
    if (!tx) throw new Error("voteProposal not found on contract");
    await tx.wait();

    alert("✅ Vote submitted!");
    await loadProposals(provider);
  } catch (err) {
    console.error("❌ Voting error:", err);
    alert("Voting failed.");
  }
}

/** ----------------------------------------------------------------
 *  Badges (opsiyonel)
 *  ---------------------------------------------------------------*/
export async function loadUserBadges(provider, userAddress) {
  try {
    const contract = getContract(provider);
    const badges = await contract.getUserBadges?.(userAddress);
    const container = document.getElementById("badgesContainer");
    if (!container) return;

    container.innerHTML = "";
    if (!badges || badges.length === 0) {
      container.innerHTML = `<p>No badges yet.</p>`;
      return;
    }

    badges.forEach((b) => {
      const div = document.createElement("div");
      div.classList.add("link-card");
      div.innerHTML = `<p>🏅 ${b}</p>`;
      container.appendChild(div);
    });
  } catch (err) {
    console.warn("⚠️ loadUserBadges skipped (method may not exist):", err?.message || err);
  }
}
