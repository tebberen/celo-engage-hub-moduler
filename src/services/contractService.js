import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./walletService.js";

// 🔹 Kullanıcı profilini yükleme
export async function loadUserProfile(provider, signer, userAddress) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);

    return {
      username: profile[0],
      supportCount: profile[1],
      reputation: profile[2],
      badgeCount: profile[3],
      isActive: profile[4],
      timestamp: profile[5],
    };
  } catch (error) {
    console.error("❌ Error loading user profile:", error);
  }
}

// 🔹 Governance: Tüm proposalları (aktif + geçmiş) listele
export async function loadProposals(provider) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const totalCount = await contract.proposalCount();
    const container = document.getElementById("proposalsContainer");
    container.innerHTML = "";

    if (totalCount.toNumber() === 0) {
      container.innerHTML = "<p>No proposals found yet.</p>";
      return;
    }

    for (let i = totalCount.toNumber(); i >= 1; i--) {
      const details = await contract.getProposalDetails(i);
      const proposalCard = document.createElement("div");
      proposalCard.className = "proposal-card";

      proposalCard.innerHTML = `
        <h4>${details.title}</h4>
        <p>${details.description}</p>
        <div class="link-stats">
          <div class="stat-item">
            <div>👍 For</div>
            <div class="stat-value">${details.votesFor.toString()}</div>
          </div>
          <div class="stat-item">
            <div>👎 Against</div>
            <div class="stat-value">${details.votesAgainst.toString()}</div>
          </div>
        </div>
        <p><small>🧾 ID: ${details.id} | ${details.executed ? "✅ Executed" : "🕒 Pending"}</small></p>
        <button class="vote-btn" onclick="voteProposal(${details.id}, true)">👍 Support</button>
        <button class="vote-btn" onclick="voteProposal(${details.id}, false)">👎 Oppose</button>
      `;
      container.appendChild(proposalCard);
    }
  } catch (error) {
    console.error("Error loading proposals:", error);
  }
}

// 🔹 Proposal oluşturma
export async function createProposal(provider, signer, title, description) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const duration = 3 * 24 * 60 * 60; // 3 gün
    const tx = await contract.createProposal(title, description, duration, { gasLimit: 600000 });
    console.log("🔄 TX sent:", tx.hash);
    await tx.wait();
    alert("✅ Proposal created successfully!");
  } catch (error) {
    console.error("❌ Error creating proposal:", error);
    alert("⚠️ Failed to create proposal. Check console for details.");
  }
}

// 🔹 Oy verme (Support / Oppose)
export async function voteProposal(id, support) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const tx = await contract.voteProposal(id, support, { gasLimit: 400000 });
    console.log("🔄 Vote TX:", tx.hash);
    await tx.wait();
    alert("✅ Vote submitted successfully!");
  } catch (error) {
    console.error("❌ Voting error:", error);
    alert("⚠️ Voting failed! Check console for details.");
  }
}
