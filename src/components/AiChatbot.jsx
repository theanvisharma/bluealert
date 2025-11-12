import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, Loader2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// NOTE: This chatbot uses the Gemini API for live, grounded search results.

// 1. API Configuration - The API key will be dynamically injected at runtime.
const SYSTEM_PROMPT = "You are the Maharashtra Flood Bot, a highly accurate, professional, and concise information assistant. Your sole purpose is to provide specific, up-to-date, and grounded information about floods, extreme rainfall, warnings, and weather alerts EXCLUSIVELY within Maharashtra, India. Respond professionally and use Google Search results as your source. If the query is outside Maharashtra or cannot be answered with factual data, politely state your specialization.";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";


// 2. Utility function for robust API calls (with exponential backoff)
const fetchWithBackoff = async (url, options) => {
  const MAX_RETRIES = 3;
  let delay = 1000;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(url, options);
      
      // Attempt to read the error body for detailed logging
      if (!response.ok) {
        let errorDetails = `Status: ${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.json();
          errorDetails += `, Details: ${JSON.stringify(errorBody)}`;
          console.error("API Error Response (Details):", errorBody); // Log JSON body
        } catch (e) {
          errorDetails += ` (Could not parse error JSON)`;
          console.error("API Error Response (Text):", await response.text()); // Log raw text
        }
        throw new Error(errorDetails);
      }
      return response;
    } catch (error) {
      console.warn(`API call failed (Attempt ${i + 1}/${MAX_RETRIES}): ${error.message}`);
      if (i === MAX_RETRIES - 1) {
          // Final failure, throw the error
          console.error("Final API call failure. Please check network/permissions.");
          throw error; 
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};


// 3. Main Gemini API Call Function
const getAiResponse = async (query, chatHistory) => {
    // 🛑 IMPORTANT: Replace "PASTE_YOUR_VALID_API_KEY_HERE" with your actual Gemini API key.
    const apiKey = "AIzaSyD5POKv_CheeldjMx1sA0p9S_s1CNngyMc"; 
    
    // Construct the URL with the key.
    let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    if (!apiKey || apiKey === "PASTE_YOUR_VALID_API_KEY_HERE") {
        return { text: "API key is missing or invalid. Please update the AiChatbot.jsx file with your valid Gemini API key to enable the flood alert system.", sources: [] };
    }

    try {
        const historyForApi = chatHistory.map(msg => ({
            role: msg.sender === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        const payload = {
            contents: [...historyForApi, { role: 'user', parts: [{ text: query }] }],
            // Enable Google Search for grounding data
            tools: [{ "google_search": {} }],
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
        };

        const response = await fetchWithBackoff(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (!candidate || !candidate.content?.parts?.[0]?.text) {
            console.error("Gemini API returned no text:", result);
            return { text: "Sorry, I couldn't process that query right now. The AI returned no content.", sources: [] };
        }

        let text = candidate.content.parts[0].text;
        
        // Remove Markdown bolding for cleaner chat display
        text = text.replace(/\*\*/g, '');

        let sources = [];
        const groundingMetadata = candidate.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingAttributions) {
            sources = groundingMetadata.groundingAttributions
                .map(attribution => ({
                    uri: attribution.web?.uri,
                    title: attribution.web?.title,
                }))
                .filter(source => source.uri && source.title);
        }

        return { text, sources };

    } catch (error) {
        console.error("Caught error during AI response process:", error);
        // The detailed error is logged inside fetchWithBackoff, here we return a generic message
        return { text: "An error occurred while connecting to the alert system. Check the console for API details.", sources: [] };
    }
};

// 4. Message Bubble Component
const MessageBubble = ({ text, sender, sources }) => {
    const isUser = sender === 'user';
    
    return (
        <div 
            className={`p-3 rounded-xl whitespace-pre-wrap max-w-[85%] text-sm shadow-md ${
                isUser 
                ? "bg-cyan-600 text-white ml-auto" 
                : "bg-slate-700 text-gray-200 mr-auto"
            }`}
        >
            {text}
            {sources && sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-gray-400">
                    <p className="font-semibold mb-1">Source(s):</p>
                    {sources.slice(0, 2).map((source, index) => (
                        <a 
                            key={index} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block truncate hover:text-cyan-400"
                            title={source.title}
                        >
                            <Search size={10} className="inline mr-1" /> {source.title || source.uri}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};


// 5. AI Chatbot Component
const AiChatbot = () => {
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hello! I am your Maharashtra Flood Bot 🌊. Ask me about rainfall, flood risks, or alerts in any Maharashtra district.",
            sources: []
        },
    ]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userQuery = input.trim();
        const userMsg = { sender: "user", text: userQuery, sources: [] };
        
        // Add user message to state immediately
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const aiResponse = await getAiResponse(userQuery, messages);
            
            // Add AI response to state
            setMessages(prev => [...prev, { 
                sender: "bot", 
                text: aiResponse.text, 
                sources: aiResponse.sources 
            }]);

        } catch (error) {
            // The detailed error is logged inside fetchWithBackoff
            setMessages(prev => [...prev, { 
                sender: "bot", 
                text: "An error occurred while connecting to the alert system. Check the console for API details.",
                sources: []
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* 1. The Floating Chat Icon (Always fixed) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                // 🟢 CLEANED UP: Changed z-[9999] back to z-50 and removed red border
                className="fixed bottom-8 right-8 z-50 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg shadow-cyan-800/50 transition-transform hover:scale-105" 
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {/* 2. The Floating Chat Window (Appears when isOpen is true) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        // 🟢 CLEANED UP: Fixed position, standard z-index
                        className="fixed bottom-24 right-8 w-96 h-[500px] bg-slate-900 text-white border border-cyan-700 rounded-2xl shadow-2xl shadow-cyan-900/40 flex flex-col z-50"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-4 py-3 border-b border-cyan-700 bg-slate-800 rounded-t-2xl">
                            <h2 className="text-lg font-semibold text-cyan-400">Maharashtra Flood Chatbot</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white text-2xl font-bold leading-none p-1 transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-900">
                            {messages.map((msg, i) => (
                                <MessageBubble 
                                    key={i} 
                                    text={msg.text} 
                                    sender={msg.sender} 
                                    sources={msg.sources} 
                                />
                            ))}
                            {/* Loading Indicator */}
                            {isLoading && (
                                <div className="p-3 mr-auto bg-slate-700 text-gray-200 rounded-xl max-w-[85%] text-sm shadow-md">
                                    <Loader2 size={16} className="animate-spin inline mr-2" /> Typing...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="flex border-t border-cyan-700 p-2 bg-slate-800 rounded-b-2xl">
                            <input
                                type="text"
                                className="flex-1 p-2 bg-slate-700 text-white border-none rounded-l-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Ask about floods in Maharashtra..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                className={`bg-cyan-600 text-white px-4 rounded-r-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-700'}`}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AiChatbot;