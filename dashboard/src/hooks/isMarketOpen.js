export const isMarketOpen = () => {
  const now = new Date();

  // Convert current time to US Eastern Time (ET)
  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = etTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();

  // US stock market hours (NYSE/NASDAQ): 9:30 AM – 4:00 PM ET
  const isWeekday = day >= 1 && day <= 5; // Monday–Friday
  const isMarketHours =
    (hours > 9 || (hours === 9 && minutes >= 30)) && hours < 16;

  return isWeekday && isMarketHours;
};
