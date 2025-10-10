// ✅ src/utils/constants.js

// Akıllı kontrat adresi
export const CONTRACT_ADDRESS = "0x22eA49c074098931a478F381f971C77486d185b2";

// Akıllı kontrat ABI'si
export const CONTRACT_ABI = [
  "function registerUser(string memory _username) public",
  "function updateProfile(string memory _username) public",
  "function createProposal(string memory _title, string memory _description, uint256 _duration) public",
  "function voteProposal(uint256 _proposalId, bool _support) public",
  "function awardBadge(address _user, string memory _badge) public",
  "function getUserProfile(address _user) public view returns (string memory username, uint256 supportCount, uint256 reputation, uint256 badgeCount, bool isActive, uint256 timestamp)",
  "function getUserBadges(address _user) public view returns (string[] memory)",
  "function getActiveProposals() public view returns (uint256[] memory)",
  "function getProposalDetails(uint256 _proposalId) public view returns (uint256 id, string memory title, string memory description, address creator, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed)",
  "function totalUsers() public view returns (uint256)",
  "function proposalCount() public view returns (uint256)",
  "function getAllUsers() public view returns (address[] memory)",
  "event UserRegistered(address indexed user, string username)",
  "event ProposalCreated(uint256 indexed proposalId, string title, address creator)",
  "event Voted(uint256 indexed proposalId, address indexed voter, bool support)",
  "event BadgeAwarded(address indexed user, string badge)",
  "error AlreadyRegistered()",
  "error UserNotActive()",
  "error InvalidProposal()",
  "error NotOwner()",
  "error VotingEnded()",
  "error AlreadyVoted()"
];

// ✅ CELO Ağ Parametreleri
export const CELO_MAINNET_PARAMS = {
  chainId: "0xA4EC", // 42220
  chainName: "Celo Mainnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://forno.celo.org"],
  blockExplorerUrls: ["https://celoscan.io/"]
};

export const CELO_ALFAJORES_PARAMS = {
  chainId: "0xAEF3", // 44787
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"]
};

// ✅ Başlangıçta gösterilecek örnek destek linkleri
export const initialSupportLinks = [
  "https://farcaster.xyz/teberen/0x391c5713",
  "https://farcaster.xyz/ertu",
  "https://farcaster.xyz/ratmubaba",
  "https://x.com/erturulsezar13?s=21",
  "https://x.com/egldmvx?s=21",
  "https://tebberen.github.io/celo-engage-hub/",
  "https://x.com/meelioodas?s=21",
  "https://x.com/luckyfromnecef/status/1972371920290259437?s=46",
  "https://github.com/tebberen"
];
