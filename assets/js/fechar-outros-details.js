const detailsList = document.querySelectorAll("details");

function handleDetailToggle(event) {
  if (!event.target.open) return;

  const current = event.target;
  const parent = current.parentElement;

  // Seleciona todos os <details> que estão no mesmo nível (irmãos)
  const siblingDetails = Array.from(parent.children).filter(
    (el) => el.tagName.toLowerCase() === "details" && el !== current
  );

  // Fecha os irmãos
  siblingDetails.forEach((details) => {
    details.open = false;
  });
}

// Adiciona o listener para todos os <details>
detailsList.forEach((details) => {
  details.addEventListener("toggle", handleDetailToggle);
});