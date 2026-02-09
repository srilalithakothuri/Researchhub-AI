<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, CheckCircle2, Circle, Trash2, TrendingUp, Target, Edit2 } from 'lucide-react';
import api from '../services/api';

interface Task {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    completed: boolean;
    priority: string;
    created_at: string;
}

interface TaskStats {
    total: number;
    completed: number;
    pending: number;
    completion_rate: number;
    consistency: Array<{ date: string; completed: number }>;
}

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [showNewTask, setShowNewTask] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
    });

    useEffect(() => {
        loadTasks();
        loadStats();
    }, []);

    useEffect(() => {
        if (tasks.length > 0 && Notification.permission !== 'denied') {
            checkReminders();
        }
    }, [tasks]);

    const checkReminders = async () => {
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }

        if (Notification.permission === 'granted') {
            const now = new Date();
            tasks.forEach(task => {
                if (!task.completed && task.due_date) {
                    const due = new Date(task.due_date);
                    const diffTime = due.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1 || diffDays === 2) {
                        new Notification('Task Reminder', {
                            body: `"${task.title}" is due in ${diffDays} day${diffDays > 1 ? 's' : ''}!`,
                            icon: '/favicon.ico'
                        });
                    }
                }
            });
        }
    };

    const loadTasks = async () => {
        try {
            const response = await api.get('/tasks/');
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get('/tasks/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const createTask = async () => {
        if (!newTask.title) return;
        if (!newTask.due_date) {
            alert('Due date is mandatory to create a task.');
            return;
        }

        try {
            await api.post('/tasks/', {
                ...newTask,
                due_date: newTask.due_date || null,
            });
            setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
            setShowNewTask(false);
            loadTasks();
            loadStats();
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const updateTask = async () => {
        if (!editingTask || !editingTask.title) return;
        if (!editingTask.due_date) {
            alert('Due date is mandatory.');
            return;
        }

        try {
            await api.put(`/tasks/${editingTask.id}`, {
                title: editingTask.title,
                description: editingTask.description,
                due_date: editingTask.due_date || null,
                priority: editingTask.priority,
            });
            setEditingTask(null);
            loadTasks();
            loadStats();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const toggleTask = async (task: Task) => {
        try {
            await api.put(`/tasks/${task.id}`, { completed: !task.completed });
            loadTasks();
            loadStats();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter((t) => t.id !== taskId));
            loadStats();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'medium':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low':
                return 'text-green-400 bg-green-500/10 border-green-500/20';
            default:
                return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityMap: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
        return priorityMap[b.priority] - priorityMap[a.priority];
    });

    const getDueDateInfo = (dueDate: string | null) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                text: `Overdue (${Math.abs(diffDays)}d ago)`,
                color: 'text-red-400 bg-red-500/10 border-red-500/20',
                isOverdue: true
            };
        } else if (diffDays === 0) {
            return {
                text: 'Due Today',
                color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                isOverdue: false
            };
        } else {
            return {
                text: `${diffDays} days left`,
                color: 'text-primary/80 bg-primary/5 border-primary/20',
                isOverdue: false
            };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Task Scheduler</h1>
                    <p className="text-gray-400 mt-1">Manage your research tasks and track progress</p>
                </div>
                <button
                    onClick={() => setShowNewTask(true)}
                    className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Task
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
                        <p className="text-sm text-gray-400">Total Tasks</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stats.completed}</h3>
                        <p className="text-sm text-gray-400">Completed</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Circle className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
                        <p className="text-sm text-gray-400">Pending</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stats.completion_rate.toFixed(0)}%</h3>
                        <p className="text-sm text-gray-400">Completion Rate</p>
                    </motion.div>
                </div>
            )}

            {/* New Task Modal */}
            {showNewTask && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">Create New Task</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Title *</label>
                            <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                placeholder="Task title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50 h-24"
                                placeholder="Task description..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Due Date *</label>
                                    <input
                                        type="datetime-local"
                                        value={newTask.due_date}
                                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowNewTask(false)}
                                className="bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createTask}
                                className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-lg transition-all"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Edit Task Modal */}
            {editingTask && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">Edit Task</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Title *</label>
                            <input
                                type="text"
                                value={editingTask.title}
                                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                placeholder="Task title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea
                                value={editingTask.description || ''}
                                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50 h-24"
                                placeholder="Task description..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Due Date *</label>
                                <input
                                    type="datetime-local"
                                    value={editingTask.due_date ? editingTask.due_date.substring(0, 16) : ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                                <select
                                    value={editingTask.priority}
                                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setEditingTask(null)}
                                className="bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateTask}
                                className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-lg transition-all"
                            >
                                Update Task
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
                {sortedTasks.map((task) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-surface/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-all ${task.completed ? 'opacity-60' : ''
                            }`}
                    >
                        <button onClick={() => toggleTask(task)} className="flex-shrink-0">
                            {task.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                            ) : (
                                <Circle className="w-6 h-6 text-gray-400 hover:text-primary transition-colors" />
                            )}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                                <h3
                                    className={`font-semibold text-white truncate ${task.completed ? 'line-through opacity-60' : ''
                                        }`}
                                >
                                    {task.title}
                                </h3>
                                {task.due_date && (
                                    <span className="text-xs text-primary/80 flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg border border-primary/20 shrink-0">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                            </div>

                            {task.description && (
                                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                            )}

                            <div className="flex items-center gap-3 mt-3">
                                <span
                                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(
                                        task.priority
                                    )}`}
                                >
                                    {task.priority}
                                </span>
                                {task.due_date && (() => {
                                    const info = getDueDateInfo(task.due_date);
                                    return info && (
                                        <span className={`text-[10px] font-bold uppercase flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${info.color}`}>
                                            {info.text}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        <button
                            onClick={() => setEditingTask(task)}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all"
                        >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="text-center py-16">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Tasks Yet</h3>
                    <p className="text-gray-400">Create your first task to get started</p>
                </div>
            )}
        </div>
    );
};

export default TasksPage;
=======
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, CheckCircle2, Circle, Trash2, TrendingUp, Target, Edit2 } from 'lucide-react';
import api from '../services/api';

interface Task {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    completed: boolean;
    priority: string;
    created_at: string;
}

interface TaskStats {
    total: number;
    completed: number;
    pending: number;
    completion_rate: number;
    consistency: Array<{ date: string; completed: number }>;
}

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [showNewTask, setShowNewTask] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
    });

    useEffect(() => {
        loadTasks();
        loadStats();
    }, []);

    const loadTasks = async () => {
        try {
            const response = await api.get('/tasks/');
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get('/tasks/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const createTask = async () => {
        if (!newTask.title) return;

        try {
            await api.post('/tasks/', {
                ...newTask,
                due_date: newTask.due_date || null,
            });
            setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
            setShowNewTask(false);
            loadTasks();
            loadStats();
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const updateTask = async () => {
        if (!editingTask || !editingTask.title) return;

        try {
            await api.put(`/tasks/${editingTask.id}`, {
                title: editingTask.title,
                description: editingTask.description,
                due_date: editingTask.due_date || null,
                priority: editingTask.priority,
            });
            setEditingTask(null);
            loadTasks();
            loadStats();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const toggleTask = async (task: Task) => {
        try {
            await api.put(`/tasks/${task.id}`, { completed: !task.completed });
            loadTasks();
            loadStats();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter((t) => t.id !== taskId));
            loadStats();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'medium':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low':
                return 'text-green-400 bg-green-500/10 border-green-500/20';
            default:
                return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getDueDateInfo = (dueDate: string | null) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                text: `Overdue (${Math.abs(diffDays)}d ago)`,
                color: 'text-red-400 bg-red-500/10 border-red-500/20',
                isOverdue: true
            };
        } else if (diffDays === 0) {
            return {
                text: 'Due Today',
                color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                isOverdue: false
            };
        } else {
            return {
                text: `${diffDays} days left`,
                color: 'text-primary/80 bg-primary/5 border-primary/20',
                isOverdue: false
            };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Task Scheduler</h1>
                    <p className="text-gray-400 mt-1">Manage your research tasks and track progress</p>
                </div>
                <button
                    onClick={() => setShowNewTask(true)}
                    className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Task
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
                        <p className="text-sm text-gray-400">Total Tasks</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stats.completed}</h3>
                        <p className="text-sm text-gray-400">Completed</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Circle className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
                        <p className="text-sm text-gray-400">Pending</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stats.completion_rate.toFixed(0)}%</h3>
                        <p className="text-sm text-gray-400">Completion Rate</p>
                    </motion.div>
                </div>
            )}

            {/* New Task Modal */}
            {showNewTask && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">Create New Task</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Title *</label>
                            <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                placeholder="Task title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50 h-24"
                                placeholder="Task description..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        value={newTask.due_date}
                                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowNewTask(false)}
                                className="bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createTask}
                                className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-lg transition-all"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Edit Task Modal */}
            {editingTask && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">Edit Task</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Title *</label>
                            <input
                                type="text"
                                value={editingTask.title}
                                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                placeholder="Task title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea
                                value={editingTask.description || ''}
                                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50 h-24"
                                placeholder="Task description..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                                <input
                                    type="datetime-local"
                                    value={editingTask.due_date ? editingTask.due_date.substring(0, 16) : ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                                <select
                                    value={editingTask.priority}
                                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setEditingTask(null)}
                                className="bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateTask}
                                className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-lg transition-all"
                            >
                                Update Task
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
                {tasks.map((task) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-surface/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-all ${task.completed ? 'opacity-60' : ''
                            }`}
                    >
                        <button onClick={() => toggleTask(task)} className="flex-shrink-0">
                            {task.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                            ) : (
                                <Circle className="w-6 h-6 text-gray-400 hover:text-primary transition-colors" />
                            )}
                        </button>

                        <div className="flex-1 min-w-0">
                            <h3
                                className={`font-semibold text-white ${task.completed ? 'line-through opacity-60' : ''
                                    }`}
                            >
                                {task.title}
                            </h3>
                            {task.description && (
                                <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <span
                                    className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(
                                        task.priority
                                    )}`}
                                >
                                    {task.priority}
                                </span>
                                {task.due_date && (
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs text-primary/80 flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg border border-primary/20">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        {(() => {
                                            const info = getDueDateInfo(task.due_date);
                                            return info && (
                                                <span className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded-lg border ${info.color}`}>
                                                    {info.text}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setEditingTask(task)}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all"
                        >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="text-center py-16">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Tasks Yet</h3>
                    <p className="text-gray-400">Create your first task to get started</p>
                </div>
            )}
        </div>
    );
};

export default TasksPage;
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
