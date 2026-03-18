// api/quote.js — Busca cotação real do Jupiter DEX
// Rota: GET /api/quote?inputMint=...&outputMint=...&amount=...

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { inputMint, outputMint, amount, slippageBps } = req.query;

  if (!inputMint || !outputMint || !amount) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: inputMint, outputMint, amount' });
  }

  try {
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps || 50}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar cotação: ' + err.message });
  }
}
