import { ethers } from "ethers";
import { provider, signer, CONTRACT_ADDRESS, CONTRACT_ABI } from "./walletService.js";

// 🧩 Kullanıcı profilini yükleme
export async function loadUserProfile(provider, signer, userAddress) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);

    const userProfile = {
      username: profile[0],
      supportCount: profile[1],
      reputation: profile[2],
      badgeCount: profile[3],
      isActive: profile[4],
      timestamp: profile[5],
    };

    console.log("✅ User Profile:", userProfile);
    return userProfile;
  } catch (error) {
    console.error("❌ Error loading user profile:", error);
  }
}

// 🧱 Tüm proposalları (aktif + geçmiş) yükleme
export async function loadProposals() {
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
      try {
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
      } catch (err) {
        console.log(`Skipping proposal #${i} (possibly invalid)`);
      }
    }
  } catch (error) {
    console.error("Error loading proposals:", error);
  }
}

// 🗳️ Yeni proposal oluşturma
export async function createProposal(title, description) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const duration = 3 * 24 * 60 * 60; // 3 gün
    const tx = await contract.createProposal(title, description, duration, { gasLimit: 600000 });

    console.log("🔄 Proposal TX sent:", tx.hash);
    await tx.wait();
    console.log("✅ Proposal created successfully!");
    alert("🎉 Proposal created successfully!");
  } catch (error) {
    console.error("❌ Proposal creation error:", error);
    alert("❌ Error creating proposal! Check console for details.");
  }
}

// 👍 / 👎 Oy verme
export async function voteProposal(proposalId, support) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.voteProposal(proposalId, support, { gasLimit: 400000 });

    console.log("🔄 Vote TX sent:", tx.hash);
    await tx.wait();
    console.log("✅ Vote submitted successfully!");
    alert("✅ Vote submitted successfully!");
    await loadProposals();
  } catch (error) {
    console.error("❌ Voting error:", error);
    alert("⚠️ Voting failed! See console for details.");
  }
}

// 🎖️ Kullanıcı rozetlerini yükleme
export async function loadUserBadges(userAddress) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const badges = await contract.getUserBadges(userAddress);
    const container = document.getElementById("userBadgesContainer");
    container.innerHTML = "";

    if (badges.length === 0) {
      container.innerHTML = "<p>No badges yet. Be active in the community to earn badges!</p>";
      return;
    }

    badges.forEach((badge) => {
      const badgeCard = document.createElement("div");
      badgeCard.className = "badge-card";
      badgeCard.innerHTML = `
        <strong>${badge}</strong>
        <p>Earned through community participation</p>
      `;
      container.appendChild(badgeCard);
    });
  } catch (error) {
    console.error("Error loading badges:", error);
  }
}
