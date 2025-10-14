import { displayGovernanceProposals } from "../../main.js";

let proposals = [];

export function initGovernance() {
  const btn = document.getElementById("createProposalBtn");
  if (!btn) return;
  btn.onclick = createProposal;
  renderProposals();
}

function createProposal() {
  const title = document.getElementById("proposalTitle").value.trim();
  const desc = document.getElementById("proposalDescription").value.trim();
  if (!title || !desc) {
    alert("Please fill in all fields!");
    return;
  }

  const newProposal = { id: Date.now().toString(), title, description: desc };
  proposals.push(newProposal);
  localStorage.setItem("governanceProposals", JSON.stringify(proposals));
  renderProposals();
}

function renderProposals() {
  const stored = JSON.parse(localStorage.getItem("governanceProposals")) || [];
  proposals = stored;
  displayGovernanceProposals(proposals);
}

window.voteForProposal = function (id) {
  alert(`✅ You voted for proposal #${id}`);
};
