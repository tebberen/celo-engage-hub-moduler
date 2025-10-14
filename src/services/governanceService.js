// src/services/governanceService.js
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/constants.js";

/** Internal helper: returns a contract instance with provider/signer */
function getContract(providerOrSigner) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
}

/**
 * Read all active proposals from chain
 * Expects your contract to expose:
 *   - function getActiveProposals() public view returns (uint256[] memory)
 *   - function getProposalDetails(uint256 id) public view returns
 *       (uint256 id, string title, string description, address proposer,
 *        uint256 forVotes, uint256 againstVotes, uint256 deadline, bool active)
 */
export async function fetchActiveProposals(provider) {
  const contract = getContract(provider);
  const ids = await contract.getActiveProposals();
  const details = [];
  for (let id of ids) {
    const p = await contract.getProposalDetails(id);
    details.push({
      id: Number(p[0]),
      title: p[1],
      description: p[2],
      proposer: p[3],
      forVotes: Number(p[4]),
      againstVotes: Number(p[5]),
      deadline: Number(p[6]),
      active: Boolean(p[7]),
    });
  }
  return details;
}

/**
 * Create a new proposal (on-chain tx)
 * @param {ethers.Signer} signer - connected wallet signer
 * @param {string} title
 * @param {string} description
 * @param {number} durationDays - default 3 days
 */
export async function createProposal(signer, title, description, durationDays = 3) {
  if (!signer) throw new Error("Wallet not connected");
  const contract = getContract(signer);
  const seconds = 24 * 60 * 60;
  const duration = ethers.BigNumber.from(durationDays).mul(seconds);
  const tx = await contract.createProposal(title, description, duration);
  await tx.wait();
  return true;
}

/**
 * Vote on a proposal
 * @param {ethers.Signer} signer - connected wallet signer
 * @param {number} proposalId
 * @param {boolean} support - true: Support, false: Oppose
 */
export async function voteProposal(signer, proposalId, support) {
  if (!signer) throw new Error("Wallet not connected");
  const contract = getContract(signer);
  const tx = await contract.voteProposal(proposalId, support);
  await tx.wait();
  return true;
}
