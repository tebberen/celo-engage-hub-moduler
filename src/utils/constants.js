// /src/utils/constants.js
export const CONTRACT_ADDRESS = "0x22eA49c074098931a478F381f971C77486d185b2";

export const CONTRACT_ABI = [
  // Mevcut fonksiyonlar
  "function registerUser(string _username) public",
  "function updateProfile(string _username) public",
  "function createProposal(string _title, string _description, uint256 _duration) public",
  "function voteProposal(uint256 _proposalId, bool _support) public",
  "function awardBadge(address _user, string _badge) public",
  "function getUserProfile(address _user) public view returns (string username, uint256 supportCount, uint256 reputation, uint256 badgeCount, bool isActive, uint256 timestamp)",
  "function getUserBadges(address _user) public view returns (string[] memory)",
  "function getActiveProposals() public view returns (uint256[] memory)",
  "function getProposalDetails(uint256 _proposalId) public view returns (uint256 id, string title, string description, address creator, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed)",
  "function totalUsers() public view returns (uint256)",
  "function proposalCount() public view returns (uint256)",
  "function getAllUsers() public view returns (address[] memory)",
  // 🔽 Opsiyonel: Eğer kontratta varsa direkt bunu kullanırız
  "function submitLink(string url) public",
  "event UserRegistered(address indexed user, string username)",
  "event ProposalCreated(uint256 indexed proposalId, string title, address creator)",
  "event Voted(uint256 indexed proposalId, address indexed voter, bool support)",
  "event BadgeAwarded(address indexed user, string badge)"
];

export const CELO_MAINNET_PARAMS = {
  chainId: "0xA4EC",
  chainName: "Celo Mainnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://forno.celo.org"],
  blockExplorerUrls: ["https://celoscan.io/"]
};

export const CELO_ALFAJORES_PARAMS = {
  chainId: "0xAEF3",
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"]
};
