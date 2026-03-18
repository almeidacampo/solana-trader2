export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  const { token, preco, var24, rsi, ema9, ema21, vol, balance } = req.body;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Chave da API nao configurada' });
  }

  const prompt = `Voce e um trader experiente analisando ${token}/USDC. Preco: $${Number(preco).toFixed(2)}, Variacao 24h: ${Number(var24).toFixed(2)}%, RSI: ${rsi}, EMA9: $${Number(ema9).toFixed(2)}, EMA21: $${Number(ema21).toFixed(2)}, Volume: ${vol}%, Saldo: ${balance}. Analise em 3 frases e termine com COMPRAR, VENDER ou AGUARDAR. Responda em portugues.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const texto = data.content?.[0]?.text;
    if (!texto) return res.status(500).json({ error: 'Resposta invalida da IA' });

    let sinal = 'hold';
    if (/comprar|compra|long|subir|alta/i.test(texto)) sinal = 'buy';
    else if (/vender|venda|short|cair|baixa/i.test(texto)) sinal = 'sell';

    return res.status(200).json({ analise: texto, sinal });
  } catch (err) {
    return res.status(500).json({ error: 'Erro na IA: ' + err.message });
  }
}
