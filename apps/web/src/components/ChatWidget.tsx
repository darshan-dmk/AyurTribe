// apps/web/src/components/ChatWidget.tsx
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import websocketService from '../utils/websocket';

type Thread = {
  id: string;
  title?: string | null;
  patient_id?: string | null;
  practitioner_id?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type Message = {
  id: string;
  thread_id: string;
  sender_id?: string | null;
  content: string;
  metadata?: any;
  is_read?: boolean;
  created_at?: string;
  isBot?: boolean;
  senderName?: string;
  senderRole?: string;
};

type User = {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
};

const ChatWidget: React.FC<{
  initialThreadId?: string;
  isPractitionerView?: boolean;
}> = ({ initialThreadId, isPractitionerView = false }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isConnectingToPractitioner, setIsConnectingToPractitioner] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [userDosha, setUserDosha] = useState<string | null>(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const realtimeRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Add this right after the useState declarations in ChatWidget
  useEffect(() => {
    console.log('[ChatWidget] Current userId:', userId);
    console.log('[ChatWidget] Current user:', currentUser);
    console.log('[ChatWidget] Selected thread:', selectedThread);
  }, [userId, currentUser, selectedThread]);

  // Fetch user's Dosha once userId is available
  useEffect(() => {
    if (userId) {
      getUserPrakriti().then(dosha => {
        if (dosha) {
          console.log('[ChatWidget] Detected User Dosha:', dosha);
          setUserDosha(dosha);
        }
      });
    }
  }, [userId]);

  // ADD THIS NEW useEffect RIGHT HERE - After the debugging useEffect
  useEffect(() => {
    // Show quick actions for new threads or threads with only welcome message
    if (selectedThread && messages.length <= 1) {
      setShowQuickActions(true);
    }
  }, [selectedThread, messages.length]);
  // Quick action buttons for common queries
  const getQuickActions = () => {
    const baseActions = [
      { id: 'prakriti', label: '🧘 About Prakriti', query: 'What is Ayurvedic Prakriti and how do I optimize it?' },
      { id: 'diet', label: '🥗 My Diet Plan', query: `What diet is optimal for my ${userDosha || 'body type'}?` },
      { id: 'appointment', label: '📅 Consultation', query: 'I would like to book an appointment with a Vaidya.' },
      { id: 'practitioner', label: '👨‍⚕️ Expert Chat', query: 'CONNECT_PRACTITIONER' }
    ];

    if (userDosha?.toLowerCase() === 'vata') {
      baseActions.unshift({ id: 'vata_care', label: '🌿 Vata Balance', query: 'Give me 3 grounding tips for my Vata nature today.' });
    } else if (userDosha?.toLowerCase() === 'pitta') {
      baseActions.unshift({ id: 'pitta_care', label: '❄️ Pitta Cooling', query: 'Suggest some cooling rituals to balance my Pitta.' });
    } else if (userDosha?.toLowerCase() === 'kapha') {
      baseActions.unshift({ id: 'kapha_care', label: '🔥 Kapha Vitality', query: 'How can I increase my energy levels as a Kapha person?' });
    }

    return baseActions.slice(0, 5); // Keep it compact
  };

  // AI Bot responses via Gemini API
  const getBotResponse = async (message: string, isImage = false, imageFile?: File): Promise<string> => {
    try {
      if (isImage && imageFile) {
        const formData = new FormData();
        formData.append('photo', imageFile);
        formData.append('prompt', message || "Analyze this image in an Ayurvedic context and provide health insights.");
        formData.append('userId', userId || ''); // Pass userId for context

        const response = await api.post('/ai-chat/analyze-photo', formData, {
          headers: {} // Let browser set content-type for FormData
        });
        return response.analysis;
      } else {
        // Build simple history from last few messages
        const history = messages.slice(-5).map(msg => ({
          role: msg.isBot ? 'model' : 'user' as const,
          parts: msg.content
        }));

        const response = await api.post('/ai-chat/message', {
          message,
          history,
          userId: userId // Pass the current user ID for contextual analysis
        });
        return response.response;
      }
    } catch (error) {
      console.error('AI Bot Error:', error);
      return "I'm having trouble connecting to my Ayurvedic knowledge base right now. Please try again in a moment.";
    }
  };

  // Get user's Prakriti from database
  const getUserPrakriti = async (): Promise<string | null> => {
    if (!userId) return null;
    try {
      const { data } = await supabase
        .from('questionnaire_answers')
        .select('dominant')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return data?.dominant || null;
    } catch (error) {
      console.error('Error fetching Prakriti:', error);
      return null;
    }
  };

  // Get diet recommendations based on Prakriti
  const getDietRecommendations = (prakriti: string): string => {
    const recommendations: Record<string, string> = {
      vata: `**Diet for Vata Constitution:**

✅ **Favor:**
• Warm, cooked, moist foods
• Sweet, sour, and salty tastes
• Cooked vegetables, whole grains
• Warm milk, ghee, oils
• Regular meal times

❌ **Avoid:**
• Cold, dry, raw foods
• Bitter, astringent tastes
• Excessive beans, cruciferous vegetables
• Cold drinks, ice cream
• Irregular eating

**Best Practices:**
• Eat in a calm environment
• Include healthy fats
• Stay hydrated with warm liquids`,

      pitta: `**Diet for Pitta Constitution:**

✅ **Favor:**
• Cool, refreshing foods
• Sweet, bitter, and astringent tastes
• Fresh fruits, vegetables
• Cooling herbs like coriander, fennel
• Moderate portions

❌ **Avoid:**
• Hot, spicy, oily foods
• Sour, salty, pungent tastes
• Alcohol, caffeine
• Red meat, fried foods
• Eating when angry

**Best Practices:**
• Eat at regular times
• Include cooling foods
• Avoid overheating`,

      kapha: `**Diet for Kapha Constitution:**

✅ **Favor:**
• Light, warm, spicy foods
• Pungent, bitter, astringent tastes
• Cooked vegetables, legumes
• Warming spices
• Light breakfast

❌ **Avoid:**
• Heavy, cold, oily foods
• Sweet, sour, salty tastes
• Dairy, wheat, sugar
• Excessive water with meals
• Late-night eating

**Best Practices:**
• Eat largest meal at lunch
• Include metabolism-boosting spices
• Stay active after meals`
    };

    return recommendations[prakriti.toLowerCase()] || getDietRecommendations('vata');
  };

  // Load current user
  useEffect(() => {
    const init = async () => {
      try {
        console.log('[ChatWidget] Initializing user...');

        // Initialize WebSocket connection
        websocketService.connect();

        // First try Supabase auth
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user?.id) {
          console.log('[ChatWidget] Found user from Supabase:', data.user.id);
          setUserId(data.user.id);

          // Get user details from database
          const { data: userData } = await supabase
            .from('users')
            .select('id, first_name, last_name, role')
            .eq('id', data.user.id)
            .single();

          if (userData) {
            setCurrentUser(userData);
            console.log('[ChatWidget] User details loaded:', userData.first_name, userData.last_name);
          }
          return; // Success, exit early
        }

        // Method 2: Fallback to localStorage (same as Dashboard does)
        const storedUserJson = localStorage.getItem('user');
        if (storedUserJson) {
          try {
            const parsed = JSON.parse(storedUserJson);
            if (parsed?.id && parsed?.email) {
              console.log('[ChatWidget] Creating Supabase session for:', parsed.email);

              // Create a Supabase session using the stored user data
              // This is a workaround - ideally you'd have the password or use a different method
              const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
                options: {
                  data: {
                    user_id: parsed.id,
                    email: parsed.email,
                    role: parsed.role
                  }
                }
              });

              if (!authError && authData.user) {
                setUserId(parsed.id);
                setCurrentUser({
                  id: parsed.id,
                  first_name: parsed.first_name,
                  last_name: parsed.last_name,
                  role: parsed.role || 'patient'
                });
                return;
              }
            }
          } catch (e) {
            console.error('[ChatWidget] Failed to create Supabase session:', e);
          }
        }

        console.warn('[ChatWidget] No user found - chat will be disabled');
      } catch (e) {
        console.error('[ChatWidget] getUser failed', e);
      }
    };

    init();

    // Cleanup WebSocket connection on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Load threads
  useEffect(() => {
    if (!userId) return;

    const loadThreads = async () => {
      try {
        let query = supabase
          .from('chat_threads')
          .select('*')
          .order('updated_at', { ascending: false });

        // Filter based on user role
        if (isPractitionerView && currentUser?.role === 'practitioner') {
          query = query.eq('practitioner_id', userId);
        } else {
          query = query.or(`patient_id.eq.${userId},practitioner_id.eq.${userId}`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('[ChatWidget] loadThreads error', error);
          return;
        }

        const typed = (data ?? []) as Thread[];
        setThreads(typed);

        // Select initial thread
        if (initialThreadId) {
          const thread = typed.find(t => t.id === initialThreadId);
          if (thread) setSelectedThread(thread);
        } else if (!selectedThread && typed.length > 0) {
          setSelectedThread(typed[0]);
        }
      } catch (e) {
        console.error('[ChatWidget] loadThreads catch', e);
      }
    };

    loadThreads();
  }, [userId, currentUser, isPractitionerView, initialThreadId]);

  // Load messages for selected thread
  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return;
    }

    let mounted = true;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            sender:users!chat_messages_sender_id_fkey(
              id,
              first_name,
              last_name,
              role
            )
          `)
          .eq('thread_id', selectedThread.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[ChatWidget] loadMessages error', error);
          return;
        }

        const formattedMessages = data?.map((msg: any) => ({
          ...msg,
          senderName: msg.sender ? `${msg.sender.first_name} ${msg.sender.last_name}` : 'Unknown',
          senderRole: msg.sender?.role || 'unknown',
          isBot: msg.metadata?.isBot || false
        })) || [];

        if (mounted) {
          setMessages(formattedMessages);
          setTimeout(() => messagesRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }), 50);
        }
      } catch (e) {
        console.error('[ChatWidget] loadMessages catch', e);
      }
    };

    loadMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`chat:${selectedThread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${selectedThread.id}`
        },
        async (payload: any) => {
          const newMsg = payload.new;

          // Get sender info
          const { data: senderData } = await supabase
            .from('users')
            .select('first_name, last_name, role')
            .eq('id', newMsg.sender_id)
            .single();

          const formattedMsg = {
            ...newMsg,
            senderName: senderData ? `${senderData.first_name} ${senderData.last_name}` : 'Unknown',
            senderRole: senderData?.role || 'unknown',
            isBot: newMsg.metadata?.isBot || false
          };

          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, formattedMsg];
          });

          setTimeout(() => messagesRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }), 50);
        }
      )
      .subscribe();

    realtimeRef.current = channel;

    return () => {
      mounted = false;
      if (realtimeRef.current) {
        supabase.removeChannel(realtimeRef.current);
        realtimeRef.current = null;
      }
    };
  }, [selectedThread]);

  // Send message
  const sendMessage = async (content?: string, isImage = false, imageFile?: File) => {
    const messageContent = content || input.trim();
    if (!selectedThread || !userId || (!messageContent && !isImage)) return;

    try {
      let finalContent = messageContent;
      let metadata: any = { isBot: false };

      if (isImage && imageFile) {
        // In a real app, we would upload to Supabase Storage first.
        // For this demo, we'll prefix content to indicate it's an image.
        finalContent = messageContent || "Sent an image for analysis.";
        metadata.hasImage = true;
        metadata.imageName = imageFile.name;
      }

      const payload = {
        thread_id: selectedThread.id,
        sender_id: userId,
        content: finalContent,
        metadata: metadata,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('chat_messages').insert(payload);
      if (error) {
        console.error('[ChatWidget] sendMessage error', error);
        return;
      }

      setInput('');

      // Check if it's a request to connect with practitioner
      if (finalContent === 'CONNECT_PRACTITIONER' || finalContent.toLowerCase().includes('talk to practitioner')) {
        await connectToPractitioner();
      } else if (!selectedThread.practitioner_id) {
        // If no practitioner assigned, provide bot response
        await sendBotResponse(finalContent, isImage, imageFile);
      }
    } catch (e) {
      console.error('[ChatWidget] sendMessage catch', e);
    }
  };

  const handleSend = () => {
    if (selectedImage) {
      sendMessage(input, true, selectedImage);
      setSelectedImage(null);
    } else {
      sendMessage();
    }
  };


  // Send bot response
  const sendBotResponse = async (userMessage: string, isImage = false, imageFile?: File) => {
    setIsTyping(true);

    const botResponse = await getBotResponse(userMessage, isImage, imageFile);

    const botPayload = {
      thread_id: selectedThread!.id,
      sender_id: userId,
      content: botResponse,
      metadata: {
        isBot: true,
        botName: 'Ayur Tribe AI Assistant',
        wasImageAnalysis: isImage
      },
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('chat_messages').insert(botPayload);
    } catch (e) {
      console.error('[ChatWidget] sendBotResponse error', e);
    }

    setIsTyping(false);
  };

  // Connect to practitioner
  const connectToPractitioner = async () => {
    if (!selectedThread || !userId) return;

    setIsConnectingToPractitioner(true);

    try {
      // Find available practitioner
      const { data: practitioners } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('role', 'practitioner')
        .eq('is_active', true)
        .limit(1);

      if (practitioners && practitioners.length > 0) {
        const practitioner = practitioners[0];

        // Update thread with practitioner
        await supabase
          .from('chat_threads')
          .update({
            practitioner_id: practitioner.id,
            title: `Consultation with Dr. ${practitioner.first_name} ${practitioner.last_name}`
          })
          .eq('id', selectedThread.id);

        // Send notification message
        const notificationPayload = {
          thread_id: selectedThread.id,
          sender_id: userId,
          content: `🔗 Connected with Dr. ${practitioner.first_name} ${practitioner.last_name}. They will respond to your queries soon.`,
          metadata: { isBot: true, isNotification: true },
          created_at: new Date().toISOString(),
        };

        await supabase.from('chat_messages').insert(notificationPayload);

        // Reload thread
        const { data: updatedThread } = await supabase
          .from('chat_threads')
          .select('*')
          .eq('id', selectedThread.id)
          .single();

        if (updatedThread) {
          setSelectedThread(updatedThread);
        }
      } else {
        // No practitioners available
        const notificationPayload = {
          thread_id: selectedThread.id,
          sender_id: userId,
          content: `⏰ All practitioners are currently busy. Your message has been queued and you'll receive a response soon.`,
          metadata: { isBot: true, isNotification: true },
          created_at: new Date().toISOString(),
        };

        await supabase.from('chat_messages').insert(notificationPayload);
      }
    } catch (e) {
      console.error('[ChatWidget] connectToPractitioner error', e);
    } finally {
      setIsConnectingToPractitioner(false);
    }
  };

  // Create new thread
  const createThreadAndSend = async (title?: string) => {

    // Ensure we have a user ID (try to get it again if not)
    let currentUserId = userId;

    if (!currentUserId) {
      console.log('[ChatWidget] No userId, attempting to get from localStorage...');

      // Try localStorage
      const storedUserJson = localStorage.getItem('user');
      if (storedUserJson) {
        try {
          const parsed = JSON.parse(storedUserJson);
          if (parsed?.id) {
            currentUserId = parsed.id;
            setUserId(parsed.id); // Update state for next time
            setCurrentUser({
              id: parsed.id,
              first_name: parsed.first_name,
              last_name: parsed.last_name,
              role: parsed.role || 'patient'
            });
          }
        } catch (e) {
          console.error('[ChatWidget] Failed to parse user from localStorage:', e);
        }
      }

      // Still no user? Try Supabase one more time
      if (!currentUserId) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) {
          currentUserId = data.user.id;
          setUserId(data.user.id);
        }
      }

      // Final check
      if (!currentUserId) {
        console.error('[ChatWidget] Cannot create thread - no user ID available');
        alert('Please log in to start a conversation');
        return;
      }
    }

    console.log('[ChatWidget] Creating new thread for user:', currentUserId);

    try {
      const insertPayload: any = {
        patient_id: currentUserId,
        practitioner_id: null,
        status: 'open'
      };

      // Only add title if it's likely to exist (avoiding schema cache errors)
      // Some versions of the DB might use 'subject' or nothing at all
      if (title) {
        insertPayload.title = title;
      }

      console.log('[ChatWidget] Inserting thread:', insertPayload);

      const { data, error } = await supabase
        .from('chat_threads')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error('[ChatWidget] Supabase createThread error:', error);
        if (error.message.includes('permission') || error.message.includes('policy')) {
          alert('Permission denied. Please ensure you are logged in properly.');
        } else {
          alert(`Failed to create conversation: ${error.message}`);
        }
        return;
      }

      if (data) {
        console.log('[ChatWidget] Thread created successfully:', data.id);
        setThreads(prev => [data as Thread, ...prev]);
        setSelectedThread(data as Thread);

        // Reset quick actions to show them for new thread
        setShowQuickActions(true);

        // Send welcome message
        const welcomePayload = {
          thread_id: data.id,
          sender_id: currentUserId,
          content: `Welcome to Ayur Tribe! 🙏\n\nI'm your AI health assistant, here to help you with:\n• Understanding Ayurvedic principles\n• Booking appointments\n• Diet and lifestyle guidance\n• Connecting with practitioners\n\nHow can I assist you today?`,
          metadata: { isBot: true, botName: 'Ayur Tribe AI Assistant' },
          is_read: false,
          created_at: new Date().toISOString(),
        };

        console.log('[ChatWidget] Sending welcome message...');

        const { error: msgError } = await supabase.from('chat_messages').insert(welcomePayload);
        if (msgError) {
          console.error('[ChatWidget] Welcome message error:', msgError);
        } else {
          console.log('[ChatWidget] Welcome message sent successfully');
        }

        // Clear messages array - it will be reloaded by useEffect
        setMessages([]);
      }
    } catch (error: any) {
      console.error('[ChatWidget] createThread failed:', error);
      alert('Unable to start conversation. Please try refreshing the page.');
    }
  };


  // Handle quick action click
  const handleQuickAction = (action: any) => {
    console.log('[ChatWidget] Handling quick action:', action.id);

    if (action.query === 'CONNECT_PRACTITIONER') {
      connectToPractitioner();
    } else {
      // Send the query as a message
      sendMessage(action.query);
    }

    // Only hide quick actions after they select a non-practitioner option
    if (action.id !== 'practitioner') {
      setTimeout(() => setShowQuickActions(false), 100);
    }
  };

  // Widget UI
  return (
    <>
      {/* Floating button when collapsed */}
      {/* Floating button when collapsed */}
      {!isExpanded && (
        <motion.button
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-[#1a4731] to-[#2c5e41] rounded-full shadow-2xl flex items-center justify-center z-50 border border-white/20 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg className="w-7 h-7 text-[#e1dccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {threads.some(t => messages.some(m => !m.is_read && m.sender_id !== userId)) && (
            <span className="absolute top-3 right-3 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#141613] animate-pulse"></span>
          )}
        </motion.button>
      )}

      {/* Expanded chat widget */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-[#141613]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#1a4731] to-[#2c5e41] text-[#e1dccc] flex justify-between items-center shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-xl">🌿</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide uppercase">
                    {userDosha ? `${userDosha} Assistant` : 'Health Assistant'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[9px] text-emerald-200 font-bold uppercase tracking-tighter opacity-80 bg-white/10 px-1.5 py-0.5 rounded">Gemini 3 Flash</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Close chat"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Thread selector for practitioner view */}
            {isPractitionerView && threads.length > 1 && (
              <div className="border-b p-2 bg-gray-50">
                <select
                  value={selectedThread?.id || ''}
                  onChange={(e) => {
                    const thread = threads.find(t => t.id === e.target.value);
                    if (thread) setSelectedThread(thread);
                  }}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  {threads.map(thread => (
                    <option key={thread.id} value={thread.id}>
                      {thread.title || `Thread ${thread.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Messages area */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            >
              {messages.length === 0 && !selectedThread && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Start a conversation to get health guidance</p>
                  <button
                    onClick={() => {
                      console.log('[ChatWidget] Start button clicked');
                      createThreadAndSend('Health Consultation');
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Start New Conversation
                  </button>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${msg.sender_id === userId && !msg.isBot ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] shadow-xl transform transition-all duration-300 ${msg.sender_id === userId && !msg.isBot
                    ? 'bg-gradient-to-br from-[#1a4731] to-[#2c5e41] text-[#e1dccc] rounded-2xl rounded-tr-sm border border-white/20 shadow-emerald-900/20 hover:scale-[1.02]'
                    : msg.isBot
                      ? userDosha?.toLowerCase() === 'vata'
                        ? 'bg-gradient-to-br from-[#3d2b1f] to-[#1a120b] text-[#e1dccc] rounded-2xl rounded-tl-sm border border-amber-500/30 shadow-amber-900/30'
                        : userDosha?.toLowerCase() === 'pitta'
                          ? 'bg-gradient-to-br from-[#1a3a3a] to-[#0d1f1f] text-[#e1dccc] rounded-2xl rounded-tl-sm border border-cyan-500/30 shadow-cyan-900/30'
                          : userDosha?.toLowerCase() === 'kapha'
                            ? 'bg-gradient-to-br from-[#2d3a1a] to-[#171f0d] text-[#e1dccc] rounded-2xl rounded-tl-sm border border-lime-500/30 shadow-lime-900/30'
                            : 'bg-white/5 backdrop-blur-md text-[#e1dccc] rounded-2xl rounded-tl-sm border border-white/10'
                      : 'bg-white/10 text-[#e1dccc] rounded-2xl rounded-tl-sm border border-white/10'
                    } px-4 py-3 relative overflow-hidden group`}>

                    {/* Interior decorative glow for bot messages */}
                    {msg.isBot && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors" />
                    )}
                    {(msg.isBot || msg.sender_id !== userId) && (
                      <div className={`flex items-center mb-2 ${msg.isBot ? 'text-[#8c9489]' : 'text-[#8c9489]'
                        }`}>
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                          {msg.isBot ? '🤖 Assistant' : msg.senderRole === 'practitioner' ? `👨‍⚕️ Dr. ${msg.senderName}` : `👤 ${msg.senderName}`}
                        </span>
                      </div>
                    )}

                    <div className="text-[14px] leading-relaxed font-medium">
                      {/* Enhanced bot message formatting */}
                      {msg.isBot ? (
                        <div className="space-y-3">
                          {msg.content.split('\n\n').map((paragraph, pIdx) => (
                            <div key={pIdx}>
                              {paragraph.split('\n').map((line, lIdx) => (
                                <div key={lIdx} className={`${line.startsWith('**') ? 'font-bold text-emerald-400 text-base mt-2 mb-1' :
                                  line.startsWith('•') ? 'ml-4 text-[#8c9489] flex items-start' :
                                    line.startsWith('✅') || line.startsWith('❌') ? 'ml-2 font-medium text-[#e1dccc]' :
                                      line.startsWith('🔵') || line.startsWith('🔴') || line.startsWith('🟢') ? 'font-semibold text-[#e1dccc] bg-white/5 rounded-lg p-2 my-1' :
                                        'text-[#e1dccc]'
                                  }`}>
                                  {line.startsWith('•') && <span className="text-emerald-500 mr-2 font-bold">•</span>}
                                  <span>{line.replace(/\*\*/g, '')}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>

                    <div className={`text-xs mt-2 flex items-center justify-between ${msg.isBot ? 'text-gray-500' : 'text-white text-opacity-80'
                      }`}>
                      <span>{new Date(msg.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!msg.isBot && (
                        <span className="ml-2">
                          {msg.sender_id === userId ? '✓ Sent' : '📨 Received'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-l-4 border-purple-400 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <span className="text-sm font-medium text-purple-700">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {isConnectingToPractitioner && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-xl border border-emerald-300 shadow-md">
                    <svg className="animate-spin h-5 w-5 mr-3 text-emerald-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-semibold">Connecting to practitioner...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            {showQuickActions && selectedThread && messages.length <= 1 && (
              <div className="p-3 bg-white/5 border-t border-white/5 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#8c9489] mb-3 ml-1">Suggested Queries</p>
                <div className="flex flex-wrap gap-2">
                  {getQuickActions().map(action => (
                    <button
                      key={action.id}
                      onClick={() => {
                        console.log('[ChatWidget] Quick action clicked:', action.label);
                        handleQuickAction(action);
                        // Hide quick actions after user selects one
                        if (action.id !== 'practitioner') {
                          setShowQuickActions(false);
                        }
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold text-[#e1dccc] border border-white/10 transition-all duration-200 transform hover:scale-105 shadow-sm"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 bg-[#141613] border-t border-white/5 rounded-b-2xl">
              {!selectedThread ? (
                <button
                  onClick={() => {
                    console.log('[ChatWidget] Bottom button clicked');
                    createThreadAndSend('Health Consultation');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-[#1a4731] via-[#2c5e41] to-[#1a4731] bg-[length:200%_auto] animate-gradient-x text-[#e1dccc] rounded-xl font-black uppercase tracking-widest hover:brightness-125 transition-all duration-300 transform hover:scale-[1.02] shadow-2xl border border-white/10 flex items-center justify-center space-x-3 overflow-hidden group"
                >
                  <span className="relative z-10">🚀 Start Guided Consultation</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 blur-xl opacity-20" />
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Selected Image Preview */}
                  {selectedImage && (
                    <div className="relative inline-block mt-2 group">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-xl border-2 border-emerald-500/50 shadow-2xl transition-transform group-hover:scale-105"
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-rose-600 transition-colors border-2 border-[#141613]"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-2xl border border-white/10 focus-within:border-emerald-500/30 transition-all">
                    <label className="cursor-pointer p-3 hover:bg-white/10 rounded-xl transition-all group relative overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedImage(file);
                        }}
                      />
                      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <svg className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </label>

                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={selectedImage ? "Describe this photo for Gemini 3..." : "Ask your Ayurvedic assistant..."}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[#e1dccc] placeholder-[#8c9489] text-sm font-semibold tracking-wide"
                    />

                    <button
                      onClick={handleSend}
                      disabled={!input.trim() && !selectedImage}
                      className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed hover:brightness-110 transition-all transform hover:scale-110 active:scale-90 shadow-lg shadow-emerald-900/40"
                    >
                      <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;