// 🌞 GM / 🚀 Deploy / 🏛️ Governance buton işlevleri
document.addEventListener("DOMContentLoaded", () => {
  const gmBtn = document.querySelector('.gm-btn');
  const deployBtn = document.querySelector('.deploy-btn');
  const govBtn = document.querySelector('.gov-btn');
  const supportSection = document.getElementById('step1');
  const governanceSection = document.getElementById('governanceSection');

  gmBtn.addEventListener('click', () => {
    alert("🌞 GM! Have a great day builder!");
  });

  deployBtn.addEventListener('click', () => {
    alert("🚀 Deploy function coming soon!");
  });

  govBtn.addEventListener('click', () => {
    const isVisible = !governanceSection.classList.contains('hidden');
    if (isVisible) {
      governanceSection.classList.add('hidden');
      supportSection.classList.remove('hidden');
    } else {
      governanceSection.classList.remove('hidden');
      supportSection.classList.add('hidden');
      governanceSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
