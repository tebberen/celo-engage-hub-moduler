import { CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from '../utils/constants.js';

export class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.network = null;
  }

  async connectMetaMask() {
    if (!window.ethereum) {
      alert("🦊 MetaMask not found! Please install it first.");
      return false;
    }

    try {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = this.provider.getSigner();
      this.address = await this.signer.getAddress();

      const network = await this.provider.getNetwork();
      this.network = this.getNetworkInfoFromChainId(network.chainId);

      return true;
    } catch (error) {
      console.error("❌ MetaMask connection failed:", error);
      return false;
    }
  }

  getNetworkInfoFromChainId(chainId) {
    const id = Number(chainId);
    if (id === 42220) {
      return { name: CELO_MAINNET_PARAMS.chainName, color: "#FBCC5C" };
    } else if (id === 44787) {
      return { name: CELO_ALFAJORES_PARAMS.chainName, color: "#3BA55C" };
    } else {
      return { name: "Unknown Network", color: "red" };
    }
  }

  getShortAddress() {
    if (!this.address) return "";
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }

  getIsConnected() {
    return !!this.address;
  }

  getNetworkInfo() {
    return this.network || { name: "Disconnected", color: "gray" };
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.network = null;
  }
}
