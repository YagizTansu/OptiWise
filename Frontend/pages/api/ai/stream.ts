import type { NextApiRequest, NextApiResponse } from 'next';

// Default model from OpenRouter
const DEFAULT_MODEL = 'microsoft/phi-4-reasoning-plus:free';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model, maxTokens } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY environment variable is not set');
      res.write(`data: ${JSON.stringify({ 
        error: 'API configuration error: OpenRouter API key is not configured'
      })}\n\n`);
      res.end();
      return;
    }

    // Create headers for OpenRouter request
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://optiwise.app',
      'X-Title': 'OptiWise',
      'Content-Type': 'application/json',
    };

    console.log('Starting stream request to OpenRouter API with model:', model || DEFAULT_MODEL);

    // Create a streaming request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens || 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error response (${response.status}):`, errorText);
      res.write(`data: ${JSON.stringify({ 
        error: `OpenRouter API error: ${response.status} ${errorText}`
      })}\n\n`);
      res.end();
      return;
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Stream the response from OpenRouter
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE format
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Forward DONE marker
              res.write('data: [DONE]\n\n');
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                // Send each text chunk as an SSE event in our expected format
                res.write(`data: ${JSON.stringify({ text: parsed.choices[0].delta.content })}\n\n`);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (error: any) {
    console.error('Error in AI stream:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
