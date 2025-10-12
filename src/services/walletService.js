// ethers global: window.ethers
const { ethers } = window;
import { CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from '../utils/constants.js';

export class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.userAddress = '';
    this.isConnected = false;
    this.currentChainId = null;
  }

  async connectMetaMask() {
    if (typeof window.ethereum === 'undefined') {
      alert("MetaMask bulunamadı. Lütfen eklentiyi kurun.");
      return false;
    }
    try {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await this.switchToCeloNetwork();
      this.signer = this.provider.getSigner();
      this.userAddress = await this.signer.getAddress();
      this.isConnected = true;
      await this.checkCurrentNetwork();
      return true;
    } catch (e) {
      console.error("MetaMask connection error:", e);
      return false;
    }
  }

  // WalletConnect yok (bilerek)
  async connectWalletConnect() {
    alert("WalletConnect geçici olarak devre dışı.");
    return false;
  }

  async switchToCeloNetwork() {
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
      console.error("switchToCeloNetwork error:", switchError);
      return false;
    }
  }

  async checkCurrentNetwork() {
    if (!this.provider) return false;
    try {
      const network = await this.provider.getNetwork();
      this.currentChainId = network.chainId.toString();
      return (this.currentChainId === "42220" || this.currentChainId === "44787");
    } catch (e) {
      console.error("checkCurrentNetwork error:", e);
      return false;
    }
  }

  async disconnect() {
    this.provider = null;
    this.signer = null;
    this.userAddress = '';
    this.isConnected = false;
  }

  // getters
  getProvider() { return this.provider; }
  getSigner() { return this.signer; }
  getUserAddress() { return this.userAddress; }
  getIsConnected() { return this.isConnected; }

  getShortAddress() {
    const a = this.userAddress || '';
    return a ? `${a.slice(0,6)}...${a.slice(-4)}` : '';
    }

  getNetworkInfo() {
    if (this.currentChainId === "42220") return { name: "Celo Mainnet", color: "#35D07F" };
    if (this.currentChainId === "44787") return { name: "Celo Alfajores", color: "#35D07F" };
    return { name: "Wrong Network", color: "#EF4444" };
  }
}
