export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { token, preco, rsi, var24 } = req.body || {};
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'Chave nao configurada' });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, messages: [{ role: 'user', content: 'Analise ' + token + '/USDC preco $' + preco + ' RSI ' + rsi + ' variacao ' + var24 + '%. Responda em 3 frases e termine com COMPRAR, VENDER ou AGUARDAR. Em portugues.' }] })
  });

  const d = await r.json();
  const texto = d.content?.[0]?.text || 'Erro';
  let sinal = 'hold';
  if (/comprar|alta/i.test(texto)) sinal = 'buy';
  else if (/vender|baixa/i.test(texto)) sinal = 'sell';
  return res.status(200).json({ analise: texto, sinal });
}
