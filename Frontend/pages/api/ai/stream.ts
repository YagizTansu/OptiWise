import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // Create a streaming request to Anthropic
    const stream = await anthropic.messages.create({
      max_tokens: maxTokens || 1024,
      messages: [{ role: 'user', content: prompt }],
      model: model || 'claude-3-5-sonnet-latest',
      stream: true,
    });

    // Stream the response
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && 'text' in chunk.delta && chunk.delta.text) {
        // Send each text chunk as an SSE event
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    // Signal the end of the stream
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in AI stream:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
