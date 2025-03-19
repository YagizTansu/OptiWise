import Anthropic from '@anthropic-ai/sdk';

// Constants for supported Claude models
const CLAUDE_MODELS = {
  SONNET: 'claude-3-7-sonnet-20250219', // deprecated
  OPUS: 'claude-3-opus-20240229',     // deprecated
  SONNET_LATEST: 'claude-3-7-sonnet-20250219', // current recommended
  HAIKU_LATEST: 'claude-3-7-sonnet-20250219',   // current recommended
  OPUS_LATEST: 'claude-3-7-sonnet-20250219',     // current recommended
};

// Map deprecated models to their current versions
const MODEL_REPLACEMENTS = {
  [CLAUDE_MODELS.SONNET]: CLAUDE_MODELS.SONNET_LATEST,
  [CLAUDE_MODELS.OPUS]: CLAUDE_MODELS.OPUS_LATEST,
};

/**
 * Service for interacting with Anthropic's Claude AI models
 */
export class AIService {
  private client: Anthropic | null = null;
  private isServerSide: boolean;

  constructor(apiKey?: string) {
    // Check if we're running on the server or client
    this.isServerSide = typeof window === 'undefined';
    
    // Only instantiate Anthropic client on server-side
    if (this.isServerSide) {
      this.client = new Anthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * Ensures that a supported model is used, replacing deprecated models
   * with their current equivalents
   */
  private ensureSupportedModel(model: string): string {
    if (model in MODEL_REPLACEMENTS) {
      console.warn(`Model "${model}" is deprecated. Using "${MODEL_REPLACEMENTS[model]}" instead.`);
      return MODEL_REPLACEMENTS[model];
    }
    return model;
  }

  /**
   * Create a message with Claude and get a complete response
   */
  async createMessage(
    prompt: string, 
    model: string = CLAUDE_MODELS.SONNET_LATEST,
    maxTokens: number = 1024
  ): Promise<string> {
    // Ensure we're using a supported model
    const safeModel = this.ensureSupportedModel(model);
    
    if (this.isServerSide && this.client) {
      // Server-side: Use Anthropic client directly
      const message = await this.client.messages.create({
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
        model: safeModel,
      });
      
      if (message.content[0].type === 'text') {
        return message.content[0].text;
      } else {
        throw new Error('Unexpected non-text response from Claude API');
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
            model: safeModel,
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
   * Create a message stream with Claude for real-time responses
   */
  async createMessageStream(
    prompt: string,
    model: string = CLAUDE_MODELS.SONNET_LATEST,
    maxTokens: number = 1024
  ) {
    // Ensure we're using a supported model
    const safeModel = this.ensureSupportedModel(model);
    
    if (this.isServerSide && this.client) {
      // Server-side: Use Anthropic client directly
      return this.client.messages.create({
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
        model: safeModel,
        stream: true,
      });
    } else {
      // Client-side: Call backend API with streaming
      // This uses fetch with ReadableStream for streaming
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: safeModel,
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
    stream: any,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // For server-side Anthropic stream
    if (this.isServerSide && stream && typeof stream[Symbol.asyncIterator] === 'function') {
      let responseText = '';
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.text) {
          responseText += chunk.delta.text;
          if (onChunk) {
            onChunk(chunk.delta.text);
          }
        }
      }
      
      return responseText;
    } 
    // For client-side fetch API stream
    else if (!this.isServerSide && stream instanceof ReadableStream) {
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
   * Send a conversation history to Claude and get a response
   */
  async continueConversation(
    messages: Anthropic.MessageParam[],
    model: string = CLAUDE_MODELS.SONNET_LATEST,
    maxTokens: number = 1024
  ): Promise<string> {
    // Ensure we're using a supported model
    const safeModel = this.ensureSupportedModel(model);
    
    if (this.isServerSide && this.client) {
      // Server-side: Use Anthropic client directly
      const message = await this.client.messages.create({
        max_tokens: maxTokens,
        messages,
        model: safeModel,
      });
      
      if (message.content[0].type === 'text') {
        return message.content[0].text;
      } else {
        throw new Error('Unexpected non-text response from Claude API');
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
            model: safeModel,
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
