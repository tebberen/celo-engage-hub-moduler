import { ethers } from 'ethers';
import EthereumProvider from "@walletconnect/ethereum-provider";
import { CELO_MAINNET_PARAMS } from '../utils/constants.js';

export class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.userAddress = '';
    this.isConnected = false;
    this.wcProvider = null;
    this.currentChainId = null;
  }

  // ✅ MetaMask bağlantısı
  async connectMetaMask() {
    if (!this.checkMetaMask()) {
      alert("MetaMask bulunamadı. Lütfen yükleyin.");
      return false;
    }
    try {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.switchToCeloNetwork();
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.signer = this.provider.getSigner();
      this.userAddress = await this.signer.getAddress();
      this.isConnected = true;
      await this.checkCurrentNetwork();
      return true;
    } catch (err) {
      console.error("MetaMask connection error:", err);
      return false;
    }
  }

  // ✅ WalletConnect v2 bağlantısı
  async connectWalletConnect() {
    try {
      this.wcProvider = await EthereumProvider.init({
        projectId: "8b020ffbb31e5aba14160c27ca26540b",
        chains: [42220],
        optionalChains: [44787],
        showQrModal: true,
        methods: [
          "eth_sendTransaction",
          "personal_sign",
          "eth_signTransaction",
          "eth_signTypedData"
        ],
        events: ["chainChanged", "accountsChanged", "disconnect"]
      });

      await this.wcProvider.connect();
      this.provider = new ethers.providers.Web3Provider(this.wcProvider);
      this.signer = this.provider.getSigner();
      this.userAddress = await this.signer.getAddress();
      this.isConnected = true;

      // Event listeners
      this.wcProvider.on("accountsChanged", this.handleAccountsChanged.bind(this));
      this.wcProvider.on("chainChanged", this.handleChainChanged.bind(this));
      this.wcProvider.on("disconnect", this.handleDisconnect.bind(this));

      await this.checkCurrentNetwork();
      return true;
    } catch (err) {
      console.error("WalletConnect v2 connection error:", err);
      alert("WalletConnect bağlantısı başarısız: " + err.message);
      return false;
    }
  }

  // ✅ Celo ağına geçiş
  async switchToCeloNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CELO_MAINNET_PARAMS.chainId }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [CELO_MAINNET_PARAMS],
          });
          return true;
        } catch (addError) {
          console.error("Celo ağı eklenemedi:", addError);
          return false;
        }
      }
      console.error("Ağ değiştirme hatası:", switchError);
      return false;
    }
  }

  // ✅ Mevcut ağı kontrol et
  async checkCurrentNetwork() {
    if (!this.provider) return false;
    try {
      const network = await this.provider.getNetwork();
      this.currentChainId = network.chainId.toString();
      return this.currentChainId === "42220" || this.currentChainId === "44787";
    } catch (err) {
      console.error("Network kontrol hatası:", err);
      return false;
    }
  }

  // ✅ Bağlantıyı kes
  async disconnect() {
    try {
      if (this.wcProvider) {
        await this.wcProvider.disconnect();
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    } finally {
      this.provider = null;
      this.signer = null;
      this.userAddress = '';
      this.isConnected = false;
      this.wcProvider = null;
    }
  }

  // ✅ MetaMask kontrolü
  checkMetaMask() {
    return typeof window.ethereum !== 'undefined';
  }

  // ✅ Event handlers
  handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) {
      this.disconnect();
    } else {
      window.location.reload();
    }
  }

  handleChainChanged() {
    window.location.reload();
  }

  handleDisconnect() {
    this.disconnect();
  }

  // ✅ Getter fonksiyonları
  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  getUserAddress() {
    return this.userAddress;
  }

  getIsConnected() {
    return this.isConnected;
  }

  getShortAddress() {
    if (!this.userAddress) return '';
    return `${this.userAddress.substring(0, 6)}...${this.userAddress.slice(-4)}`;
  }

  getNetworkInfo() {
    if (this.currentChainId === "42220") return { name: "Celo Mainnet", color: "#35D07F" };
    if (this.currentChainId === "44787") return { name: "Celo Alfajores", color: "#35D07F" };
    return { name: "Wrong Network", color: "#EF4444" };
  }
}
