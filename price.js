// api/price.js — Busca preço real dos tokens via Jupiter Price API
// Rota: GET /api/price?tokens=SOL,BTC,ETH

// Endereços dos tokens na rede Solana
const TOKEN_MINTS = {
  SOL:  'So11111111111111111111111111111111111111112',
  BTC:  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // wBTC (Sollet)
  ETH:  '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk', // wETH (Sollet)
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const tokens = (req.query.tokens || 'SOL,BTC,ETH').split(',');
  const ids = tokens.map(t => TOKEN_MINTS[t]).filter(Boolean).join(',');

  try {
    const url = `https://price.jup.ag/v6/price?ids=${ids}&vsToken=${TOKEN_MINTS.USDC}`;
    const response = await fetch(url);
    const raw = await response.json();

    const result = {};
    tokens.forEach(t => {
      const mint = TOKEN_MINTS[t];
      if (mint && raw.data?.[mint]) {
        result[t] = {
          preco: raw.data[mint].price,
          mint,
        };
      }
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar preços: ' + err.message });
  }
}
