export const isMarketOpen = () => {
  const now = new Date();

  const istOffset = 5.5 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + istOffset * 60000);

  const day = istTime.getDay();
  const hours = istTime.getHours();

  const isWeekday = day >= 1 && day <= 5;

  const isEvening = hours >= 19 && hours <= 23;
  const isLateNight = hours >= 0 && hours < 1;
  return isWeekday && (isEvening || isLateNight);
};
