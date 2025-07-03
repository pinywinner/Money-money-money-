import React, { useState, useRef, useEffect } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { MessageSquare, Send, Bot, User, Mic, X, Minimize2, Maximize2 } from 'lucide-react';
import { ChatEngine } from '../../utils/chatEngine';
import NeumorphicButton from '../ui/NeumorphicButton';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
  data?: any;
}

interface ChatAction {
  id: string;
  label: string;
  type: 'update' | 'query' | 'navigate';
  payload?: any;
}

const ChatBot: React.FC = () => {
  const { state, dispatch } = useFinancial();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '🏁 שלום! אני הטייס המשנה הדיגיטלי שלך. אני כאן לעזור לך לנהל את הכספים שלך. תוכל לשאול אותי שאלות, לעדכן עסקאות, או לקבל ייעוץ פיננסי.',
      timestamp: new Date(),
      actions: [
        { id: 'quick-balance', label: 'מה המצב הכספי שלי?', type: 'query' },
        { id: 'add-expense', label: 'הוסף הוצאה חדשה', type: 'update' },
        { id: 'budget-status', label: 'איך התקציב שלי?', type: 'query' }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatEngine = new ChatEngine(state, dispatch);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // סימולציה של זמן עיבוד
    setTimeout(async () => {
      const response = await chatEngine.processMessage(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        actions: response.actions,
        data: response.data
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // ביצוע פעולות אוטומטיות אם נדרש
      if (response.autoActions) {
        response.autoActions.forEach(action => {
          executeAction(action);
        });
      }
    }, 1000 + Math.random() * 1000);
  };

  const executeAction = (action: ChatAction) => {
    switch (action.type) {
      case 'update':
        if (action.payload) {
          // ביצוע עדכון במערכת
          if (action.payload.type === 'ADD_TRANSACTION') {
            dispatch(action.payload);
          }
        }
        break;
      case 'query':
        // ביצוע שאילתא
        handleQuickAction(action.id);
        break;
      case 'navigate':
        // ניווט לדף אחר
        if (action.payload?.route) {
          window.location.hash = action.payload.route;
        }
        break;
    }
  };

  const handleQuickAction = async (actionId: string) => {
    setIsTyping(true);
    
    const response = await chatEngine.handleQuickAction(actionId);
    
    const botMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: response.message,
      timestamp: new Date(),
      actions: response.actions,
      data: response.data
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'he-IL';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-neu flex items-center justify-center text-white hover:shadow-neu-hover transition-all duration-300 z-50 animate-pulse-glow"
      >
        <MessageSquare className="w-8 h-8" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
          AI
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 left-6 bg-white rounded-2xl shadow-neu transition-all duration-300 z-50 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">טייס משנה דיגיטלי</h3>
            <p className="text-xs opacity-90">מוכן לעזור 24/7</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 h-96 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-3 rounded-2xl shadow-neu ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white ml-2'
                        : 'bg-gray-100 text-gray-800 mr-2'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Data visualization */}
                    {message.data && (
                      <div className="mt-3 p-3 bg-white bg-opacity-10 rounded-lg">
                        {message.data.type === 'budget_summary' && (
                          <div className="space-y-2">
                            {message.data.categories.map((cat: any, index: number) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span>{cat.name}</span>
                                <span>{cat.used}/{cat.budget} ₪</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {message.data.type === 'transaction_added' && (
                          <div className="text-xs">
                            <div>✅ עסקה נוספה בהצלחה</div>
                            <div>{message.data.transaction.description}: {message.data.transaction.amount} ₪</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.actions.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => executeAction(action)}
                            className="w-full text-xs p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-right"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.type === 'user' ? 'text-left' : 'text-right'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' ? 'order-1 bg-blue-100' : 'order-2 bg-gray-200'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-3 shadow-neu">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="כתוב הודעה או שאל שאלה..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl shadow-inner-neu focus:outline-none text-sm"
                  disabled={isTyping}
                />
                <button
                  onClick={handleVoiceInput}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                    isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-3 bg-blue-500 text-white rounded-xl shadow-neu hover:shadow-neu-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick suggestions */}
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {[
                'מה הוצאתי היום?',
                'הוסף 50 ש"ח לקניות',
                'איך התקציב שלי?',
                'מה המטרות שלי?'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(suggestion)}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs whitespace-nowrap shadow-neu hover:shadow-neu-hover transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;