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
    const { messages, model, maxTokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    // Call Anthropic API with conversation history
    const message = await anthropic.messages.create({
      max_tokens: maxTokens || 1024,
      messages,
      model: model || 'claude-3-5-sonnet-latest',
    });

    // Return the response based on content type
    if (message.content[0].type === 'text') {
      return res.status(200).json({ text: message.content[0].text });
    } else {
      // Handle other content types
      return res.status(200).json({ content: message.content[0] });
    }
  } catch (error: any) {
    console.error('Error calling Anthropic API:', error);
    return res.status(500).json({ 
      error: 'Failed to call AI service', 
      message: error.message 
    });
  }
}
