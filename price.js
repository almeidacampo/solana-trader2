export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const ids = 'solana,bitcoin,ethereum';
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json({
      SOL: { preco: data.solana?.usd || 142 },
      BTC: { preco: data.bitcoin?.usd || 84200 },
      ETH: { preco: data.ethereum?.usd || 3150 },
    });
  } catch (err) {
    return res.status(200).json({
      SOL: { preco: 142 },
      BTC: { preco: 84200 },
      ETH: { preco: 3150 },
    });
  }
}
