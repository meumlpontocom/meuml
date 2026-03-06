export function formatDate(date) {
  if (date === "null" || date === null || !date) return "Data indisponível";
  const dateObj = new Date(date + "T00:00:00");
  return new Intl.DateTimeFormat("pt-BR").format(dateObj);
}

export function sanitizeQuantityInput(e) {
  if (e.key === "." || e.key === "," || e.key === "e") {
    e.preventDefault();
    return;
  }
}
