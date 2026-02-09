<<<<<<< HEAD
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Mic, Search, Plus, Trash2, Loader2, Volume2, VolumeX, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../services/api';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    image_url?: string;
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
    const [searchQuery, setSearchQuery] = useState(''); // For message search
    const [chatSearchQuery, setChatSearchQuery] = useState(''); // For chat title search
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speakingId, setSpeakingId] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
    }, [currentChatId]);

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

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
        if ((!input.trim() && !selectedImage) || !currentChatId) return;

        const userMessage = input;
        const currentImage = imagePreview;
        setInput('');
        removeImage();
        setLoading(true);

        // Optimistically add user message
        const tempUserMsg: Message = {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            image_url: currentImage || undefined,
            timestamp: new Date().toISOString(),
        };
        setMessages([...messages, tempUserMsg]);

        try {
            const formData = new FormData();
            if (userMessage) formData.append('content', userMessage);
            if (selectedImage) formData.append('image', selectedImage);

            const response = await api.post(`/chat/${currentChatId}/message`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Add AI response
            setMessages((prev) => [...prev.slice(0, -1), tempUserMsg, response.data]);
            loadChats(); // Refresh chat list to update title
        } catch (error: any) {
            console.error('Failed to send message:', error);
            const detail = error.response?.data?.detail;
            let detailMsg = '';

            if (typeof detail === 'string') {
                detailMsg = detail;
            } else if (Array.isArray(detail)) {
                detailMsg = detail.map((d: any) => d.msg).join(', ');
            } else if (typeof detail === 'object' && detail !== null) {
                detailMsg = JSON.stringify(detail);
            }

            const message = detailMsg
                ? `Error: ${detailMsg}`
                : 'Failed to send message. Please check the console for details or verify your GROQ_API_KEY in backend/.env';

            alert(message);
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

    const toggleSpeech = (text: string, messageId: number) => {
        if (speakingId === messageId) {
            window.speechSynthesis.cancel();
            setSpeakingId(null);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);

        setSpeakingId(messageId);
        window.speechSynthesis.speak(utterance);
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

    const filteredChats = chats.filter((chat) =>
        chat.title.toLowerCase().includes(chatSearchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4 relative overflow-hidden">
            {/* Sidebar - Chat History */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        className="w-80 bg-surface/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col absolute inset-y-0 z-50 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Chat History</h3>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                value={chatSearchQuery}
                                onChange={(e) => setChatSearchQuery(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {filteredChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => {
                                        setCurrentChatId(chat.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`p-3 rounded-xl cursor-pointer transition-all group flex items-center justify-between ${currentChatId === chat.id
                                        ? 'bg-primary/20 border border-primary/30'
                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{chat.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            {new Date(chat.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChat(chat.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            ))}
                            {filteredChats.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-500">No chats found</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col">
                {currentChatId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface/60 backdrop-blur-md sticky top-0 z-40">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all border flex items-center gap-2",
                                        isSidebarOpen
                                            ? "bg-primary/20 border-primary/30 text-primary"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                    )}
                                    title="Chat History"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span className="text-sm font-medium">History</span>
                                </button>
                                <button
                                    onClick={createNewChat}
                                    className="p-2.5 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="text-sm">New Chat</span>
                                </button>
                                <div className="h-6 w-px bg-white/10 mx-2" />
                                <h2 className="text-sm font-semibold text-white/90 hidden md:block">Research Assistant</h2>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 w-48 md:w-64 transition-all"
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
                                            className={`max-w-[70%] rounded-2xl p-4 relative group/msg ${msg.role === 'user'
                                                ? 'bg-primary text-black'
                                                : 'bg-white/5 text-white border border-white/10'
                                                }`}
                                        >
                                            {msg.image_url && (
                                                <div className="mb-3 rounded-lg overflow-hidden border border-black/10">
                                                    <img src={msg.image_url} alt="Uploaded" className="max-w-full h-auto" />
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            {msg.role === 'assistant' && (
                                                <button
                                                    onClick={() => toggleSpeech(msg.content, msg.id)}
                                                    className="absolute -right-10 top-2 p-2 rounded-full bg-white/5 hover:bg-white/10 opacity-0 group-hover/msg:opacity-100 transition-all text-gray-400 hover:text-primary"
                                                >
                                                    {speakingId === msg.id ? (
                                                        <VolumeX className="w-4 h-4" />
                                                    ) : (
                                                        <Volume2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10">
                            {imagePreview && (
                                <div className="mb-4 relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-primary/30" />
                                    <button
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-3 rounded-xl transition-all ${selectedImage ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder={selectedImage ? "Add a caption or ask about this image..." : "Ask your research assistant..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-primary/50"
                                    />
                                    <button
                                        onClick={toggleVoiceInput}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'text-primary animate-pulse bg-primary/10' : 'text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        <Mic className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    disabled={loading || (!input.trim() && !selectedImage)}
                                    onClick={sendMessage}
                                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black p-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Research hub AI</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Start a new conversation to explore documents, analyze data, and get research insights.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                                >
                                    <Sparkles className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium text-white">View History</span>
                                </button>
                                <button
                                    onClick={createNewChat}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-primary hover:bg-primary/90 border border-primary/10 transition-all group"
                                >
                                    <Plus className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium text-black">New Chat</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
=======
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
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
