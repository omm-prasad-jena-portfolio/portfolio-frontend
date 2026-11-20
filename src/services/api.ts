export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD ? 'https://portfolio-backend-yrzq.onrender.com' : 'http://localhost:8000')
).replace(/\/$/, '');


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

export interface PrivateUnlockResponse {
  success: boolean;
  authenticated: boolean;
  message?: string;
}

export interface PrivateSessionResponse {
  authenticated: boolean;
}

export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data.csrftoken || null;
  } catch (error) {
    console.error('CSRF Fetch Error:', error);
    return null;
  }
}

export async function unlockPrivate(pin: string): Promise<PrivateUnlockResponse> {
  try {
    const csrfToken = await fetchCsrfToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/api/private/unlock/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Private Unlock API Error:', error);
    return {
      success: false,
      authenticated: false,
      message: 'Unable to verify PIN. Please try again.',
    };
  }
}


export async function checkPrivateSession(): Promise<PrivateSessionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/private/session/`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Private Session API Error:', error);
    return { authenticated: false };
  }
}

export async function logoutPrivate(): Promise<PrivateUnlockResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/private/logout/`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Private Logout API Error:', error);
    return { success: false, authenticated: false };
  }
}

