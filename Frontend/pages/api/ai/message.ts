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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'API configuration error', 
        message: 'OpenRouter API key is not configured'
      });
    }

    console.log(`Using API key: ${apiKey.substring(0, 5)}...`); // Log first few characters for debugging

    // Create headers for OpenRouter request
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://optiwise.app',
      'X-Title': 'OptiWise',
      'Content-Type': 'application/json',
    };

    console.log('Request headers:', JSON.stringify({
      'Authorization': `Bearer ${apiKey.substring(0, 5)}...`, // Show partial key for security
      'HTTP-Referer': headers['HTTP-Referer'],
      'X-Title': headers['X-Title'],
      'Content-Type': headers['Content-Type']
    }));

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens || 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error response (${response.status}):`, errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response:', JSON.stringify(data, null, 2));
    
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
