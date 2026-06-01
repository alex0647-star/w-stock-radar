document.addEventListener("click", (event) => {
  if (event.target.closest("button, a, input, select, label")) return;

  const card = event.target.closest(".stock-card");
  if (!card) return;

  const explicitCode = card.dataset.stockCode || card.dataset.cardCode;
  const titleText = card.querySelector("h3")?.textContent || "";
  const inferredCode = titleText.match(/\b\d{4}\b/)?.[0];
  const code = explicitCode || inferredCode;

  if (code) {
    window.location.href = `/stock/${code}`;
  }
});
