export const isMarketOpen = () => {
  const now = new Date();

  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = etTime.getDay();
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();

  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours =
    (hours > 9 || (hours === 9 && minutes >= 30)) && hours < 16;

  return isWeekday && isMarketHours;
};
