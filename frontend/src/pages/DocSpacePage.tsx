import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Folder,
    FileText,
    Trash2,
    Save,
    Loader2,
    Clock,
    FileEdit,
    Book
} from 'lucide-react';
import api from '../services/api';

interface Project {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    notes: Note[];
}

interface Note {
    id: number;
    project_id: number;
    title: string;
    content: string | null;
    created_at: string;
    updated_at: string | null;
}

const DocSpacePage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteTitle, setNoteTitle] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await api.get('/docspace/projects');
            setProjects(response.data);
            if (response.data.length > 0 && !selectedProject) {
                setSelectedProject(response.data[0]);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async () => {
        if (!newProjectName.trim()) return;
        try {
            const response = await api.post('/docspace/projects', { name: newProjectName });
            setProjects([...projects, { ...response.data, notes: [] }]);
            setNewProjectName('');
            setIsCreatingProject(false);
            setSelectedProject(response.data);
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const createNote = async () => {
        if (!selectedProject) return;
        try {
            const response = await api.post(`/docspace/projects/${selectedProject.id}/notes`, {
                title: 'Untitled Note',
                content: ''
            });
            const updatedProjects = projects.map(p =>
                p.id === selectedProject.id ? { ...p, notes: [...(p.notes || []), response.data] } : p
            );
            setProjects(updatedProjects);
            setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id) || null);
            setSelectedNote(response.data);
            setNoteTitle(response.data.title);
            setNoteContent(response.data.content || '');
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const saveNote = async () => {
        if (!selectedNote) return;
        setSaving(true);
        try {
            const response = await api.put(`/docspace/notes/${selectedNote.id}`, {
                title: noteTitle,
                content: noteContent
            });
            const updatedProjects = projects.map(p => ({
                ...p,
                notes: p.notes?.map(n => n.id === selectedNote.id ? response.data : n) || []
            }));
            setProjects(updatedProjects);
            setSelectedNote(response.data);
        } catch (error) {
            console.error('Failed to save note:', error);
        } finally {
            setSaving(false);
        }
    };

    const deleteProject = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this project and all its notes?')) return;
        try {
            await api.delete(`/docspace/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
            if (selectedProject?.id === id) {
                setSelectedProject(null);
                setSelectedNote(null);
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const deleteNote = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            await api.delete(`/docspace/notes/${id}`);
            const updatedProjects = projects.map(p => ({
                ...p,
                notes: p.notes?.filter(n => n.id !== id) || []
            }));
            setProjects(updatedProjects);
            if (selectedNote?.id === id) {
                setSelectedNote(null);
            }
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Project List Sidebar */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Folder className="w-5 h-5 text-primary" />
                            Projects
                        </h2>
                        <button
                            onClick={() => setIsCreatingProject(true)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-primary transition-all"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {isCreatingProject && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
                                <input
                                    autoFocus
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createProject()}
                                    placeholder="Project Title..."
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-primary/50"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={createProject}
                                        className="flex-1 bg-primary text-black text-xs font-bold py-1.5 rounded-lg"
                                    >
                                        Create
                                    </button>
                                    <button
                                        onClick={() => setIsCreatingProject(false)}
                                        className="flex-1 bg-white/5 text-white text-xs py-1.5 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1 max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar pr-1">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => {
                                    setSelectedProject(project);
                                    setSelectedNote(null);
                                }}
                                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${selectedProject?.id === project.id
                                    ? 'bg-primary/20 text-primary border border-primary/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                <span className="text-sm font-medium truncate">{project.name}</span>
                                <button
                                    onClick={(e) => deleteProject(e, project.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes List for Selected Project */}
                {selectedProject && (
                    <div className="flex-1 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-4 min-h-0">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                {selectedProject.name} Notes
                            </h3>
                            <button
                                onClick={createNote}
                                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                New Note
                            </button>
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                            {selectedProject.notes?.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="w-10 h-10 text-gray-700 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs text-gray-500">No notes yet</p>
                                </div>
                            ) : (
                                selectedProject.notes?.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => {
                                            setSelectedNote(note);
                                            setNoteTitle(note.title);
                                            setNoteContent(note.content || '');
                                        }}
                                        className={`group p-3 rounded-xl cursor-pointer transition-all border ${selectedNote?.id === note.id
                                            ? 'bg-primary/10 border-primary/30'
                                            : 'bg-black/20 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-medium text-white truncate pr-4">{note.title}</h4>
                                            <button
                                                onClick={(e) => deleteNote(e, note.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {note.content || 'Start writing...'}
                                        </p>
                                        <div className="mt-2 text-[10px] text-gray-600 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Note Editor */}
            <div className="flex-1 bg-surface/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col relative">
                {selectedNote ? (
                    <>
                        {/* Editor Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    className="bg-transparent border-none text-2xl font-bold text-white focus:outline-none focus:ring-0 w-full p-0"
                                    placeholder="Note Title"
                                />
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <Book className="w-4 h-4" />
                                    Part of {selectedProject?.name}
                                </p>
                            </div>
                            <button
                                onClick={saveNote}
                                disabled={saving}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save Note
                            </button>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 p-8">
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="w-full h-full bg-transparent border-none text-gray-300 text-lg leading-relaxed focus:outline-none focus:ring-0 resize-none p-0 placeholder:text-gray-700"
                                placeholder="Start typing your research notes here..."
                            />
                        </div>

                        {/* Status Bar */}
                        <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                                <span>{noteContent.split(/\s+/).filter(Boolean).length} words</span>
                                <span>{noteContent.length} characters</span>
                            </div>
                            {selectedNote.updated_at && (
                                <span>Last updated: {new Date(selectedNote.updated_at).toLocaleString()}</span>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <FileEdit className="w-12 h-12 text-primary opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 italic">Select or Create a Note</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">
                            Organization is the key to groundbreaking research. Choose a project from the left and start capturing your insights.
                        </p>
                    </div>
                )}

                {/* Background Sparkle Effect */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
            </div>
        </div>
    );
};

export default DocSpacePage;
