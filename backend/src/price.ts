let cachedOKBPrice = 84;
let lastFetch = 0;

export async function getOKBPrice(): Promise<number> {
  const now = Date.now();
  if (now - lastFetch < 5 * 60 * 1000) return cachedOKBPrice;
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=okb&vs_currencies=usd");
    const data = await res.json();
    if (data?.okb?.usd) {
      cachedOKBPrice = data.okb.usd;
      lastFetch = now;
      console.log(`[price] OKB/USD: $${cachedOKBPrice}`);
    }
  } catch(e) {
    console.warn("[price] Failed to fetch OKB price, using cached $" + cachedOKBPrice);
  }
  return cachedOKBPrice;
}
