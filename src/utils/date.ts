export const getFutureDate = (startDay: string | Date, days: number) => {
const curr = new Date(startDay);
  curr.setDate(curr.getDate() + days);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(curr)
    .replace(',', '');
};