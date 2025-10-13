// /src/services/walletService.js
import { ethers } from 'ethers';
import { CELO_MAINNET_PARAMS } from "../utils/constants.js";

export function checkMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    alert("⚠️ MetaMask bulunamadı. Lütfen yükleyin.");
    return false;
  }
  return true;
}

export async function switchToCeloNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CELO_MAINNET_PARAMS.chainId }],
    });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [CELO_MAINNET_PARAMS],
      });
      return true;
    }
    console.error("Celo ağına geçiş hatası:", switchError);
    alert("⚠️ Lütfen MetaMask üzerinden Celo Mainnet'e geçiniz.");
    return false;
  }
}

export async function connectWalletMetaMask() {
  if (!checkMetaMask()) return { connected: false };
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await switchToCeloNetwork();
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const wa = document.getElementById('walletAddress');
    const wi = document.getElementById('walletInfo');
    const btn = document.getElementById('connectWalletBtn');

    if (wa) wa.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
    wi?.classList.remove('hidden');
    if (btn) btn.style.display = 'none';

    return { connected: true, _provider: provider, _signer: signer, _address: address };
  } catch (error) {
    console.error("Bağlantı hatası:", error);
    alert("MetaMask bağlantısı başarısız.");
    return { connected: false };
  }
}

export function disconnectWallet() {
  document.getElementById('walletInfo')?.classList.add('hidden');
  const btn = document.getElementById('connectWalletBtn');
  if (btn) btn.style.display = 'inline-block';
  alert("🔌 Cüzdan bağlantısı kesildi.");
}

export async function checkCurrentNetwork(provider) {
  try {
    const network = await provider.getNetwork();
    const chainId = String(network.chainId);
    const networkInfo = document.getElementById('networkInfo');

    if (chainId === "42220") {
      if (networkInfo) { networkInfo.innerHTML = "🟢 Celo Mainnet"; networkInfo.style.color = "#35D07F"; }
      return true;
    } else if (chainId === "44787") {
      if (networkInfo) { networkInfo.innerHTML = "🟡 Celo Alfajores Testnet"; networkInfo.style.color = "#FBCC5C"; }
      return true;
    } else {
      if (networkInfo) { networkInfo.innerHTML = "🔴 Yanlış Ağ – Celo'ya geçin"; networkInfo.style.color = "#EF4444"; }
      return false;
    }
  } catch (error) {
    console.error("Ağ kontrol hatası:", error);
    return false;
  }
}
