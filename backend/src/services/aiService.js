const axios = require('axios');

async function generateSchedule({ constraints }) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY not set');
  }
  const prompt = [
    'You are an expert scheduling assistant.',
    'Return STRICT JSON ONLY that conforms to this TypeScript type:',
    'type Schedule = { assignments: { userId: string; shiftId: string; }[] }',
    'No prose, no markdown, only JSON.',
    `Constraints: ${JSON.stringify(constraints)}`
  ].join('\n');

  const resp = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      timeout: 30000
    }
  );

  const content = resp.data?.content?.[0]?.text || '{}';
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error('Claude returned invalid JSON');
  }
  if (!parsed || !Array.isArray(parsed.assignments)) {
    throw new Error('Claude JSON missing assignments');
  }
  return parsed;
}

module.exports = { generateSchedule };

