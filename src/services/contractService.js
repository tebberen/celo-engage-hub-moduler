// ✅ Ethers import (çok önemli!)
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/constants.js";

// 🔹 Kontrat nesnesi oluştur
function getContract(providerOrSigner) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
}

// 🔹 Kullanıcı profilini yükle
export async function loadUserProfile(provider, signer, userAddress) {
  try {
    const contract = getContract(provider);
    const profile = await contract.getUserProfile(userAddress);

    const userProfile = {
      username: profile[0],
      supportCount: profile[1].toString(),
      reputation: profile[2].toString(),
      badgeCount: profile[3].toString(),
      isActive: profile[4],
      timestamp: profile[5].toString()
    };

    console.log("✅ User profile loaded:", userProfile);

    // UI güncellemesi
    if (userProfile.isActive) {
      document.getElementById('userProfileSection')?.classList.add('hidden');
      document.getElementById('governanceSection')?.classList.remove('hidden');
      document.getElementById('badgesSection')?.classList.remove('hidden');
      loadUserBadges(provider, userAddress);
      loadProposals(provider);
    } else {
      document.getElementById('userProfileSection')?.classList.remove('hidden');
    }
  } catch (error) {
    console.error("❌ Error loading profile:", error);
  }
}

// 🔹 Kullanıcı profili oluştur / güncelle
export async function setupUserProfile(provider, signer, userAddress) {
  try {
    const contract = getContract(signer);
    const username = document.getElementById("userUsername")?.value.trim();

    if (!username) {
      alert("Please enter a username first!");
      return;
    }

    const tx = await contract.connect(signer).registerUser(username, { gasLimit: 500000 });
    alert("🚀 Registering new profile...");
    await tx.wait();

    alert("✅ Profile setup complete!");
    loadUserProfile(provider, signer, userAddress);
  } catch (error) {
    console.error("❌ Profile setup error:", error);
    alert("Profile setup failed. Check console for details.");
  }
}

// 🔹 Proposal oluştur
export async function createProposal(provider, signer) {
  try {
    const title = document.getElementById("proposalTitle")?.value.trim();
    const description = document.getElementById("proposalDescription")?.value.trim();

    if (!title || !description) {
      alert("Please enter both title and description");
      return;
    }

    const contract = getContract(signer);
    const duration = 3 * 24 * 60 * 60; // 3 gün

    const tx = await contract.createProposal(title, description, duration, { gasLimit: 600000 });
    console.log("🔄 Proposal TX sent:", tx.hash);

    await tx.wait();
    alert("✅ Proposal created successfully!");
    loadProposals(provider);
  } catch (error) {
    console.error("❌ Proposal creation error:", error);
    alert("Failed to create proposal.");
  }
}

// 🔹 Oy verme
export async function voteProposal(provider, signer, proposalId, support) {
  try {
    const contract = getContract(signer);
    const tx = await contract.voteProposal(proposalId, support, { gasLimit: 400000 });
    await tx.wait();

    alert("✅ Vote submitted successfully!");
    loadProposals(provider);
  } catch (error) {
    console.error("❌ Voting error:", error);
    alert("Voting failed.");
  }
}

// 🔹 Aktif Proposal'ları yükle
export async function loadProposals(provider) {
  try {
    const contract = getContract(provider);
    const activeProposals = await contract.getActiveProposals();
    const container = document.getElementById("proposalsContainer");

    if (!container) return;
    container.innerHTML = "";

    if (!activeProposals.length) {
      container.innerHTML = `<p>No active proposals yet.</p>`;
      return;
    }

    activeProposals.forEach((p, index) => {
      const card = document.createElement("div");
      card.classList.add("link-card");
      card.innerHTML = `
        <h4>${p.title}</h4>
        <p>${p.description}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>🗳️ For: ${p.votesFor.toString()}</span>
          <span>❌ Against: ${p.votesAgainst.toString()}</span>
        </div>
        <div style="margin-top:10px;display:flex;gap:10px;">
          <button onclick="voteProposal(window.provider, window.signer, ${index}, true)">👍 Support</button>
          <button onclick="voteProposal(window.provider, window.signer, ${index}, false)">👎 Oppose</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("❌ Error loading proposals:", error);
  }
}

// 🔹 Kullanıcı badge'lerini yükle (isteğe bağlı)
export async function loadUserBadges(provider, userAddress) {
  try {
    const contract = getContract(provider);
    const badges = await contract.getUserBadges(userAddress);
    const container = document.getElementById("badgesContainer");
    if (!container) return;

    container.innerHTML = "";
    if (!badges.length) {
      container.innerHTML = `<p>No badges earned yet.</p>`;
      return;
    }

    badges.forEach(b => {
      const div = document.createElement("div");
      div.classList.add("link-card");
      div.innerHTML = `<p>🏅 ${b}</p>`;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("❌ Error loading badges:", error);
  }
}
