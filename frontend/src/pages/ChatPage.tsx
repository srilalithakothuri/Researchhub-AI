import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Mic, Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../services/api';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface Chat {
    id: number;
    title: string;
    created_at: string;
}

const ChatPage = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        if (currentChatId) {
            loadMessages(currentChatId);
        }
    }, [currentChatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChats = async () => {
        try {
            const response = await api.get('/chat/');
            setChats(response.data);
        } catch (error) {
            console.error('Failed to load chats:', error);
        }
    };

    const loadMessages = async (chatId: number) => {
        try {
            const response = await api.get(`/chat/${chatId}`);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const createNewChat = async () => {
        try {
            const response = await api.post('/chat/', { title: 'New Chat' });
            setChats([response.data, ...chats]);
            setCurrentChatId(response.data.id);
            setMessages([]);
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !currentChatId) return;

        const userMessage = input;
        setInput('');
        setLoading(true);

        // Optimistically add user message
        const tempUserMsg: Message = {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages([...messages, tempUserMsg]);

        try {
            const response = await api.post(`/chat/${currentChatId}/message`, {
                content: userMessage,
            });

            // Add AI response
            setMessages((prev) => [...prev.slice(0, -1), tempUserMsg, response.data]);
            loadChats(); // Refresh chat list to update title
        } catch (error: any) {
            console.error('Failed to send message:', error);
            alert(error.response?.data?.detail || 'Failed to send message. Make sure GROQ_API_KEY is set in backend/.env');
        } finally {
            setLoading(false);
        }
    };

    const toggleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Speech Recognition is not supported in this browser. Please try Chrome or Edge.');
            return;
        }

        if (isListening) {
            // Logic to stop if manually desired, but usually SpeechRecognition stops on its own
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const deleteChat = async (chatId: number) => {
        try {
            await api.delete(`/chat/${chatId}`);
            setChats(chats.filter((c) => c.id !== chatId));
            if (currentChatId === chatId) {
                setCurrentChatId(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    };

    const filteredMessages = messages.filter((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Sidebar - Chat History */}
            <div className="w-80 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col">
                <button
                    onClick={createNewChat}
                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-xl mb-4 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Chat
                </button>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setCurrentChatId(chat.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-all group flex items-center justify-between ${currentChatId === chat.id
                                ? 'bg-primary/20 border border-primary/30'
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{chat.title}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(chat.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChat(chat.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                            >
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col">
                {currentChatId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold text-white">Research Assistant</h2>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 w-64"
                                />
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <AnimatePresence>
                                {filteredMessages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl p-4 ${msg.role === 'user'
                                                ? 'bg-primary text-black'
                                                : 'bg-white/5 text-white border border-white/10'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <p className="text-xs mt-2 opacity-60">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleVoiceInput}
                                    className={cn(
                                        "p-3 rounded-xl transition-all relative overflow-hidden",
                                        isListening
                                            ? "bg-primary text-black shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                                            : "bg-white/5 hover:bg-white/10 text-gray-400"
                                    )}
                                >
                                    <Mic className={cn("w-5 h-5", isListening && "animate-pulse")} />
                                    {isListening && (
                                        <motion.div
                                            layoutId="mic-bg"
                                            className="absolute inset-0 bg-primary/20 animate-ping"
                                        />
                                    )}
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask me anything about your research..."
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50"
                                    disabled={loading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={loading || !input.trim()}
                                    className="p-3 bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 text-black animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 text-black" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Start a New Conversation</h3>
                            <p className="text-gray-400">Create a new chat to begin your research journey</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
