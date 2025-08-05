export const isMarketOpen = () => {
  const now = new Date();

  // Convert to IST (UTC + 5:30)
  const istOffset = 5.5 * 60; // in minutes
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + istOffset * 60000);

  const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = istTime.getHours();

  const isWeekday = day >= 0 && day <= 0; // Mon to Fri

  // Market open between 19:00 (7 PM) to 01:00 (next day)
  const isEvening = hours >= 19 && hours <= 23;
  const isLateNight = hours >= 0 && hours < 1;

  return isWeekday && (isEvening || isLateNight);
};

