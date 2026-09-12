// Vercel serverless function — commits menu-data.json to GitHub
// Reads GITHUB_TOKEN from Vercel environment variables (never exposed to browser)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }

  const OWNER = 'sanam0900';
  const REPO  = 'uma-churrasqueira';
  const FILE  = 'menu-data.json';
  const BRANCH = 'main';

  try {
    // Get current file SHA (needed to update an existing file)
    const getRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${BRANCH}`,
      { headers: { Authorization: `token ${token}`, 'User-Agent': 'uma-admin' } }
    );
    const getJson = await getRes.json();
    const sha = getJson.sha;

    // Commit updated file
    const putRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'uma-admin'
        },
        body: JSON.stringify({
          message: 'Update menu via admin panel',
          content: Buffer.from(content).toString('base64'),
          sha,
          branch: BRANCH
        })
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: err.message || 'GitHub commit failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
