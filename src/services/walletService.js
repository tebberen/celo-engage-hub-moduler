import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from '../utils/constants.js';

export class WalletService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.userAddress = '';
        this.isConnected = false;
        this.walletConnectProvider = null;
        this.currentChainId = null;
    }

    // MetaMask bağlantısı
    async connectMetaMask() {
        if (!this.checkMetaMask()) return false;
        
        try {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            await this.switchToCeloNetwork();
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();
            this.isConnected = true;
            
            await this.checkCurrentNetwork();
            return true;
        } catch (error) {
            console.error("MetaMask connection error:", error);
            return false;
        }
    }

    // WalletConnect bağlantısı
    async connectWalletConnect() {
        try {
            const projectId = "8b020ffbb31e5aba14160c27ca26540b";
            
            this.walletConnectProvider = new WalletConnectProvider({
                rpc: {
                    42220: "https://forno.celo.org",
                    44787: "https://alfajores-forno.celo-testnet.org"
                },
                chainId: 42220,
                qrcodeModalOptions: {
                    mobileLinks: [
                        "metamask",
                        "trust",
                        "rainbow",
                        "argent",
                        "imtoken",
                        "pillar"
                    ]
                }
            });

            await this.walletConnectProvider.enable();
            this.provider = new ethers.providers.Web3Provider(this.walletConnectProvider);
            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();
            this.isConnected = true;

            await this.checkCurrentNetwork();

            // Event listeners for WalletConnect
            this.walletConnectProvider.on("accountsChanged", this.handleAccountsChanged.bind(this));
            this.walletConnectProvider.on("chainChanged", this.handleChainChanged.bind(this));
            this.walletConnectProvider.on("disconnect", this.handleDisconnect.bind(this));

            return true;
        } catch (error) {
            console.error("WalletConnect connection error:", error);
            return false;
        }
    }

    // Ağ değiştirme
    async switchToCeloNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CELO_MAINNET_PARAMS.chainId }],
            });
            return true;
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [CELO_MAINNET_PARAMS],
                    });
                    return true;
                } catch (addError) {
                    console.error("Error adding Celo network:", addError);
                    return false;
                }
            }
            console.error("Error switching to Celo:", switchError);
            return false;
        }
    }

    // Mevcut ağı kontrol et
    async checkCurrentNetwork() {
        if (!this.provider) return false;
        
        try {
            const network = await this.provider.getNetwork();
            this.currentChainId = network.chainId.toString();
            return (this.currentChainId === "42220" || this.currentChainId === "44787");
        } catch (error) {
            console.error("Error checking network:", error);
            return false;
        }
    }

    // Bağlantıyı kes
    async disconnect() {
        try {
            if (this.walletConnectProvider) {
                await this.walletConnectProvider.disconnect();
            }
        } catch (error) {
            console.error("Error disconnecting:", error);
        } finally {
            this.provider = null;
            this.signer = null;
            this.userAddress = '';
            this.isConnected = false;
            this.walletConnectProvider = null;
        }
    }

    // MetaMask kontrolü
    checkMetaMask() {
        return typeof window.ethereum !== 'undefined';
    }

    // Event handlers
    handleAccountsChanged(accounts) {
        if (!accounts || accounts.length === 0) {
            this.disconnect();
        } else {
            window.location.reload();
        }
    }

    handleChainChanged(chainId) {
        window.location.reload();
    }

    handleDisconnect() {
        this.disconnect();
    }

    // Getter methods
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
        return `${this.userAddress.substring(0, 6)}...${this.userAddress.substring(this.userAddress.length - 4)}`;
    }

    getNetworkInfo() {
        if (this.currentChainId === "42220") return { name: "Celo Mainnet", color: "#35D07F" };
        if (this.currentChainId === "44787") return { name: "Celo Alfajores", color: "#35D07F" };
        return { name: "Wrong Network", color: "#EF4444" };
    }
}
