import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/constants.js";

function getContract(providerOrSigner) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
}

// Main function to send link on chain
export async function submitLinkOnChain(provider, signer, url) {
  const contract = getContract(signer);
  const sender = await signer.getAddress();

  try {
    // Try to call submitLink() if contract supports it
    if (contract.interface.functions["submitLink(string)"]) {
      const tx = await contract.submitLink(url, { gasLimit: 250000 });
      const receipt = await tx.wait();
      return receipt.transactionHash;
    }
  } catch (err) {
    console.warn("submitLink() not found, sending raw tx instead.");
  }

  // Fallback: send 0 CELO tx with data
  const tx = await signer.sendTransaction({
    to: sender,
    value: 0,
    data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(url)),
  });

  const receipt = await tx.wait();
  return receipt.transactionHash;
}
