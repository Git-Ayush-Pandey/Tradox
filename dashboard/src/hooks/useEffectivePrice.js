import { isMarketOpen } from "./isMarketOpen";
import { getQuote } from "./api";

export const getEffectivePrice = async ({ symbol, livePrices, fallback }) => {
  if (isMarketOpen()) {
    const live = livePrices[symbol];
    if (live) return { price: live, isLive: true };
  }

  // Fallback to API
  try {
    const res = await getQuote(symbol);
    const price = res?.data?.c ?? fallback;
    return { price, isLive: false };
  } catch (err) {
    console.error(`❌ getQuote failed for ${symbol}`, err);
    return { price: fallback, isLive: false };
  }
};
