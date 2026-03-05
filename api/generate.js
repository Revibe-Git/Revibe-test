export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, currentCode } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `You are a web developer for Revibe Health. Return ONLY raw HTML, no markdown, no explanation.`,
      messages: [{ role: 'user', content: `Current file:\n\n${currentCode}\n\n---\n\nChange request:\n${prompt}\n\nReturn complete updated file only.` }]
    })
  });

  const data = await response.json();
  const text = data.content.map(b => b.text || '').join('').trim().replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
  res.status(200).json({ result: text });
}
