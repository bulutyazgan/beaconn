import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapContainer } from '@/components/map/MapContainer';
import type { Location, DisasterInfo } from '@/types';
import { voiceApi } from '@/services/voiceApi';

interface VoiceConversationScreenProps {
  userLocation: Location | null;
  disaster: DisasterInfo;
  onCaseCreated: (caseId: number) => void;
}

export function VoiceConversationScreen({
  userLocation,
  disaster,
  onCaseCreated
}: VoiceConversationScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [conversationHistory, setConversationHistory] = useState<Array<{speaker: 'user' | 'agent', message: string}>>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const center = userLocation || disaster.center;

  // Initialize conversation
  useEffect(() => {
    initializeConversation();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const initializeConversation = async () => {
    try {
      setIsConnecting(true);
      const data = await voiceApi.processMessage(sessionId, '', userLocation, true);
      setConversationHistory([{ speaker: 'agent', message: data.agent_message }]);
      setIsConnecting(false);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setConversationHistory([{
        speaker: 'agent',
        message: 'Hello, this is the emergency assistance line. How can I help you today?'
      }]);
      setIsConnecting(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Use webm format which is widely supported
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudioRecording(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentTranscript('Listening...');
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setCurrentTranscript('Processing...');
    }
  };

  const processAudioRecording = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);

      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      await new Promise<void>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Audio = (reader.result as string).split(',')[1];

            // Send to ElevenLabs STT via backend
            const transcriptText = await transcribeAudio(base64Audio);

            if (!transcriptText || transcriptText.trim() === '') {
              setCurrentTranscript('No speech detected. Please try again.');
              setIsProcessing(false);
              return;
            }

            setCurrentTranscript(transcriptText);
            setConversationHistory(prev => [...prev, { speaker: 'user', message: transcriptText }]);

            // Send transcript to voice agent
            const data = await voiceApi.processMessage(sessionId, transcriptText, userLocation, false);
            setConversationHistory(prev => [...prev, { speaker: 'agent', message: data.agent_message }]);

            // Check if case was created
            if (data.case_created && data.case_id) {
              onCaseCreated(data.case_id);
            }

            setCurrentTranscript('');
            setIsProcessing(false);
            resolve();
          } catch (error) {
            console.error('Error processing audio:', error);
            setCurrentTranscript('Error processing audio. Please try again.');
            setIsProcessing(false);
            reject(error);
          }
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error('Failed to process recording:', error);
      setCurrentTranscript('Error processing audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (base64Audio: string): Promise<string> => {
    // Call backend endpoint that uses ElevenLabs STT API
    const response = await fetch('http://localhost:8000/api/voice/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64Audio,
        session_id: sessionId
      })
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.transcript;
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen w-full bg-background-primary flex items-center justify-center">
        <div className="glass p-8 rounded-2xl shadow-2xl border border-white/10 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-primary-light font-bold text-lg">Connecting to emergency assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background-primary flex">
      {/* Left Side - Conversation */}
      <div className="w-1/2 h-screen flex flex-col p-4 border-r border-white/10">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-4 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-50 tracking-tight">Voice Emergency Call</h2>
              <p className="text-sm text-neutral-400 mt-1">Speak clearly about your situation</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm font-semibold text-green-300">Connected</span>
            </div>
          </div>
        </div>

        {/* Conversation History */}
        <div className="flex-1 glass rounded-2xl p-6 mb-4 border border-white/10 shadow-xl overflow-y-auto">
          <div className="space-y-4">
            {conversationHistory.map((item, index) => (
              <div
                key={index}
                className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-5 shadow-lg ${
                    item.speaker === 'user'
                      ? 'bg-gradient-to-br from-secondary/20 to-secondary-dark/20 border border-secondary/30'
                      : 'bg-gradient-to-br from-primary/20 to-primary-dark/20 border border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.speaker === 'agent' ? (
                      <Volume2 className="w-4 h-4 text-primary-light" />
                    ) : (
                      <Mic className="w-4 h-4 text-secondary-light" />
                    )}
                    <span className={`text-xs font-bold tracking-wider ${
                      item.speaker === 'user' ? 'text-secondary-light' : 'text-primary-light'
                    }`}>
                      {item.speaker === 'user' ? 'You' : 'Emergency Assistant'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
            <div ref={conversationEndRef} />
          </div>
        </div>

        {/* Recording Controls */}
        <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={toggleRecording}
              disabled={isProcessing}
              size="lg"
              className={`h-24 w-24 rounded-full shadow-2xl border-4 transition-all duration-300 ${
                isRecording
                  ? 'bg-gradient-to-br from-alert/30 to-alert-dark/30 border-alert/50 hover:scale-105 animate-pulse'
                  : 'bg-gradient-to-br from-primary/20 to-primary-dark/20 border-primary/30 hover:scale-110'
              } disabled:opacity-50 disabled:hover:scale-100`}
            >
              {isRecording ? (
                <MicOff className="w-10 h-10 text-alert-light" />
              ) : (
                <Mic className="w-10 h-10 text-primary-light" />
              )}
            </Button>

            <div className="text-center">
              <p className="text-base font-bold text-neutral-50 mb-1">
                {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Tap to speak'}
              </p>
              <p className="text-sm text-neutral-400">
                {isRecording ? 'Tap again when done' : 'Hold and speak your emergency'}
              </p>
            </div>

            {currentTranscript && (
              <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-neutral-400 mb-1 font-semibold">
                  {isProcessing ? 'Processing...' : 'You said:'}
                </p>
                <p className="text-sm text-neutral-200 font-medium">{currentTranscript}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="w-1/2 h-screen p-4">
        <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden h-full flex flex-col">
          {/* Map Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-neutral-900/50 to-neutral-800/50">
            <h3 className="text-lg font-bold text-neutral-50 tracking-tight">Your Location</h3>
            {userLocation && (
              <p className="text-xs text-neutral-400 mt-1 font-medium">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Map Container */}
          <div className="flex-1">
            <MapContainer
              center={center}
              zoom={16}
              userLocation={userLocation}
              userRole="victim"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
