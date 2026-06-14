require('dotenv').config();
const express = require('express');
const path    = require('path');
const axios   = require('axios');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Serve static frontend files ─────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── AI Summary proxy endpoint ───────────────────────────
// POST /api/summary  { repoName, repoDesc, repoLang }
app.post('/api/summary', async (req, res) => {
    const { repoName, repoDesc, repoLang } = req.body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured on server.' });
    }

    try {
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-sonnet-4-5',
                max_tokens: 500,
                system: 'You are a technical writer creating concise project summaries. Respond ONLY with valid JSON: {"summary":"...","tags":["tag1","tag2","tag3"]}',
                messages: [{
                    role: 'user',
                    content: `Repository: ${repoName}\nDescription: ${repoDesc || 'No description'}\nPrimary Language: ${repoLang || 'Unknown'}`
                }]
            },
            {
                headers: {
                    'Content-Type':      'application/json',
                    'x-api-key':         apiKey,
                    'anthropic-version': '2023-06-01'
                }
            }
        );

        const text = response.data.content?.find(b => b.type === 'text')?.text || '{}';
        const parsed = JSON.parse(text.replace(/```json?|```/g, '').trim());
        res.json(parsed);
    } catch (err) {
        console.error('Anthropic API error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch AI summary.' });
    }
});

// ── Fallback: serve index.html for any unmatched route ──
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Portfolio server running at http://localhost:${PORT}`);
});
