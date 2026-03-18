// api/swap.js — Monta a transação de swap via Jupiter DEX
// Rota: POST /api/swap
// Body: { quoteResponse, userPublicKey }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { quoteResponse, userPublicKey } = req.body;

  if (!quoteResponse || !userPublicKey) {
    return res.status(400).json({ error: 'quoteResponse e userPublicKey são obrigatórios' });
  }

  try {
    const response = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    // Retorna a transação serializada para o frontend assinar com a Phantom
    return res.status(200).json({ swapTransaction: data.swapTransaction });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao montar swap: ' + err.message });
  }
}
