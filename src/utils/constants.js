// ✅ Akıllı kontrat adresi (Celo Engage Hub)
export const CONTRACT_ADDRESS = "0x22eA49c074098931a478F381f971C77486d185b2";

// ✅ ABI (Application Binary Interface)
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

// ✅ Celo Mainnet bilgileri
export const CELO_MAINNET_PARAMS = {
  chainId: "0xA4EC",
  chainName: "Celo Mainnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://forno.celo.org"],
  blockExplorerUrls: ["https://celoscan.io/"]
};

// ✅ Celo Alfajores Testnet bilgileri
export const CELO_ALFAJORES_PARAMS = {
  chainId: "0xAEF3",
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"]
};
