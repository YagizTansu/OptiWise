// Constants for supported OpenRouter models
const OPENROUTER_MODELS = {
  DEFAULT: 'microsoft/phi-4-reasoning-plus:free',
};

/**
 * Message type for OpenRouter API
 */
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

/**
 * Service for interacting with OpenRouter AI models
 */
export class AIService {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY;
  }

  /**
   * Get headers for OpenRouter API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a message with AI and get a complete response
   */
  async createMessage(
    prompt: string, 
    maxTokens: number = 1024
  ): Promise<string> {
    if (this.apiKey) {
      // Server-side: Call OpenRouter API directly
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            model: OPENROUTER_MODELS.DEFAULT,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`OpenRouter API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        throw error;
      }
    } else {
      // Client-side: Call backend API
      try {
        const response = await fetch('/api/ai/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            model: OPENROUTER_MODELS.DEFAULT,
            maxTokens,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`AI request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.text;
      } catch (error) {
        console.error('Error calling AI API:', error);
        throw error;
      }
    }
  }

  /**
   * Create a message stream with OpenRouter for real-time responses
   */
  async createMessageStream(
    prompt: string,
    maxTokens: number = 1024
  ) {
    if (this.apiKey) {
      // Server-side: Call OpenRouter API directly with streaming
      try {
        return fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            model: OPENROUTER_MODELS.DEFAULT,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            stream: true,
          }),
        });
      } catch (error) {
        console.error('Error creating OpenRouter stream:', error);
        throw error;
      }
    } else {
      // Client-side: Call backend API with streaming
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: OPENROUTER_MODELS.DEFAULT,
          maxTokens,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`AI streaming request failed with status ${response.status}`);
      }

      return response.body;
    }
  }

  /**
   * Process a message stream and collect the complete response
   */
  async processMessageStream(
    stream: Response | ReadableStream<Uint8Array>,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // For server-side OpenRouter stream
    if (stream instanceof Response) {
      if (!stream.body) {
        throw new Error('Stream body is null');
      }

      const reader = stream.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';
      
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
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0]?.delta?.content) {
                  const textChunk = parsed.choices[0].delta.content;
                  responseText += textChunk;
                  if (onChunk) {
                    onChunk(textChunk);
                  }
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
        
        return responseText;
      } finally {
        reader.releaseLock();
      }
    } 
    // For client-side fetch API stream
    else if (stream instanceof ReadableStream) {
      let responseText = '';
      const reader = stream.getReader();
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
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  responseText += parsed.text;
                  if (onChunk) {
                    onChunk(parsed.text);
                  }
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
        
        return responseText;
      } finally {
        reader.releaseLock();
      }
    }
    
    throw new Error('Invalid stream provided to processMessageStream');
  }

  /**
   * Send a conversation history to AI and get a response
   */
  async continueConversation(
    messages: Message[],
    model: string = OPENROUTER_MODELS.DEFAULT,
    maxTokens: number = 1024
  ): Promise<string> {
    if (this.apiKey) {
      // Server-side: Call OpenRouter API directly
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            model: model,
            messages,
            max_tokens: maxTokens,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`OpenRouter API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        throw error;
      }
    } else {
      // Client-side: Call backend API
      try {
        const response = await fetch('/api/ai/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            model: model,
            maxTokens,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`AI conversation request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.text;
      } catch (error) {
        console.error('Error calling AI conversation API:', error);
        throw error;
      }
    }
  }
}

// Create and export a default instance
export const aiService = new AIService();

// Export as default
export default aiService;
