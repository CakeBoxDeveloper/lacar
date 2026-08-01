module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token  = process.env.TG_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  // Перевірка змінних — якщо не задані, повертаємо зрозумілу помилку
  if (!token) {
    return res.status(500).json({ ok: false, error: 'TG_TOKEN not set in environment variables' });
  }
  if (!chatId) {
    return res.status(500).json({ ok: false, error: 'TG_CHAT_ID not set in environment variables' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { text } = body || {};
  if (!text) {
    return res.status(400).json({ ok: false, error: 'No text provided' });
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const data = await tgRes.json();
    // Якщо Telegram повернув помилку — логуємо деталі
    if (!data.ok) {
      return res.status(200).json({ ok: false, error: data.description, tg: data });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
