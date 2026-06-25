// NOTE: Market hours check uses US Eastern Time (NYSE/NASDAQ: 9:30–16:00 ET).
// The Tradox UI uses INR formatting (₹) and NSE-themed terminology.
// For NSE market hours: 9:15–15:30 IST, change timeZone to "Asia/Kolkata"
// and update the isMarketHours check to: hours > 9 || (hours === 9 && minutes >= 15)
// and hours < 15 || (hours === 15 && minutes < 30)
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
