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

    // Call Anthropic API
    const message = await anthropic.messages.create({
      max_tokens: maxTokens || 1024,
      messages: [{ role: 'user', content: prompt }],
      model: model || 'claude-3-5-sonnet-latest',
    });

    // Return the response
    // Filter for text blocks and extract the content
    const textContent = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');
    return res.status(200).json({ text: textContent });
  } catch (error: any) {
    console.error('Error calling Anthropic API:', error);
    return res.status(500).json({ 
      error: 'Failed to call AI service', 
      message: error.message 
    });
  }
}
