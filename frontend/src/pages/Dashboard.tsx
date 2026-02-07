import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, Book, Activity, PieChart, FileImage, X, ChevronRight, BarChart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Trend {
    id: number;
    title: string;
    description: string;
    metrics: string;
    impact: string;
    progress: number;
}

const StatCard = ({ title, value, icon: Icon, delay }: { title: string, value: string, icon: any, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-primary/30 transition-all group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                +2.5%
            </span>
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-400">{title}</p>
    </motion.div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
    const [isAnalysing, setIsAnalysing] = useState(false);
    const [analysedData, setAnalysedData] = useState(false);

    const trends: Trend[] = [
        {
            id: 1,
            title: "Transformers in Quantitative Finance",
            description: "An exploration of how attention-based models are revolutionizing high-frequency trading and risk management. This trend focuses on the shift from LSTM architectures to specialized Transformer blocks for time-series forecasting in volatile markets.",
            metrics: "24 new papers this week",
            impact: "High Impact",
            progress: 85
        },
        {
            id: 2,
            title: "Zero-Shot Molecular Discovery",
            description: "Using large language models (LLMs) to predict molecular properties and synthesize new compounds without task-specific training. This surge in biotech research is driven by multimodal models that can bridge chemical structures and natural language descriptions.",
            metrics: "18 new papers this week",
            impact: "Emerging",
            progress: 65
        },
        {
            id: 3,
            title: "Edge AI for Remote Sensing",
            description: "Implementing localized intelligence on lower-power devices for real-time satellite imagery analysis. Key research areas include model compression (quantization and pruning) specifically tailored for environmental monitoring applications.",
            metrics: "12 new papers this week",
            impact: "Steady Growth",
            progress: 45
        }
    ];

    const handleStartAnalysis = () => {
        setIsAnalysing(true);
        setTimeout(() => {
            setIsAnalysing(false);
            setAnalysedData(true);
        }, 3000);
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-end gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 mb-2">
                        Welcome back, Researcher
                    </h1>
                    <p className="text-gray-400">Here's what's happening in your research world today.</p>
                </div>
                <button
                    onClick={() => navigate('/tasks')}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>New Research Task</span>
                </button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Projects" value="4" icon={Book} delay={0.1} />
                <StatCard title="Papers Analyzed" value="128" icon={TrendingUp} delay={0.2} />
                <StatCard title="Research Hours" value="32h" icon={Clock} delay={0.3} />
                <StatCard title="Insights Found" value="842" icon={Sparkles} delay={0.4} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trending Topics - Large Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className={cn(
                        "lg:col-span-2 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col"
                    )}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3" />

                    <div className="relative z-10">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Recent Analytics
                        </h2>

                        <div className="space-y-4">
                            {trends.map((trend, i) => (
                                <div
                                    key={trend.id}
                                    onClick={() => setSelectedTrend(trend)}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center font-bold text-gray-500 group-hover:text-primary transition-colors">
                                        0{i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium mb-1">{trend.title}</h4>
                                        <p className="text-xs text-gray-500">{trend.metrics} • {trend.impact}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-8 rounded-full bg-white/5 flex items-center justify-center hidden sm:flex">
                                            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${trend.progress}%` }} />
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions / Agents */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col"
                >
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-secondary" />
                        Agent Status
                    </h2>
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                                <span className="text-sm font-medium">Discovery Agent</span>
                            </div>
                            <span className="text-xs text-gray-500">Idle</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
                                <span className="text-sm font-medium">Analytics Analyzer</span>
                            </div>
                            <span className="text-xs text-blue-400">Active</span>
                        </div>
                    </div>

                    <div className="mt-auto border-t border-white/5 pt-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-primary" />
                            Analytics Tool
                        </h3>

                        {!analysedData && !isAnalysing ? (
                            <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-8 text-center">
                                <FileImage className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                                <p className="text-xs text-gray-500 mb-4">Upload research data visualization to analyze</p>
                                <button
                                    onClick={handleStartAnalysis}
                                    className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 px-4 rounded-lg transition-all border border-white/10"
                                >
                                    Select Image
                                </button>
                            </div>
                        ) : isAnalysing ? (
                            <div className="bg-black/20 border border-white/10 rounded-xl p-8 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                                <p className="text-xs text-primary font-medium animate-pulse">Running Visual Synthesis...</p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-bold text-primary uppercase">Analysis Result</span>
                                    <BarChart className="w-3 h-3 text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '74%' }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400">
                                        <span>Statistical Confidence</span>
                                        <span className="text-white">74.2%</span>
                                    </div>
                                    <p className="text-[11px] text-gray-300 leading-relaxed italic">
                                        "Potential upward trajectory detected in temporal feature extraction. High correlation with current Transformer trends."
                                    </p>
                                </div>
                                <button
                                    onClick={() => setAnalysedData(false)}
                                    className="w-full mt-4 text-[10px] text-gray-500 hover:text-white transition-colors"
                                >
                                    Reset Analyzer
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Trend Detail Modal */}
            <AnimatePresence>
                {selectedTrend && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface/90 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Analytics Insight
                                </h3>
                                <button
                                    onClick={() => setSelectedTrend(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-sm text-primary uppercase font-bold tracking-widest mb-1">Topic</h4>
                                    <p className="text-xl font-bold text-white">{selectedTrend.title}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm text-gray-500 uppercase font-bold tracking-widest mb-2">Detailed Analysis</h4>
                                    <p className="text-gray-300 leading-relaxed text-sm">
                                        {selectedTrend.description}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <h5 className="text-[10px] text-gray-500 uppercase mb-1">Weekly Volume</h5>
                                        <p className="text-white font-bold text-sm tracking-tight">{selectedTrend.metrics}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <h5 className="text-[10px] text-gray-500 uppercase mb-1">Status</h5>
                                        <p className="text-primary font-bold text-sm tracking-tight">{selectedTrend.impact}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={() => setSelectedTrend(null)}
                                    className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-6 rounded-lg transition-all"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
