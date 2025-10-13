import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/constants.js";

// Kontrat nesnesi oluştur
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

    if (userProfile.isActive) {
      document.getElementById('userProfileSection').classList.add('hidden');
      document.getElementById('governanceSection').classList.remove('hidden');
      document.getElementById('badgesSection').classList.remove('hidden');
      loadUserBadges(provider, userAddress);
      loadProposals(provider);
    } else {
      document.getElementById('userProfileSection').classList.remove('hidden');
    }
  } catch (error) {
    console.error("❌ Error loading profile:", error);
  }
}

// 🔹 Kullanıcı profili oluştur / güncelle
export async function setupUserProfile(provider, signer, userAddress) {
  try {
    const contract = getContract(provider);
    const userProfile = await contract.getUserProfile(userAddress);
    const username = document.getElementById("userUsername").value.trim();

    if (!username) {
      alert("Please enter a username first!");
      return;
    }

    let tx;
    if (userProfile.isActive) {
      tx = await contract.connect(signer).updateProfile(username, { gasLimit: 300000 });
      alert("🔄 Updating profile...");
    } else {
      tx = await contract.connect(signer).registerUser(username, { gasLimit: 500000 });
      alert("🚀 Registering new profile...");
    }

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
    const title = document.getElementById("proposalTitle").value.trim();
    const description = document.getElementById("proposalDescription").value.trim();

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
    const container = document.getElementById('proposalsContainer');
    container.innerHTML = '';

    if (activeProposals.length === 0) {
      container.innerHTML = '<p>No active proposals yet.</p>';
      return;
    }

    for (let i = 0; i < activeProposals.length; i++) {
      const proposalId = activeProposals[i];
      const details = await contract.getProposalDetails(proposalId);

      const card = document.createElement('div');
      card.className = 'proposal-card';
      card.innerHTML = `
        <h4>${details.title}</h4>
        <p>${details.description}</p>
        <div class="link-stats">
          <div class="stat-item"><div>👍 For</div><div class="stat-value">${details.votesFor.toString()}</div></div>
          <div class="stat-item"><div>👎 Against</div><div class="stat-value">${details.votesAgainst.toString()}</div></div>
        </div>
        <button onclick="voteProposal(${proposalId}, true)">👍 Support</button>
        <button onclick="voteProposal(${proposalId}, false)">👎 Oppose</button>`;
      container.appendChild(card);
    }
  } catch (error) {
    console.error("❌ Error loading proposals:", error);
  }
}

// 🔹 Kullanıcı rozetlerini yükle
export async function loadUserBadges(provider, userAddress) {
  try {
    const contract = getContract(provider);
    const badges = await contract.getUserBadges(userAddress);
    const container = document.getElementById('userBadgesContainer');
    container.innerHTML = '';

    if (badges.length === 0) {
      container.innerHTML = '<p>No badges yet. Be active to earn badges!</p>';
      return;
    }

    badges.forEach(badge => {
      const badgeCard = document.createElement('div');
      badgeCard.className = 'badge-card';
      badgeCard.innerHTML = `<strong>${badge}</strong><p>Earned through community participation</p>`;
      container.appendChild(badgeCard);
    });
  } catch (error) {
    console.error("❌ Error loading badges:", error);
  }
}
// 🔹 Support link gönderimi
export async function submitSupportLink(provider, signer, linkUrl) {
  try {
    const contract = getContract(signer);
    const tx = await contract.addSupportLink(linkUrl, { gasLimit: 500000 });
    console.log("🔄 Transaction sent:", tx.hash);
    alert("🦊 MetaMask opened. Please confirm the transaction...");
    await tx.wait();
    alert("✅ Link successfully submitted to blockchain!");
    return true;
  } catch (error) {
    console.error("❌ submitSupportLink error:", error);
    alert("Transaction failed. Please check the console for details.");
    return false;
  }
}
