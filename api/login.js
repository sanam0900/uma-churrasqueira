// Vercel serverless function — validates admin password server-side
// Password is stored in ADMIN_PASSWORD env var, never exposed to browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const correct = process.env.ADMIN_PASSWORD;

  if (!correct) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
  }

  if (password === correct) {
    return res.status(200).json({ ok: true });
  } else {
    // Small delay to slow down brute force attempts
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: 'Incorrect password' });
  }
}
