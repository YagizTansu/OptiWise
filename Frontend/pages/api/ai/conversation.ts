import type { NextApiRequest, NextApiResponse } from 'next';

// Default model from OpenRouter
const DEFAULT_MODEL = 'microsoft/phi-4-reasoning-plus:free';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'API configuration error', 
        message: 'OpenRouter API key is not configured'
      });
    }

    // Create headers for OpenRouter request
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://optiwise.app',
      'X-Title': 'OptiWise',
      'Content-Type': 'application/json',
    };

    console.log('Making conversation request to OpenRouter API with model:', model || DEFAULT_MODEL);

    // Call OpenRouter API with conversation history
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: messages as Message[],
        max_tokens: maxTokens || 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error response (${response.status}):`, errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Return the response
    return res.status(200).json({ 
      text: data.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('Error calling OpenRouter API:', error);
    return res.status(500).json({ 
      error: 'Failed to call AI service', 
      message: error.message 
    });
  }
}
