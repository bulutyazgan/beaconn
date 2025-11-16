import { useState, useEffect } from 'react';
import { FileText, Shield, Send, Clock, ChevronUp, ChevronDown, Maximize2, Minimize2, Navigation } from 'lucide-react';
import {
  getCallerGuide,
  type CallerGuide,
  type Case,
  getCase,
  getCaseAssignments,
  getUser,
  createAgentMessage,
  getUnreadMessages,
  type AgentMessage,
} from '@/services/api';
import { MapContainer } from '@/components/map/MapContainer';
import { RouteMap } from '@/components/map/RouteMap';
import type { Location, HelpRequest } from '@/types';

interface MyCasePanelProps {
  caseId: number;
}

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'hero_agent';
  options?: ButtonOption[]; // Interactive buttons for agent questions
  questionType?: 'single' | 'multiple'; // single choice or multiple choice
}

interface ButtonOption {
  id: string;
  label: string;
  value: string;
}

export function MyCasePanel({ caseId }: MyCasePanelProps) {
  const [guide, setGuide] = useState<CallerGuide | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateText, setUpdateText] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [pendingQuestion, setPendingQuestion] = useState<ChatMessage | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [helperInfo, setHelperInfo] = useState<any>(null);
  const [helperLocation, setHelperLocation] = useState<Location | null>(null);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');

  // Fetch case data for map display
  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await getCase(caseId);
        setCaseData(response);
      } catch (err) {
        console.error('Failed to fetch case:', err);
      }
    };

    fetchCase();
  }, [caseId]);

  // Fetch Hero Agent guide
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await getCallerGuide(caseId);
        if (response.status !== 'processing') {
          setGuide(response);
          setLoading(false);

          // Add Hero Agent recommendation to chat with initial status check question
          if (response.guide_text && chatMessages.length === 0) {
            const heroMessage: ChatMessage = {
              id: 'hero-initial',
              text: response.guide_text,
              timestamp: new Date(),
              sender: 'hero_agent',
            };

            // Follow-up question with interactive options
            const followUpQuestion: ChatMessage = {
              id: 'hero-status-check',
              text: "How is your current situation? This helps me provide better guidance.",
              timestamp: new Date(),
              sender: 'hero_agent',
              questionType: 'single',
              options: [
                { id: 'stable', label: 'Stable - Situation unchanged', value: 'stable' },
                { id: 'improving', label: 'Improving - Getting safer', value: 'improving' },
                { id: 'worsening', label: 'Worsening - Need urgent help', value: 'worsening' },
                { id: 'new_problem', label: 'New problem has occurred', value: 'new_problem' },
              ]
            };

            setChatMessages([heroMessage, followUpQuestion]);
            setPendingQuestion(followUpQuestion);
          }
        }
      } catch (err) {
        console.error('Failed to fetch guide:', err);
        setLoading(false);
      }
    };

    fetchGuide();
    // Poll every 5 seconds if still loading
    const interval = setInterval(() => {
      if (loading) fetchGuide();
    }, 5000);

    return () => clearInterval(interval);
  }, [caseId, loading, chatMessages.length]);

  // Poll for assignment status and helper location
  useEffect(() => {
    const fetchAssignmentsAndHelper = async () => {
      try {
        const assignmentsList = await getCaseAssignments(caseId);
        setAssignments(assignmentsList);

        // If there's an active assignment, fetch helper info and live location
        if (assignmentsList.length > 0) {
          const activeAssignment = assignmentsList.find(a => !a.completed_at);
          if (activeAssignment) {
            const helper = await getUser(activeAssignment.helper_user_id.toString());
            setHelperInfo(helper);

            // Fetch helper's latest location from location_tracking table
            try {
              const locationResponse = await fetch(`http://localhost:8000/api/users/${activeAssignment.helper_user_id}/location-history?limit=1`);
              const locationData = await locationResponse.json();

              if (locationData.locations && locationData.locations.length > 0) {
                const latestLocation = locationData.locations[0];
                setHelperLocation({
                  lat: latestLocation.latitude,
                  lng: latestLocation.longitude
                });
              }
            } catch (err) {
              console.error('Failed to fetch helper location:', err);
            }
          } else {
            // No active assignment, clear helper data
            setHelperInfo(null);
            setHelperLocation(null);
          }
        } else {
          // No assignments, clear helper data
          setHelperInfo(null);
          setHelperLocation(null);
        }
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
      }
    };

    fetchAssignmentsAndHelper();
    // Poll every 2 seconds for real-time updates
    const interval = setInterval(fetchAssignmentsAndHelper, 2000);

    return () => clearInterval(interval);
  }, [caseId, caseData]);

  // Poll for helper questions (messages from helper to victim)
  useEffect(() => {
    if (assignments.length === 0) return;

    const activeAssignment = assignments.find(a => !a.completed_at);
    if (!activeAssignment) return;

    const pollHelperMessages = async () => {
      try {
        const response = await getUnreadMessages(activeAssignment.id, 'victim_agent');

        if (response.unread_messages && response.unread_messages.length > 0) {
          // Convert AgentMessages to ChatMessages and add to chat
          const newMessages: ChatMessage[] = response.unread_messages.map((msg: AgentMessage) => ({
            id: `helper-${msg.message_id}`,
            text: msg.message_text,
            timestamp: new Date(msg.created_at),
            sender: 'hero_agent' as const, // Helper's messages appear as 'hero_agent' in victim's chat
            options: msg.options ? msg.options.map(opt => ({
              id: opt.id,
              label: opt.label,
              value: opt.label,
            })) : undefined,
            questionType: msg.question_type as 'single' | 'multiple' | undefined,
          }));

          setChatMessages(prev => [...prev, ...newMessages]);

          // If the latest message has options, set it as pending question
          const latestMessage = newMessages[newMessages.length - 1];
          if (latestMessage.options) {
            setPendingQuestion(latestMessage);
          }
        }
      } catch (err) {
        console.error('[MyCasePanel] Failed to poll helper messages:', err);
      }
    };

    // Poll immediately, then every 3 seconds
    pollHelperMessages();
    const interval = setInterval(pollHelperMessages, 3000);

    return () => clearInterval(interval);
  }, [assignments]);

  const handleButtonSelect = async (option: ButtonOption) => {
    if (!pendingQuestion) return;

    setSubmittingUpdate(true);
    try {
      // Instantly send the selected option
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: option.label,
        timestamp: new Date(),
        sender: 'user',
      };

      // Generate contextual response based on the selection
      const heroResponse = generateContextualResponse([option.id], pendingQuestion);

      setChatMessages(prev => [...prev, userMessage, heroResponse]);

      // Clear pending question and set new one if response has options
      setPendingQuestion(heroResponse.options ? heroResponse : null);
      setSelectedOptions(new Set());

    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleSubmitButtonResponse = async () => {
    if (selectedOptions.size === 0 || !pendingQuestion) return;

    setSubmittingUpdate(true);
    try {
      // Get selected option labels
      const selectedLabels = pendingQuestion.options
        ?.filter(opt => selectedOptions.has(opt.id))
        .map(opt => opt.label)
        .join(', ') || '';

      // Add user response to chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: selectedLabels,
        timestamp: new Date(),
        sender: 'user',
      };

      // Generate contextual Hero Agent response based on selection
      const heroResponse = generateContextualResponse(Array.from(selectedOptions), pendingQuestion);

      setChatMessages(prev => [...prev, userMessage, heroResponse]);

      // Clear selection and pending question
      setSelectedOptions(new Set());
      setPendingQuestion(heroResponse.options ? heroResponse : null);

    } catch (err) {
      console.error('Failed to submit update:', err);
      alert('Failed to submit update. Please try again.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const generateContextualResponse = (selectedIds: string[], question: ChatMessage): ChatMessage => {
    const selection = selectedIds[0]; // For single choice questions

    // Initial status check responses
    if (question.id === 'hero-status-check') {
      if (selection === 'worsening' || selection === 'new_problem') {
        return {
          id: `hero-${Date.now()}`,
          text: selection === 'worsening'
            ? "I understand your situation is getting worse. I'm escalating your case priority and notifying nearby helpers immediately."
            : "A new problem has been detected. Let me help you address this.",
          timestamp: new Date(),
          sender: 'hero_agent',
          questionType: 'single',
          options: [
            { id: 'medical', label: 'Medical emergency', value: 'medical' },
            { id: 'fire', label: 'Fire/smoke nearby', value: 'fire' },
            { id: 'structural', label: 'Building damage/collapse', value: 'structural' },
            { id: 'trapped', label: 'Unable to move/escape', value: 'trapped' },
            { id: 'other', label: 'Something else', value: 'other' },
          ]
        };
      } else {
        return {
          id: `hero-${Date.now()}`,
          text: selection === 'improving'
            ? "That's good to hear! Continue following safety guidelines. Are you able to move to a safer location if needed?"
            : "Understood. Continue monitoring your situation. Do you have access to essential supplies?",
          timestamp: new Date(),
          sender: 'hero_agent',
          questionType: 'multiple',
          options: [
            { id: 'water', label: 'Water', value: 'water' },
            { id: 'food', label: 'Food', value: 'food' },
            { id: 'medical', label: 'Medical supplies', value: 'medical' },
            { id: 'phone', label: 'Working phone/battery', value: 'phone' },
          ]
        };
      }
    }

    // Problem type responses
    if (question.options?.some(o => o.id === 'medical')) {
      if (selection === 'medical') {
        return {
          id: `hero-${Date.now()}`,
          text: "Medical emergency detected. Prioritizing medical responders. How many people need medical attention?",
          timestamp: new Date(),
          sender: 'hero_agent',
          questionType: 'single',
          options: [
            { id: '1', label: '1 person', value: '1' },
            { id: '2', label: '2-3 people', value: '2-3' },
            { id: '4', label: '4-5 people', value: '4-5' },
            { id: 'more', label: 'More than 5 people', value: 'more' },
          ]
        };
      } else if (selection === 'fire') {
        return {
          id: `hero-${Date.now()}`,
          text: "Fire hazard reported. Alerting fire response teams. Can you safely evacuate from your current location?",
          timestamp: new Date(),
          sender: 'hero_agent',
          questionType: 'single',
          options: [
            { id: 'yes_safe', label: 'Yes, evacuating now', value: 'yes_safe' },
            { id: 'path_blocked', label: 'No, path is blocked', value: 'path_blocked' },
            { id: 'injured', label: 'No, someone is injured', value: 'injured' },
            { id: 'unsure', label: 'Unsure/need guidance', value: 'unsure' },
          ]
        };
      } else if (selection === 'trapped') {
        return {
          id: `hero-${Date.now()}`,
          text: "Understood. Search & rescue teams are being dispatched. Stay calm and conserve energy. Can you make noise or signal your location?",
          timestamp: new Date(),
          sender: 'hero_agent',
          questionType: 'multiple',
          options: [
            { id: 'whistle', label: 'Whistle/loud noise', value: 'whistle' },
            { id: 'flashlight', label: 'Flashlight/light', value: 'flashlight' },
            { id: 'phone', label: 'Phone signal', value: 'phone' },
            { id: 'none', label: 'No signaling method', value: 'none' },
          ]
        };
      }
    }

    // Default response with supply check
    return {
      id: `hero-${Date.now()}`,
      text: "Thank you for the update. I've logged this information. Help is on the way. Stay safe and follow the guidance provided.",
      timestamp: new Date(),
      sender: 'hero_agent',
    };
  };

  const handleSubmitUpdate = async () => {
    if (!updateText.trim()) return;

    setSubmittingUpdate(true);
    try {
      // Add user message to chat FIRST (optimistic UI)
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: updateText,
        timestamp: new Date(),
        sender: 'user',
      };
      setChatMessages(prev => [...prev, userMessage]);

      // If there's an active assignment, send response to helper via API
      const activeAssignment = assignments.find(a => !a.completed_at);
      if (activeAssignment) {
        await createAgentMessage({
          assignment_id: activeAssignment.id,
          case_id: caseId,
          sender: 'victim_agent',
          message_type: 'answer',
          message_text: updateText,
        });

        // Show confirmation
        const confirmMessage: ChatMessage = {
          id: `hero-${Date.now()}`,
          text: "✓ Your message has been sent to the responder. They will receive your update.",
          timestamp: new Date(),
          sender: 'hero_agent',
        };
        setChatMessages(prev => [...prev, confirmMessage]);
      } else {
        // No active assignment - generate local AI response
        const heroResponse = analyzeFreeTextUpdate(updateText);
        setChatMessages(prev => [...prev, heroResponse]);
        setPendingQuestion(heroResponse.options ? heroResponse : null);
      }

      // Clear input
      setUpdateText('');

    } catch (err) {
      console.error('Failed to submit update:', err);
      alert('Failed to submit update. Please try again.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const analyzeFreeTextUpdate = (text: string): ChatMessage => {
    const lowerText = text.toLowerCase();

    // Detect urgency escalation
    if (lowerText.includes('worse') || lowerText.includes('urgent') || lowerText.includes('emergency')) {
      return {
        id: `hero-${Date.now()}`,
        text: "I detect your situation may be worsening. Escalating priority. What type of assistance do you need most urgently?",
        timestamp: new Date(),
        sender: 'hero_agent',
        questionType: 'single',
        options: [
          { id: 'medical', label: 'Medical/first aid', value: 'medical' },
          { id: 'evacuation', label: 'Evacuation assistance', value: 'evacuation' },
          { id: 'supplies', label: 'Food/water/supplies', value: 'supplies' },
          { id: 'rescue', label: 'Rescue/extraction', value: 'rescue' },
        ]
      };
    }

    // Detect improvement
    if (lowerText.includes('better') || lowerText.includes('safe') || lowerText.includes('ok')) {
      return {
        id: `hero-${Date.now()}`,
        text: "Glad to hear you're safer. Continue monitoring your situation. Do you still need a responder, or can we re-prioritize your case?",
        timestamp: new Date(),
        sender: 'hero_agent',
        questionType: 'single',
        options: [
          { id: 'still_need', label: 'Still need help - keep priority', value: 'still_need' },
          { id: 'lower_priority', label: 'Lower priority - others need help more', value: 'lower_priority' },
          { id: 'cancel', label: 'Resolved - cancel request', value: 'cancel' },
        ]
      };
    }

    // Default acknowledgment
    return {
      id: `hero-${Date.now()}`,
      text: "Update received. Your information has been logged. Is there anything specific you need right now?",
      timestamp: new Date(),
      sender: 'hero_agent',
      questionType: 'single',
      options: [
        { id: 'nothing', label: 'Nothing - just updating status', value: 'nothing' },
        { id: 'question', label: 'I have a question', value: 'question' },
        { id: 'request', label: 'I need something', value: 'request' },
      ]
    };
  };

  const caseLocation: Location | null = caseData ? {
    lat: caseData.location.latitude,
    lng: caseData.location.longitude
  } : null;

  const helpRequest: HelpRequest | null = caseData ? {
    id: caseData.case_id.toString(),
    disasterId: 'default-testing',
    userId: caseData.caller_user_id?.toString() || 'anonymous',
    userName: 'You',
    type: 'medical',
    location: { lat: caseData.location.latitude, lng: caseData.location.longitude },
    peopleCount: caseData.people_count || 0,
    urgency: caseData.urgency,
    status: caseData.status === 'assigned' || caseData.status === 'in_progress' ? 'in_progress' : caseData.status === 'resolved' || caseData.status === 'closed' ? 'resolved' : 'pending',
    description: caseData.description || caseData.raw_problem_description,
    createdAt: new Date(caseData.created_at),
    vulnerabilityFactors: caseData.vulnerability_factors || [],
    mobilityStatus: caseData.mobility_status || undefined,
    timestamp: caseData.created_at,
  } : null;

  const handleRouteCalculated = (distance: string, duration: string) => {
    setRouteDistance(distance);
    setRouteDuration(duration);
  };

  return (
    <div className="fixed inset-0 pt-16 flex flex-col lg:flex-row">
      {/* Map Section - Left side on desktop, top on mobile */}
      <div className="flex-1 h-1/2 lg:h-full lg:w-1/2 relative">
        {caseLocation ? (
          <>
            {/* Show RouteMap if helper is assigned, otherwise show regular MapContainer */}
            {helperInfo && helperLocation ? (
              <RouteMap
                helperLocation={helperLocation}
                victimLocation={caseLocation}
                onRouteCalculated={handleRouteCalculated}
              />
            ) : (
              <MapContainer
                center={caseLocation}
                zoom={16}
                helpRequests={helpRequest ? [helpRequest] : []}
                userLocation={caseLocation}
                onMarkerClick={() => {}}
              />
            )}

            {/* Status Overlay - Fixed position on map */}
            <div className="absolute top-6 right-4 z-10 mt-4">
              <div className="glass rounded-xl p-5 min-w-[220px] border border-white/10 shadow-2xl backdrop-blur-3xl">
                <div className="flex items-center gap-2.5 mb-3">
                  {helperInfo ? (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary-light animate-pulse shadow-lg shadow-secondary/50" />
                      <span className="text-sm text-neutral-50 font-bold tracking-wide">Responder On The Way</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-alert-light animate-pulse shadow-lg shadow-alert/50" />
                      <span className="text-sm text-neutral-50 font-bold tracking-wide">Request Status</span>
                    </>
                  )}
                </div>

                {helperInfo ? (
                  <>
                    <p className="text-sm text-secondary-light font-bold mb-2 tracking-wide">
                      {helperInfo.name} is responding
                    </p>
                    {routeDistance && routeDuration && (
                      <>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Navigation className="w-3.5 h-3.5 text-secondary" />
                          <p className="text-xs text-neutral-300 font-medium">
                            {routeDistance}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <p className="text-xs text-neutral-300 font-medium">
                            ETA: {routeDuration}
                          </p>
                        </div>
                      </>
                    )}
                    <p className="text-xs text-neutral-500 font-medium">
                      Help is on the way. Stay safe!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-alert-light font-bold mb-1.5 tracking-wide">
                      Waiting for responder
                    </p>
                    <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                      Your location is visible to nearby helpers
                    </p>
                  </>
                )}

                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-neutral-400 font-semibold tracking-wider">Case #{caseId}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-background-primary flex items-center justify-center">
            <div className="glass p-6 rounded-lg">
              <p className="text-gray-400">Loading your location...</p>
            </div>
          </div>
        )}
      </div>

      {/* Panel Section - Right side on desktop, bottom on mobile */}
      {/* Can expand to overlay the map for larger view */}
      <div
        className={`
          flex-1 glass flex flex-col overflow-hidden transition-all duration-300
          ${isExpanded
            ? 'fixed inset-0 top-16 z-20 lg:left-1/2'
            : 'h-1/2 lg:h-full lg:w-1/2'
          }
        `}
      >
        {/* Header with Expand/Collapse button */}
        <div className="p-6 border-b border-white/10 flex-shrink-0 flex items-center justify-between bg-gradient-to-r from-neutral-800/50 to-neutral-700/50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-neutral-50 tracking-tight">My Help Request</h2>
            <span className="text-sm text-neutral-400 font-semibold">#{caseId}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            title={isExpanded ? "Minimize" : "Expand for larger view"}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5 text-neutral-400 hover:text-neutral-200 transition-colors" />
            ) : (
              <Maximize2 className="w-5 h-5 text-neutral-400 hover:text-neutral-200 transition-colors" />
            )}
          </button>
        </div>

        {/* Chat Messages Area - Hero Agent Recommendations */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading && chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Clock className="w-10 h-10 text-primary animate-pulse mb-4 drop-shadow-lg" />
              <p className="text-neutral-50 font-bold text-lg tracking-tight">Hero Agent is analyzing your situation...</p>
              <p className="text-neutral-400 text-sm mt-2 font-medium">Generating personalized safety guidance</p>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-5 shadow-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-secondary/20 to-secondary-dark/20 border border-secondary/30'
                        : 'bg-gradient-to-br from-primary/20 to-primary-dark/20 border border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      {message.sender === 'hero_agent' ? (
                        <Shield className="w-4 h-4 text-primary-light flex-shrink-0 drop-shadow-md" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-secondary-light flex-shrink-0 shadow-md" />
                      )}
                      <span className={`text-xs font-bold tracking-wider ${
                        message.sender === 'user' ? 'text-secondary-light' : 'text-primary-light'
                      }`}>
                        {message.sender === 'user' ? 'You' : 'Hero Agent'}
                      </span>
                      <span className="text-xs text-neutral-500 ml-auto font-medium">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed font-medium">
                      {message.text}
                    </p>

                    {/* Interactive button options - Instant Send */}
                    {message.options && message.options.length > 0 && message === pendingQuestion && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs text-neutral-400 font-bold tracking-wide">
                          Click to send instantly:
                        </p>
                        <div className="grid grid-cols-1 gap-2.5">
                          {message.options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleButtonSelect(option)}
                              disabled={submittingUpdate}
                              className="px-4 py-3 rounded-xl text-sm text-left font-semibold transition-all bg-primary/10 hover:bg-primary/20 disabled:bg-white/5 border border-primary/30 disabled:border-white/10 text-primary-light hover:text-neutral-50 disabled:text-neutral-500 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed shadow-md hover:shadow-lg tracking-wide"
                            >
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Input Area - Free-text for custom responses */}
        <div className="p-6 border-t border-white/10 flex-shrink-0 bg-gradient-to-r from-neutral-800/50 to-neutral-700/50">
          {pendingQuestion && (
            <p className="text-xs text-neutral-400 mb-3 text-center font-semibold tracking-wide">
              Choose an option above, or type a custom response below
            </p>
          )}
          {!pendingQuestion && (
            <p className="text-xs text-neutral-400 mb-3 font-semibold tracking-wide">
              Log changes in your situation
            </p>
          )}
          <div className="flex gap-3">
            <textarea
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              placeholder={pendingQuestion ? "Or type your own response..." : "E.g., 'I've moved to a safer location' or 'More people have joined me'"}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 resize-none transition-all shadow-inner font-medium"
              rows={2}
              disabled={submittingUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitUpdate();
                }
              }}
            />
            <button
              onClick={handleSubmitUpdate}
              disabled={!updateText.trim() || submittingUpdate}
              className="px-5 h-auto bg-gradient-to-r from-secondary/20 to-secondary-dark/20 hover:from-secondary/30 hover:to-secondary-dark/30 disabled:from-neutral-700/20 disabled:to-neutral-800/20 border border-secondary/30 disabled:border-white/10 rounded-xl font-bold text-secondary-light disabled:text-neutral-500 transition-all disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              {submittingUpdate ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-3 font-medium">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
