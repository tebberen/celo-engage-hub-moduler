// /src/services/contractService.js
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/constants.js";

function getContract(providerOrSigner) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
}

export async function loadUserProfile(provider, signer, userAddress) {
  try {
    const contract = getContract(provider);
    const profile = await contract.getUserProfile(userAddress);

    const userProfile = {
      username: profile[0],
      supportCount: profile[1]?.toString?.() ?? "0",
      reputation: profile[2]?.toString?.() ?? "0",
      badgeCount: profile[3]?.toString?.() ?? "0",
      isActive: Boolean(profile[4]),
      timestamp: profile[5]?.toString?.() ?? "0"
    };

    if (userProfile.isActive) {
      document.getElementById('userProfileSection')?.classList.add('hidden');
      document.getElementById('governanceSection')?.classList.remove('hidden');
      document.getElementById('badgesSection')?.classList.remove('hidden');
      await loadUserBadges(provider, userAddress);
      await loadProposals(provider);
      document.getElementById('platformStats')?.classList.remove('hidden');
    } else {
      document.getElementById('userProfileSection')?.classList.remove('hidden');
    }

    try {
      const totalUsers = await contract.totalUsers();
      const proposalCount = await contract.proposalCount();
      document.getElementById('totalUsers')!.textContent = totalUsers.toString();
      document.getElementById('totalProposals')!.textContent = proposalCount.toString();
      document.getElementById('totalBadges')!.textContent = userProfile.badgeCount;
    } catch {}
  } catch (error) {
    console.error("Profil yükleme hatası:", error);
  }
}

export async function setupUserProfile(provider, signer, userAddress) {
  try {
    const contract = getContract(provider);
    const current = await contract.getUserProfile(userAddress);
    const username = document.getElementById("userUsername")?.value?.trim();

    if (!username) {
      alert("Önce kullanıcı adı giriniz.");
      return;
    }

    let tx;
    if (current[4] === true) {
      tx = await contract.connect(signer).updateProfile(username, { gasLimit: 300000 });
      alert("🔄 Profil güncelleniyor...");
    } else {
      tx = await contract.connect(signer).registerUser(username, { gasLimit: 500000 });
      alert("🚀 Yeni profil kaydı...");
    }

    await tx.wait();
    alert("✅ Profil hazır!");
    await loadUserProfile(provider, signer, userAddress);
  } catch (error) {
    console.error("Profil kurulum hatası:", error);
    alert("Profil kurulumu başarısız.");
  }
}

export async function createProposal(provider, signer) {
  try {
    const title = document.getElementById("proposalTitle")?.value?.trim();
    const description = document.getElementById("proposalDescription")?.value?.trim();

    if (!title || !description) {
      alert("Başlık ve açıklama gerekli.");
      return;
    }

    const contract = getContract(signer);
    const duration = 3 * 24 * 60 * 60;
    const tx = await contract.createProposal(title, description, duration, { gasLimit: 600000 });

    await tx.wait();
    alert("✅ Teklif oluşturuldu!");
    await loadProposals(provider);
  } catch (error) {
    console.error("Teklif oluşturma hatası:", error);
    alert("Teklif başarısız.");
  }
}

export async function voteProposal(provider, signer, proposalId, support) {
  try {
    const contract = getContract(signer);
    const tx = await contract.voteProposal(proposalId, support, { gasLimit: 400000 });
    await tx.wait();
    alert("✅ Oy gönderildi!");
    await loadProposals(provider);
  } catch (error) {
    console.error("Oy verme hatası:", error);
    alert("Oy verme başarısız.");
  }
}

export async function loadProposals(provider) {
  const wrapTime = (ts) => {
    const now = Math.floor(Date.now() / 1000);
    const sec = Number(ts) - now;
    if (sec <= 0) return "Ended";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m left`;
  };

  try {
    const contract = getContract(provider);
    const container = document.getElementById('proposalsContainer');
    if (!container) return;

    container.innerHTML = 'Loading...';

    const ids = await contract.getActiveProposals();
    const idArr = ids.map(id => Number(id));
    if (idArr.length === 0) {
      container.innerHTML = `<div class="link-card">No active proposals.</div>`;
      return;
    }

    container.innerHTML = '';
    for (const pid of idArr) {
      const p = await contract.getProposalDetails(pid);
      const data = {
        id: Number(p[0]),
        title: p[1],
        description: p[2],
        creator: p[3],
        votesFor: Number(p[4]),
        votesAgainst: Number(p[5]),
        deadline: Number(p[6]),
        executed: Boolean(p[7]),
      };

      const card = document.createElement('div');
      card.className = 'link-card';
      card.innerHTML = `
        <div>
          <div class="link-platform">#${data.id}</div>
          <div class="support-link" style="margin-bottom:8px;">${data.title}</div>
          <div style="font-size:14px; color:#333; margin-bottom:10px;">${data.description}</div>
          <div style="font-size:12px; color:#666; margin-bottom:4px;">By ${data.creator}</div>
          <div style="display:flex; gap:12px; font-weight:bold;">
            <div>✅ ${data.votesFor}</div>
            <div>❌ ${data.votesAgainst}</div>
            <div>⏰ ${wrapTime(data.deadline)}</div>
          </div>
        </div>
        <div style="margin-top:12px;">
          <button class="vote-for">Vote For</button>
          <button class="vote-against">Vote Against</button>
        </div>
      `;
      card.querySelector('.vote-for')?.addEventListener('click', async () => {
        const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
        await voteProposal(provider, signer, data.id, true);
      });
      card.querySelector('.vote-against')?.addEventListener('click', async () => {
        const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
        await voteProposal(provider, signer, data.id, false);
      });

      container.appendChild(card);
    }
  } catch (error) {
    console.error("loadProposals hatası:", error);
  }
}

export async function loadUserBadges(provider, userAddress) {
  try {
    const contract = getContract(provider);
    const listEl = document.getElementById('badgesList');
    if (!listEl) return;

    const badges = await contract.getUserBadges(userAddress);
    listEl.innerHTML = '';
    if (!badges || badges.length === 0) {
      listEl.innerHTML = '<li>No badges yet.</li>';
      return;
    }
    badges.forEach((b) => {
      const li = document.createElement('li');
      li.textContent = b;
      listEl.appendChild(li);
    });
  } catch (error) {
    console.error("loadUserBadges hatası:", error);
  }
}

// 🔸 URL onayı için zincire TX
export async function submitLinkOnChain(provider, signer, url) {
  // Neden: Kontratta submitLink varsa onu kullan; yoksa raw tx ile URL’yi data olarak zincire yaz
  const contract = getContract(signer);
  const user = await signer.getAddress();

  try {
    // Fonksiyon var mı?
    contract.interface.getFunction('submitLink');
    const tx = await contract.submitLink(url, { gasLimit: 250000 });
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch {
    // Fallback: raw tx (0 CELO, data = url hex)
    const dataHex = utf8ToHex(url);
    const tx = await signer.sendTransaction({
      to: user,
      value: 0,
      data: dataHex
    });
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }
}

function utf8ToHex(str) {
  // Neden: URL’yi zincir üzerinde kanıt olarak iz bırakmak
  const enc = new TextEncoder().encode(str);
  return '0x' + Array.from(enc).map(b => b.toString(16).padStart(2, '0')).join('');
}
