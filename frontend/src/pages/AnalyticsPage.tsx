<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Activity, BookOpen, MessageSquare, Target, Calendar as CalendarIcon, Flame, Clock, Zap } from 'lucide-react';
import api from '../services/api';

const AnalyticsPage = () => {
    const [stats, setStats] = useState({
        papers: 0,
        chats: 0,
        tasks: 0,
        completionRate: 0,
    });

    const [activityData, setActivityData] = useState<ActivityData>({
        papers: [],
        chats: [],
        tasks: { total: 0, completed: 0, completion_rate: 0 }
    });

    const [weeklyActivity, setWeeklyActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [hourlyActivity, setHourlyActivity] = useState<number[]>(new Array(24).fill(0));
    const [streak, setStreak] = useState({ current: 0, longest: 0 });

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

            const papers = papersRes.data;
            const chats = chatsRes.data;
            const tasks = tasksRes.data;

            setActivityData({ papers, chats, tasks });

            setStats({
                papers: papers.length,
                chats: chats.length,
                tasks: tasks.total,
                completionRate: tasks.completion_rate || 0,
            });

            // Calculate weekly activity
            calculateWeeklyActivity(papers, chats);

            // Calculate hourly activity
            calculateHourlyActivity(papers, chats);

            // Calculate streaks
            calculateStreaks(papers, chats);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    const calculateWeeklyActivity = (papers: any[], chats: any[]) => {
        const today = new Date();
        const weekActivity = new Array(7).fill(0);

        // Get Monday of current week
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);

        [...papers, ...chats].forEach(item => {
            const itemDate = new Date(item.uploaded_at || item.created_at);
            const daysDiff = Math.floor((itemDate.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff >= 0 && daysDiff < 7) {
                weekActivity[daysDiff]++;
            }
        });

        setWeeklyActivity(weekActivity);
    };

    const calculateHourlyActivity = (papers: any[], chats: any[]) => {
        const hourly = new Array(24).fill(0);

        [...papers, ...chats].forEach(item => {
            const itemDate = new Date(item.uploaded_at || item.created_at);
            const hour = itemDate.getHours();
            hourly[hour]++;
        });

        setHourlyActivity(hourly);
    };

    const calculateStreaks = (papers: any[], chats: any[]) => {
        const allDates = [...papers, ...chats]
            .map(item => new Date(item.uploaded_at || item.created_at))
            .map(date => date.toDateString())
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        // Calculate current streak
        if (allDates.includes(today) || allDates.includes(yesterday)) {
            currentStreak = 1;
            let checkDate = new Date(allDates.includes(today) ? today : yesterday);

            for (let i = 1; i < allDates.length; i++) {
                checkDate.setDate(checkDate.getDate() - 1);
                if (allDates.includes(checkDate.toDateString())) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        for (let i = 0; i < allDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prevDate = new Date(allDates[i - 1]);
                const currDate = new Date(allDates[i]);
                const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        setStreak({ current: currentStreak, longest: longestStreak });
    };

    const daysWorked = weeklyActivity.filter(count => count > 0).length;
    const consistencyPercentage = (daysWorked / 7) * 100;
    const totalHoursWorked = hourlyActivity.reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0);
    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    const maxHourlyActivity = Math.max(...hourlyActivity, 1);

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

            {/* Streak and Consistency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-500/20 rounded-xl">
                            <Flame className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{streak.current} Days</h3>
                            <p className="text-sm text-gray-400">Current Streak</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Longest: {streak.longest} days</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <CalendarIcon className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{daysWorked}/7 Days</h3>
                            <p className="text-sm text-gray-400">Active This Week</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Consistency: {consistencyPercentage.toFixed(0)}%</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{totalHoursWorked}h</h3>
                            <p className="text-sm text-gray-400">Hours Worked</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Peak: {peakHour}:00 - {peakHour + 1}:00</p>
                </motion.div>
            </div>

            {/* Weekly Calendar View */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-white">Weekly Overview</h2>
                </div>
                <div className="grid grid-cols-7 gap-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const isActive = weeklyActivity[i] > 0;
                        const activityLevel = Math.min((weeklyActivity[i] / Math.max(...weeklyActivity, 1)) * 100, 100);

                        return (
                            <div key={day} className="text-center">
                                <p className="text-xs text-gray-500 mb-2 font-medium">{day}</p>
                                <div
                                    className={`h-28 rounded-xl border transition-all ${isActive
                                        ? 'bg-primary/20 border-primary/40 hover:border-primary/60'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    title={`${weeklyActivity[i]} activities`}
                                >
                                    <div className="h-full flex flex-col items-center justify-end p-3">
                                        <div className="text-xs text-gray-400 mb-2">{weeklyActivity[i]}</div>
                                        <div
                                            className={`w-full rounded-lg ${isActive ? 'bg-primary' : 'bg-gray-600'}`}
                                            style={{ height: `${activityLevel}%`, minHeight: isActive ? '20%' : '10%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Hourly Work Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-white">Hourly Activity Breakdown</h2>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    {hourlyActivity.map((count, hour) => {
                        const percentage = (count / maxHourlyActivity) * 100;
                        const isPeak = hour === peakHour && count > 0;

                        return (
                            <div key={hour} className="text-center">
                                <div
                                    className={`h-16 rounded-lg transition-all ${isPeak
                                        ? 'bg-primary border-2 border-primary'
                                        : count > 0
                                            ? 'bg-primary/40 border border-primary/20'
                                            : 'bg-white/5 border border-white/10'
                                        }`}
                                    title={`${hour}:00 - ${count} activities (${((count / (stats.papers + stats.chats)) * 100).toFixed(1)}%)`}
                                >
                                    <div className="h-full flex items-end justify-center p-1">
                                        <div
                                            className={`w-full rounded ${count > 0 ? 'bg-primary' : 'bg-gray-700'}`}
                                            style={{ height: `${percentage}%`, minHeight: count > 0 ? '20%' : '10%' }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">{hour}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary"></div>
                        <span>Peak Hour</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary/40"></div>
                        <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-white/5"></div>
                        <span>Inactive</span>
                    </div>
                </div>
            </motion.div>

            {/* Charts and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Research Activity */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.65 }}
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

                {/* AI Insights */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Zap className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-white">AI Insights</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Streak Insight */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-lg">
                                    <Flame className="w-4 h-4 text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Consistency Streak</h4>
                                    <p className="text-sm text-gray-400">
                                        {streak.current > 0
                                            ? `Great job! You're on a ${streak.current}-day streak. Keep the momentum going!`
                                            : 'Start a new streak today by uploading a paper or creating a chat!'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Productivity Pattern */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Peak Productivity</h4>
                                    <p className="text-sm text-gray-400">
                                        {hourlyActivity[peakHour] > 0
                                            ? `You're most productive around ${peakHour}:00. Schedule important tasks during this time!`
                                            : 'Upload more content to discover your peak productivity hours.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Performance */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Weekly Performance</h4>
                                    <p className="text-sm text-gray-400">
                                        {consistencyPercentage >= 70
                                            ? `Excellent! You worked ${daysWorked} out of 7 days this week (${consistencyPercentage.toFixed(0)}% consistency).`
                                            : consistencyPercentage >= 40
                                                ? `You worked ${daysWorked} days this week. Try to maintain at least 5 days for better consistency.`
                                                : 'Aim to work at least 5 days per week to build a strong research habit.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Task Performance */}
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Target className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Task Completion</h4>
                                    <p className="text-sm text-gray-400">
                                        {stats.completionRate >= 80
                                            ? `Outstanding! ${stats.completionRate.toFixed(0)}% completion rate shows excellent task management.`
                                            : stats.completionRate >= 50
                                                ? `Good progress at ${stats.completionRate.toFixed(0)}%. Break larger tasks into smaller steps to improve.`
                                                : 'Focus on completing smaller tasks first to build momentum and improve your completion rate.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
=======
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
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
