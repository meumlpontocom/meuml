const parseDate = (date) => {
  const dateConfig = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const timeZone = "-03:00";
  const dateToBeParsed = date + timeZone;
  return new Date(dateToBeParsed).toLocaleDateString("pt-BR", dateConfig);
};

export default parseDate;
