// Voice API service for backend communication
const API_BASE_URL = 'http://localhost:8000';

export interface STTTokenResponse {
  token: string;
  ws_url: string;
  session_id: string;
  expires_in: number;
  config: {
    sample_rate: number;
    audio_format: string;
    commit_strategy: string;
  };
}

export interface TTSTokenResponse {
  token: string;
  ws_url: string;
  voice_id: string;
  voice_type: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    speed: number;
  };
  session_id: string;
  expires_in: number;
}

export interface VoiceAgentResponse {
  agent_message: string;
  case_created: boolean;
  case_id: number | null;
  session_id: string;
  turn_count: number;
  information_collected: {
    description: string | null;
    location: { lat: number; lng: number } | null;
    people_count: number | null;
    mobility_status: string | null;
  };
}

export const voiceApi = {
  /**
   * Generate STT token for WebSocket connection
   */
  async getSTTToken(sessionId: string, languageCode: string = 'en'): Promise<STTTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/api/voice/stt/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        language_code: languageCode
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get STT token: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Generate TTS token for WebSocket connection
   */
  async getTTSToken(
    sessionId: string,
    voiceType?: string,
    urgency?: string,
    role?: string
  ): Promise<TTSTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/api/voice/tts/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        voice_type: voiceType,
        urgency: urgency || 'high',
        role: role || 'caller'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get TTS token: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Process user message through voice agent
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    location: { lat: number; lng: number } | null,
    startNewSession: boolean = false
  ): Promise<VoiceAgentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/voice/agent/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        user_message: userMessage,
        location: location,
        start_new_session: startNewSession
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to process message: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get session information
   */
  async getSession(sessionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/voice/agent/session/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * End voice session
   */
  async endSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/voice/agent/session/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to end session: ${response.statusText}`);
    }
  },

  /**
   * Check voice API health
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/voice/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
};
