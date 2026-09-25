export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  success?: boolean;
  message?: {
    role: string;
    content: string;
  };
  choices?: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  error?: string;
}

export async function sendContactMessage(payload: ContactPayload): Promise<ContactResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Contact API Error:', error);
    return {
      success: false,
      message: 'Unable to send your message. Please try again.',
    };
  }
}

export async function sendChatMessage(messages: ChatMessagePayload[]): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat API Error:', error);
    return {
      success: false,
      error: 'AI service is temporarily unavailable.',
    };
  }
}
