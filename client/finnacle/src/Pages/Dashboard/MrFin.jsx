import { useState , useRef} from 'react';
import { Bot, Send, Loader2, User, ArrowDown } from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/ApiPaths';

export default function MrFin() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);


  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const askLLM = async () => {
    if (!question.trim()) return;
    
    // Add user question to chat history
    const userMessage = { type: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.MRFIN.CHAT, {
        userQuestion: question
      });
      
      // Add bot response to chat history
      setChatHistory(prev => [...prev, { type: 'bot', content: res.data.response }]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error processing your request.',
        error: true
      }]);
      setTimeout(scrollToBottom, 100);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askLLM();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 mt-20">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-6 w-6 mr-3" />
            <h2 className="text-xl font-bold">Mr.Fin</h2>
          </div>
          <div className="text-sm font-medium">Your Financial Assistant</div>
        </div>
        
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Bot size={48} className="mb-4 text-emerald-500" />
              <p className="text-center font-medium text-gray-600 mb-2">Welcome to Mr.Fin!</p>
              <p className="text-center text-sm max-w-md">Ask me anything about your finances, investments, budget tracking, or financial advice.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start max-w-3/4">
                    {message.type === 'bot' && (
                      <div className="bg-emerald-500 text-white p-2 rounded-full mr-2 flex-shrink-0">
                        <Bot size={16} />
                      </div>
                    )}
                    <div 
                      className={`p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none shadow-sm' 
                          : message.error 
                            ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-none' 
                            : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.type === 'user' && (
                      <div className="bg-gray-700 text-white p-2 rounded-full ml-2 flex-shrink-0">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {chatHistory.length > 4 && (
                <div className="flex justify-center">
                  <button 
                    onClick={() => {
                      setAutoScroll(true);
                      scrollToBottom();
                    }}
                    className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full shadow-sm transition-colors"
                  >
                    <ArrowDown size={12} className="mr-1" />
                    Scroll to bottom
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="flex-grow mr-3 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Ask Mr.Fin about your finances..."
            />
            <button
              onClick={askLLM}
              disabled={loading || !question.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</p>
            {loading && <p className="text-xs text-emerald-600 animate-pulse">Mr.Fin is thinking...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}