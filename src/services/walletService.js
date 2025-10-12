import { CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "../utils/constants.js";

// 🔹 MetaMask kurulu mu kontrol et
export function checkMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    alert("⚠️ MetaMask not detected. Please install MetaMask first.");
    return false;
  }
  return true;
}

// 🔹 Celo ağına geçiş
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
    console.error("Error switching to Celo network:", switchError);
    alert("⚠️ Please manually switch to Celo Mainnet from MetaMask.");
    return false;
  }
}

// 🔹 MetaMask bağlantısı kur
export async function connectWalletMetaMask() {
  if (!checkMetaMask()) return { connected: false };
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await switchToCeloNetwork();
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    document.getElementById('walletAddress').textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    document.getElementById('walletInfo').classList.remove('hidden');
    document.getElementById('connectWalletBtn').style.display = 'none';

    return { connected: true, _provider: provider, _signer: signer, _address: address };
  } catch (error) {
    console.error("❌ Connection error:", error);
    alert("MetaMask connection failed. Please try again.");
    return { connected: false };
  }
}

// 🔹 Cüzdan bağlantısını kes
export function disconnectWallet() {
  document.getElementById('walletInfo').classList.add('hidden');
  document.getElementById('connectWalletBtn').style.display = 'inline-block';
  alert("🔌 Wallet disconnected.");
}

// 🔹 Geçerli ağ kontrolü
export async function checkCurrentNetwork(provider) {
  try {
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();
    const networkInfo = document.getElementById('networkInfo');

    if (chainId === "42220") {
      networkInfo.innerHTML = "🟢 Celo Mainnet";
      networkInfo.style.color = "#35D07F";
      return true;
    } else if (chainId === "44787") {
      networkInfo.innerHTML = "🟡 Celo Alfajores Testnet";
      networkInfo.style.color = "#FBCC5C";
      return true;
    } else {
      networkInfo.innerHTML = "🔴 Wrong Network – Switch to Celo";
      networkInfo.style.color = "#EF4444";
      return false;
    }
  } catch (error) {
    console.error("Network check error:", error);
    return false;
  }
}
