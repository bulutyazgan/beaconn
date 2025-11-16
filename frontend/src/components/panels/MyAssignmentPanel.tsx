import { useState, useEffect } from 'react';
import { FileText, Shield, Send, Clock, Maximize2, Minimize2, MapPin, Users, AlertTriangle } from 'lucide-react';
import { getHelperGuide, type HelperGuide, type Case, getCase, getAssignment, type Assignment } from '@/services/api';
import { MapContainer } from '@/components/map/MapContainer';
import type { Location, HelpRequest } from '@/types';

interface MyAssignmentPanelProps {
  assignmentId: number;
}

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'hero_agent';
}

export function MyAssignmentPanel({ assignmentId }: MyAssignmentPanelProps) {
  const [guide, setGuide] = useState<HelperGuide | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateText, setUpdateText] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const assignmentResponse = await getAssignment(assignmentId);
        setAssignment(assignmentResponse);

        // Fetch the case data
        const caseResponse = await getCase(assignmentResponse.case_id);
        setCaseData(caseResponse);
      } catch (err) {
        console.error('Failed to fetch assignment:', err);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  // Fetch Hero Agent guide
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await getHelperGuide(assignmentId);
        if (response.status !== 'processing') {
          setGuide(response);
          setLoading(false);

          // Add Hero Agent recommendation to chat
          if (response.guide_text && chatMessages.length === 0) {
            const heroMessage: ChatMessage = {
              id: 'hero-initial',
              text: response.guide_text,
              timestamp: new Date(),
              sender: 'hero_agent',
            };
            setChatMessages([heroMessage]);
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
  }, [assignmentId, loading, chatMessages.length]);

  const handleSubmitUpdate = async () => {
    if (!updateText.trim()) return;

    setSubmittingUpdate(true);
    try {
      // TODO: Call API to submit update
      // await submitHelperUpdate(assignmentId, updateText);

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: updateText,
        timestamp: new Date(),
        sender: 'user',
      };

      // Generate relevant Hero Agent follow-up question based on update
      const generateFollowUpQuestion = (update: string): string => {
        const lowerUpdate = update.toLowerCase();

        if (lowerUpdate.includes('arrived') || lowerUpdate.includes('location')) {
          return "Great! You've arrived at the location. Can you confirm visual contact with the person in need? What's the current situation?";
        } else if (lowerUpdate.includes('problem') || lowerUpdate.includes('issue') || lowerUpdate.includes('difficult')) {
          return "I understand there are new challenges. Should we request additional helpers nearby to assist you? What specific resources do you need?";
        } else if (lowerUpdate.includes('more info') || lowerUpdate.includes('unclear') || lowerUpdate.includes('question')) {
          return "I'll help you get more information from the caller. What specific details do you need to proceed safely?";
        } else if (lowerUpdate.includes('complete') || lowerUpdate.includes('done') || lowerUpdate.includes('resolved')) {
          return "Excellent work! Can you confirm the person is now safe? Do they need any follow-up assistance or medical attention?";
        } else if (lowerUpdate.includes('medical') || lowerUpdate.includes('injury') || lowerUpdate.includes('hurt')) {
          return "Medical situation noted. Do you need emergency medical services dispatched? Should I request helpers with medical training nearby?";
        } else if (lowerUpdate.includes('multiple') || lowerUpdate.includes('more people') || lowerUpdate.includes('group')) {
          return "Multiple people detected. This may require additional support. Should we request more helpers to assist with the increased number of people?";
        } else {
          return "Thank you for the update. Your situation has been logged. Is there anything specific you need assistance with right now?";
        }
      };

      // Simulate Hero Agent response with contextual follow-up
      const heroResponse: ChatMessage = {
        id: `hero-${Date.now()}`,
        text: generateFollowUpQuestion(updateText),
        timestamp: new Date(),
        sender: 'hero_agent',
      };

      setChatMessages(prev => [...prev, userMessage, heroResponse]);

      // Clear input
      setUpdateText('');

    } catch (err) {
      console.error('Failed to submit update:', err);
      alert('Failed to submit update. Please try again.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  // Quick action buttons for common status updates
  const quickActions = [
    { label: "Arrived at Location", value: "I have arrived at the person's location." },
    { label: "Request More Info", value: "I need more information from the caller to proceed safely." },
    { label: "Request Nearby Helpers", value: "The situation requires additional helpers. Can you find helpers nearby to assist?" },
    { label: "Assistance Complete", value: "I have successfully provided assistance. The person is now safe." },
  ];

  const generateContextualResponse = (actionValue: string): ChatMessage => {
    const lowerAction = actionValue.toLowerCase();

    if (lowerAction.includes('arrived')) {
      return {
        id: `hero-${Date.now()}`,
        text: "Great! You've arrived. Please assess the immediate situation and select what you observe:",
        timestamp: new Date(),
        sender: 'hero_agent',
      };
    } else if (lowerAction.includes('more info')) {
      return {
        id: `hero-${Date.now()}`,
        text: "I'll contact the caller for additional details. What specific information do you need most urgently?",
        timestamp: new Date(),
        sender: 'hero_agent',
      };
    } else if (lowerAction.includes('additional helpers')) {
      return {
        id: `hero-${Date.now()}`,
        text: "Understood. I'm searching for nearby helpers with relevant skills. What specific assistance do you need?",
        timestamp: new Date(),
        sender: 'hero_agent',
      };
    } else if (lowerAction.includes('complete') || lowerAction.includes('safe')) {
      return {
        id: `hero-${Date.now()}`,
        text: "Excellent work! Please confirm the final status before we close this case:",
        timestamp: new Date(),
        sender: 'hero_agent',
      };
    } else {
      return {
        id: `hero-${Date.now()}`,
        text: "Update received. Continue following the guidance provided. Let me know if the situation changes.",
        timestamp: new Date(),
        sender: 'hero_agent',
      };
    }
  };

  const handleQuickAction = async (actionValue: string, actionLabel: string) => {
    setSubmittingUpdate(true);
    try {
      // Immediately send the quick action
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: actionLabel,
        timestamp: new Date(),
        sender: 'user',
      };

      // Generate contextual response
      const heroResponse = generateContextualResponse(actionValue);

      setChatMessages(prev => [...prev, userMessage, heroResponse]);

    } catch (err) {
      console.error('Failed to submit update:', err);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const caseLocation: Location | null = caseData ? {
    lat: caseData.location.latitude,
    lng: caseData.location.longitude
  } : null;

  const helpRequest: HelpRequest | null = caseData ? {
    id: caseData.case_id.toString(),
    disasterId: 'default-testing',
    userId: caseData.caller_user_id?.toString() || 'anonymous',
    userName: 'Victim',
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="fixed inset-0 pt-16 flex flex-col lg:flex-row">
      {/* Map Section - Left side on desktop, top on mobile */}
      <div className="flex-1 h-1/2 lg:h-full lg:w-1/2 relative">
        {caseLocation && helpRequest ? (
          <>
            <MapContainer
              center={caseLocation}
              zoom={16}
              helpRequests={[helpRequest]}
              userLocation={caseLocation}
              onMarkerClick={() => {}}
            />

            {/* Assignment Status Overlay - Fixed position on map */}
            <div className="absolute top-6 right-4 z-10 mt-4">
              <div className="glass rounded-lg p-4 min-w-[200px] border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-white font-medium">Active Assignment</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  Responding to case
                </p>
                {caseData && (
                  <>
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getUrgencyColor(caseData.urgency)}`}>
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-semibold uppercase">{caseData.urgency}</span>
                      </div>
                    </div>
                    {caseData.people_count && caseData.people_count > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{caseData.people_count} people</span>
                      </div>
                    )}
                  </>
                )}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-gray-400">Assignment #{assignmentId}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-background-primary flex items-center justify-center">
            <div className="glass p-6 rounded-lg">
              <p className="text-gray-400">Loading case location...</p>
            </div>
          </div>
        )}
      </div>

      {/* Panel Section - Right side on desktop, bottom on mobile */}
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
        <div className="p-4 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-white">My Assignment</h2>
            <span className="text-sm text-gray-400">#{assignmentId}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={isExpanded ? "Minimize" : "Expand for larger view"}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5 text-gray-400" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Case Details Section */}
        {caseData && (
          <div className="p-4 border-b border-white/10 flex-shrink-0 bg-white/5">
            <h3 className="text-sm font-semibold text-white mb-2">Case Details</h3>
            <p className="text-sm text-gray-300 mb-2">{caseData.description || caseData.raw_problem_description}</p>
            {caseData.vulnerability_factors && caseData.vulnerability_factors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {caseData.vulnerability_factors.map((factor, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-200"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Messages Area - Hero Agent Guidance */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Clock className="w-8 h-8 text-blue-400 animate-pulse mb-3" />
              <p className="text-white font-medium">Hero Agent is analyzing the case...</p>
              <p className="text-gray-400 text-sm mt-1">Generating personalized guidance for responders</p>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-blue-500/20 border border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.sender === 'hero_agent' ? (
                        <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-green-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-semibold ${
                        message.sender === 'user' ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {message.sender === 'user' ? 'You' : 'Hero Agent'}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Quick Actions Section - Instant Send Buttons */}
        <div className="p-3 border-t border-white/10 flex-shrink-0 bg-background-elevated/50">
          <p className="text-xs text-gray-400 mb-2">Quick Actions - Click to send instantly</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.value, action.label)}
                disabled={submittingUpdate}
                className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 disabled:bg-white/5 border border-blue-500/30 disabled:border-white/10 rounded-lg text-xs text-blue-300 disabled:text-gray-500 transition-all hover:scale-105 active:scale-95 font-medium disabled:cursor-not-allowed"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area - Bottom of chat */}
        <div className="p-4 border-t border-white/10 flex-shrink-0 bg-background-elevated/50">
          <p className="text-xs text-gray-400 mb-2">
            Send status update to Hero Agent
          </p>
          <div className="flex gap-2">
            <textarea
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              placeholder="E.g., 'I've arrived at the location' or 'Need medical supplies'"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
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
              className="px-4 h-auto bg-green-500/20 hover:bg-green-500/30 disabled:bg-white/5 border border-green-500/30 disabled:border-white/10 rounded-lg font-medium text-green-300 disabled:text-gray-500 transition-colors disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submittingUpdate ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
