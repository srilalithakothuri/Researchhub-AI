import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity, BookOpen, MessageSquare, Target } from 'lucide-react';
import api from '../services/api';

const AnalyticsPage = () => {
    const [stats, setStats] = useState({
        papers: 0,
        chats: 0,
        tasks: 0,
        completionRate: 0,
    });

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [papersRes, chatsRes, tasksRes] = await Promise.all([
                api.get('/papers/'),
                api.get('/chat/'),
                api.get('/tasks/stats'),
            ]);

            setStats({
                papers: papersRes.data.length,
                chats: chatsRes.data.length,
                tasks: tasksRes.data.total,
                completionRate: tasksRes.data.completion_rate || 0,
            });
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-sm text-gray-400">{label}</p>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Research Analytics</h1>
                <p className="text-gray-400 mt-1">Track your research progress and insights</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={BookOpen}
                    label="Research Papers"
                    value={stats.papers}
                    color="bg-blue-500/20 text-blue-400"
                    delay={0}
                />
                <StatCard
                    icon={MessageSquare}
                    label="AI Conversations"
                    value={stats.chats}
                    color="bg-purple-500/20 text-purple-400"
                    delay={0.1}
                />
                <StatCard
                    icon={Target}
                    label="Total Tasks"
                    value={stats.tasks}
                    color="bg-green-500/20 text-green-400"
                    delay={0.2}
                />
                <StatCard
                    icon={Activity}
                    label="Completion Rate"
                    value={`${stats.completionRate.toFixed(0)}%`}
                    color="bg-primary/20 text-primary"
                    delay={0.3}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Research Activity */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-white">Research Activity</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Papers Uploaded</span>
                                <span className="text-white font-semibold">{stats.papers}</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                    style={{ width: `${Math.min((stats.papers / 10) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">AI Chats</span>
                                <span className="text-white font-semibold">{stats.chats}</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                                    style={{ width: `${Math.min((stats.chats / 20) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Tasks Completed</span>
                                <span className="text-white font-semibold">{stats.completionRate.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                    style={{ width: `${stats.completionRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Insights */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-white">AI Insights</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Research Momentum</h4>
                                    <p className="text-sm text-gray-400">
                                        You've uploaded {stats.papers} papers and had {stats.chats} AI conversations. Keep up the great work!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Target className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Task Performance</h4>
                                    <p className="text-sm text-gray-400">
                                        {stats.completionRate > 70
                                            ? 'Excellent task completion rate! You\'re staying on track.'
                                            : 'Consider breaking down larger tasks into smaller, manageable steps.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <BookOpen className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Library Growth</h4>
                                    <p className="text-sm text-gray-400">
                                        {stats.papers > 5
                                            ? 'Your research library is growing! Consider organizing papers by topic.'
                                            : 'Upload more papers to build a comprehensive research library.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Weekly Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
                <h2 className="text-xl font-semibold text-white mb-6">Weekly Overview</h2>
                <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <div key={day} className="text-center">
                            <p className="text-xs text-gray-500 mb-2">{day}</p>
                            <div
                                className={`h-24 rounded-lg ${i < 5 ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                <div className="h-full flex items-end justify-center p-2">
                                    <div
                                        className={`w-full rounded ${i < 5 ? 'bg-primary' : 'bg-gray-600'}`}
                                        style={{ height: `${Math.random() * 60 + 20}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default AnalyticsPage;
