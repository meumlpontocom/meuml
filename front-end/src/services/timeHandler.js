export default async function timeConstructor(params) {
  try {
    const date = new Date(params);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDate();
    const dayOfTheWeek = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    return {
      dia: day,
      ano: year,
      mes: month + 1,
      horas: hours,
      minutos: minutes,
      diasDaSemana: dayOfTheWeek,
    };
  } catch (error) {
    return error;
  }
}
