export default function dateTimeFormat(date) {
  const config = {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }
  return new Date(date).toLocaleDateString("pt-BR", config);
}
