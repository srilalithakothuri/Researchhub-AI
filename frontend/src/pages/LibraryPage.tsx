import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Trash2, Search, Loader2, BookOpen, Users, Calendar, Sparkles, Download, X } from 'lucide-react';
import api from '../services/api';

interface Paper {
    id: number;
    title: string;
    authors: string | null;
    file_name: string;
    summary: string | null;
    uploaded_at: string;
}

const LibraryPage = () => {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [selectedPaperIds, setSelectedPaperIds] = useState<number[]>([]);
    const [synthesizedReport, setSynthesizedReport] = useState<string | null>(null);
    const [synthesizing, setSynthesizing] = useState(false);
    const [fileTitles, setFileTitles] = useState<string[]>([]);
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

    useEffect(() => {
        loadPapers();
    }, []);

    const loadPapers = async () => {
        try {
            const response = await api.get('/papers/');
            setPapers(response.data);
        } catch (error) {
            console.error('Failed to load papers:', error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = e.target.files;
            setSelectedFiles(files);
            const titles = Array.from(files).map(f => f.name.replace('.pdf', ''));
            setFileTitles(titles);
        }
    };

    const togglePaperSelection = (id: number) => {
        setSelectedPaperIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleSynthesize = async () => {
        if (selectedPaperIds.length === 0) return;
        setSynthesizing(true);
        try {
            const response = await api.post('/papers/synthesize-report', selectedPaperIds);
            setSynthesizedReport(response.data.report);
        } catch (error) {
            console.error('Synthesis failed:', error);
            alert('Failed to synthesize report');
        } finally {
            setSynthesizing(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'docx') => {
        if (!synthesizedReport) return;
        try {
            const response = await api.post('/papers/export',
                { content: synthesizedReport, format },
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `research_report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report');
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
            formData.append('titles', fileTitles[i] || selectedFiles[i].name);
        }

        try {
            const response = await api.post('/papers/upload-batch', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const uploadedCount = response.data.length;

            setSelectedFiles(null);
            setFileTitles([]);
            loadPapers();

            if (uploadedCount === 0) {
                alert('Upload failed: Could not process any of the files.');
            } else if (uploadedCount < selectedFiles.length) {
                alert(`Partially successful: ${uploadedCount}/${selectedFiles.length} papers processed.`);
            } else {
                alert('Papers uploaded and processed successfully!');
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(error.response?.data?.detail || 'Upload failed due to a server error.');
        } finally {
            setUploading(false);
        }
    };

    const deletePaper = async (paperId: number) => {
        if (!confirm('Delete this paper?')) return;

        try {
            await api.delete(`/papers/${paperId}`);
            setPapers(papers.filter((p) => p.id !== paperId));
        } catch (error) {
            console.error('Failed to delete paper:', error);
        }
    };

    const filteredPapers = papers.filter(
        (paper) =>
            paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            paper.authors?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Research Library</h1>
                    <p className="text-gray-400 mt-1">Upload and manage your research papers</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search papers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload Research Papers
                </h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-2">Select PDF Files</label>
                        <input
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={handleFileSelect}
                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-black file:font-semibold hover:file:bg-primary/90"
                        />
                        {selectedFiles && selectedFiles.length > 0 && (
                            <p className="text-sm text-gray-400 mt-2">
                                Selected: {selectedFiles.length} files
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
                        className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing Batch...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Upload All
                            </>
                        )}
                    </button>
                </div>

                {/* File Naming Section */}
                {selectedFiles && selectedFiles.length > 0 && (
                    <div className="mt-6 border-t border-white/5 pt-4">
                        <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Step 2: Name your files
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Array.from(selectedFiles).map((file, idx) => (
                                <div key={idx} className="bg-black/20 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-500 truncate mb-1">{file.name}</p>
                                        <input
                                            type="text"
                                            value={fileTitles[idx] || ''}
                                            onChange={(e) => {
                                                const newTitles = [...fileTitles];
                                                newTitles[idx] = e.target.value;
                                                setFileTitles(newTitles);
                                            }}
                                            className="w-full bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 p-0"
                                            placeholder="Enter title..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
                AI will automatically extract metadata, generate summary, and enable semantic search
            </p>

            {/* Batch Synthesis Section */}
            {papers.length > 0 && (
                <div className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Research Organizer & Synthesizer
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSynthesize}
                                disabled={selectedPaperIds.length < 2 || synthesizing}
                                className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {synthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Synthesize {selectedPaperIds.length} Papers
                            </button>
                        </div>
                    </div>
                    {selectedPaperIds.length < 2 && (
                        <p className="text-sm text-gray-400">Select at least 2 papers to create a synthesized report.</p>
                    )}

                    {synthesizedReport && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-6 bg-black/30 rounded-xl border border-primary/20"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Synthesized Research Summary
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        className="bg-white/5 hover:bg-white/10 text-white py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Save as PDF
                                    </button>
                                    <button
                                        onClick={() => handleExport('docx')}
                                        className="bg-white/5 hover:bg-white/10 text-white py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Save as Word
                                    </button>
                                </div>
                            </div>
                            <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {synthesizedReport}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Papers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPapers.map((paper) => (
                    <motion.div
                        key={paper.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-primary/30 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedPaperIds.includes(paper.id)}
                                    onChange={() => togglePaperSelection(paper.id)}
                                    className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary/50 cursor-pointer"
                                />
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <button
                                onClick={() => deletePaper(paper.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                        </div>

                        <h3 className="text-white font-semibold mb-2 line-clamp-2">{paper.title}</h3>

                        {paper.authors && (
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Users className="w-3 h-3" />
                                <span className="line-clamp-1">{paper.authors}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <Calendar className="w-3 h-3" />
                            {new Date(paper.uploaded_at).toLocaleDateString()}
                        </div>

                        {paper.summary && (
                            <p className="text-sm text-gray-400 line-clamp-3 mb-3">{paper.summary}</p>
                        )}

                        <button
                            onClick={() => setSelectedPaper(paper)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            View Details
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* View Details Modal */}
            {selectedPaper && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface/90 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Paper Details
                            </h3>
                            <button
                                onClick={() => setSelectedPaper(null)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Title</h4>
                                <p className="text-xl font-bold text-white">{selectedPaper.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Authors</h4>
                                    <p className="text-white">{selectedPaper.authors || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Uploaded At</h4>
                                    <p className="text-white">{new Date(selectedPaper.uploaded_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-2">AI Summary</h4>
                                <div className="bg-black/20 rounded-xl p-4 text-gray-300 text-sm leading-relaxed">
                                    {selectedPaper.summary || 'No summary available.'}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-2">File Info</h4>
                                <p className="text-white text-sm">{selectedPaper.file_name}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => setSelectedPaper(null)}
                                className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-6 rounded-lg transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {filteredPapers.length === 0 && (
                <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Papers Yet</h3>
                    <p className="text-gray-400">Upload your first research paper to get started</p>
                </div>
            )}
        </div>
    );
};

export default LibraryPage;
