// Vercel serverless function — uploads an image to Pics/ folder on GitHub

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  const { filename, base64 } = req.body;
  if (!filename || !base64) {
    return res.status(400).json({ error: 'Missing filename or base64' });
  }

  // Sanitise filename — only allow safe characters
  const safeName = filename.replace(/[^a-zA-Z0-9._\- ()]/g, '_');
  const filePath = `Pics/${safeName}`;

  const OWNER  = 'sanam0900';
  const REPO   = 'uma-churrasqueira';
  const BRANCH = 'main';

  try {
    // Check if file already exists (need its SHA to overwrite)
    let sha;
    const checkRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(filePath)}?ref=${BRANCH}`,
      { headers: { Authorization: `token ${token}`, 'User-Agent': 'uma-admin' } }
    );
    if (checkRes.ok) {
      const checkJson = await checkRes.json();
      sha = checkJson.sha;
    }

    const body = {
      message: `Upload image: ${safeName}`,
      content: base64,
      branch: BRANCH
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(filePath)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'uma-admin'
        },
        body: JSON.stringify(body)
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: err.message || 'Upload failed' });
    }

    return res.status(200).json({ ok: true, path: filePath });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
