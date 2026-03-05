import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckSquare, Sparkles, AlertCircle, Save, PenTool, LayoutTemplate, FileText, Loader2, UserCheck } from 'lucide-react';

interface PaperSection {
    id: string;
    title: string;
    description: string;
    example: string;
    tips: string[];
}

const PAPER_SECTIONS: PaperSection[] = [
    {
        id: 'abstract',
        title: 'Abstract',
        description: 'A concise summary of your entire research paper.',
        example: 'This study investigates the effects of X on Y using methodology Z. Results show a significant correlation, suggesting that...',
        tips: [
            'Keep it between 150-250 words.',
            'Write this section last, after you finish the paper.',
            'Include the problem, method, key results, and conclusion.'
        ]
    },
    {
        id: 'introduction',
        title: 'Introduction',
        description: 'Introduces the problem, context, and objective of your research.',
        example: 'Recent advancements in X have led to new challenges in Y. While previous studies have addressed A, there remains a gap in understanding B. This paper aims to...',
        tips: [
            'Start broad and narrow down to your specific research question.',
            'Clearly state your hypothesis or objective.',
            'Briefly outline the structure of the paper.'
        ]
    },
    {
        id: 'methodology',
        title: 'Methodology',
        description: 'Explains how you conducted your research.',
        example: 'A quantitative approach was used. Data was collected from 500 participants using a standardized survey across 5 regions. The data was analyzed using...',
        tips: [
            'Provide enough detail so someone else could replicate your study.',
            'Justify why you chose your specific methods.',
            'Mention any limitations of your methodology.'
        ]
    },
    {
        id: 'results',
        title: 'Results',
        description: 'Presents the findings of your research without interpretation.',
        example: 'The analysis revealed a 45% increase in X when Y was applied (p < 0.05). Table 1 shows the distribution of responses across demographics...',
        tips: [
            'Use tables and figures to make data easy to read.',
            'State facts clearly without arguing their meaning yet.',
            'Highlight the most significant findings.'
        ]
    },
    {
        id: 'discussion',
        title: 'Discussion & Conclusion',
        description: 'Interprets the results and states the final implications of your research.',
        example: 'The findings indicate that X strongly influences Y, aligning with previous studies by Smith (2020). However, the unexpected result in Z suggests that...',
        tips: [
            'Explain what your results mean in the context of your introduction.',
            'Acknowledge limitations of your study.',
            'Suggest areas for future research.'
        ]
    }
];

const CHECKLIST_ITEMS = [
    { id: '1', text: 'Title is clear and concise' },
    { id: '2', text: 'Abstract accurately summarizes the paper' },
    { id: '3', text: 'Introduction clearly states the problem/hypothesis' },
    { id: '4', text: 'Methodology is reproducible and clear' },
    { id: '5', text: 'Results are presented logically with visual aids if needed' },
    { id: '6', text: 'Discussion interprets results without just repeating them' },
    { id: '7', text: 'Conclusion summarizes key takeaways' },
    { id: '8', text: 'All citations and references are properly formatted' },
    { id: '9', text: 'Document has been proofread for grammar and clarity' }
];

const PaperGuidePage = () => {
    const [activeSection, setActiveSection] = useState<string>(PAPER_SECTIONS[0].id);
    const [content, setContent] = useState<Record<string, string>>({});
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'guide' | 'template' | 'checklist'>('guide');
    const [isGeneratingTarget, setIsGeneratingTarget] = useState<string | null>(null);

    const handleContentChange = (sectionId: string, value: string) => {
        setContent(prev => ({ ...prev, [sectionId]: value }));
    };

    const toggleChecklist = (id: string) => {
        setCheckedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleAIAssist = async (sectionId: string) => {
        setIsGeneratingTarget(`enhance-${sectionId}`);
        // Simulate API call for AI generation
        setTimeout(() => {
            const currentContent = content[sectionId] || '';
            let newContent = currentContent;

            if (!currentContent) {
                newContent = '[AI Generated Draft]: Start your draft here. A good approach is to outline your main points first...';
            } else {
                const actions = [
                    (text: string) => text + '\n\n[AI Suggestion]: You could strengthen this section by citing recent studies or adding statistical evidence.',
                    (text: string) => text + '\n\n[AI Suggestion]: Consider breaking up these paragraphs to improve readability and flow.',
                    (text: string) => text + '\n\n[AI Suggestion]: Make sure your transition between ideas is smooth. Perhaps add a connecting sentence here.',
                    (text: string) => 'Here is a rewritten version of your text:\n\n' + text.replace(/\[AI.*?\]:?\s*/g, '').trim() + '\n\n(This section was restructured to improve academic clarity and flow.)',
                    (text: string) => text + ' Furthermore, expanding on the nuances of this approach will provide a more comprehensive overview.'
                ];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];
                newContent = randomAction(currentContent);
            }

            setContent(prev => ({ ...prev, [sectionId]: newContent }));
            setIsGeneratingTarget(null);
        }, 1000);
    };

    const handleHumanize = async (sectionId: string) => {
        setIsGeneratingTarget(`humanize-${sectionId}`);
        setTimeout(() => {
            const currentContent = content[sectionId] || '';
            let newContent = currentContent;

            if (!currentContent) {
                newContent = 'Please write some content first before trying to humanize it!';
            } else {
                // Strip out AI annotations and simulate a more natural tone
                let cleanedText = currentContent.replace(/\[AI.*?\]:?\s*/g, '').replace(/\(This section was.*?\)/g, '').replace(/Here is a rewritten version of your text:\s*/g, '').trim();
                newContent = cleanedText + '\n\n(✨ Text has been humanized: Vocabulary simplified, and tone adjusted to sound more conversational, engaging, and less robotic.)';
            }

            setContent(prev => ({ ...prev, [sectionId]: newContent }));
            setIsGeneratingTarget(null);
        }, 1000);
    };

    const handleSave = () => {
        // In a real application, you'd send `content` to standard backend
        alert('Draft saved successfully! (Simulated)');
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary" />
                        Research Paper Guide
                    </h1>
                    <p className="text-gray-400 mt-1">Master the art of writing research papers with guides, templates, and AI.</p>
                </div>
                <div className="flex gap-2 bg-surface/50 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('guide')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'guide' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Guide
                    </button>
                    <button
                        onClick={() => setActiveTab('template')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'template' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <LayoutTemplate className="w-4 h-4" />
                        Template Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('checklist')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'checklist' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <CheckSquare className="w-4 h-4" />
                        Checklist
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* Visual Guide Tab */}
                {activeTab === 'guide' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex gap-6 h-full"
                    >
                        {/* Section Selector */}
                        <div className="w-64 flex-shrink-0 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Sections
                            </h3>
                            <div className="flex flex-col gap-2">
                                {PAPER_SECTIONS.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === section.id
                                            ? 'bg-primary/20 text-primary border border-primary/20'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                            }`}
                                    >
                                        {section.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Guide Viewer */}
                        <div className="flex-1 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 overflow-y-auto custom-scrollbar">
                            {PAPER_SECTIONS.map(section => (
                                section.id === activeSection && (
                                    <motion.div
                                        key={section.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="max-w-3xl"
                                    >
                                        <h2 className="text-3xl font-bold text-white mb-4">{section.title}</h2>
                                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                            {section.description}
                                        </p>

                                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                                <PenTool className="w-24 h-24 text-primary" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Example</h4>
                                            <p className="text-gray-300 italic">"{section.example}"</p>
                                        </div>

                                        <h4 className="text-xl font-semibold text-white mb-4">Pro Tips</h4>
                                        <ul className="space-y-3">
                                            {section.tips.map((tip, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-gray-400">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Template Editor Tab */}
                {activeTab === 'template' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full flex gap-6 h-full"
                    >
                        {/* Editor Sidebar Navigation */}
                        <div className="w-64 flex-shrink-0 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <PenTool className="w-4 h-4" />
                                Draft Sections
                            </h3>
                            <div className="flex flex-col gap-2">
                                {PAPER_SECTIONS.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${activeSection === section.id
                                            ? 'bg-primary/20 text-primary border border-primary/20'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                            }`}
                                    >
                                        <span>{section.title}</span>
                                        {content[section.id] && content[section.id].length > 0 && (
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Draft
                            </button>
                        </div>

                        {/* Editor Component */}
                        <div className="flex-1 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col overflow-hidden relative">
                            {PAPER_SECTIONS.map(section => (
                                section.id === activeSection && (
                                    <div key={section.id} className="flex-1 flex flex-col p-6 h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-2">{section.title}</h2>
                                                <p className="text-sm text-gray-400">{section.description}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleHumanize(section.id)}
                                                    disabled={!!isGeneratingTarget}
                                                    className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-70 border border-white/10"
                                                >
                                                    {isGeneratingTarget === `humanize-${section.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                                    Humanize
                                                </button>
                                                <button
                                                    onClick={() => handleAIAssist(section.id)}
                                                    disabled={!!isGeneratingTarget}
                                                    className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-70"
                                                >
                                                    {isGeneratingTarget === `enhance-${section.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                    AI Enhance
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-h-0 bg-black/20 rounded-xl border border-white/10 p-1">
                                            <textarea
                                                value={content[section.id] || ''}
                                                onChange={(e) => handleContentChange(section.id, e.target.value)}
                                                placeholder={`Start drafting your ${section.title.toLowerCase()} here...`}
                                                className="w-full h-full bg-transparent border-none text-gray-200 p-4 focus:outline-none focus:ring-0 resize-none custom-scrollbar text-lg leading-relaxed placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Checklist Tab */}
                {activeTab === 'checklist' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex justify-center h-full overflow-y-auto custom-scrollbar"
                    >
                        <div className="w-full max-w-2xl bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 h-fit mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <CheckSquare className="w-6 h-6 text-primary" />
                                Pre-submission Checklist
                            </h2>
                            <p className="text-gray-400 mb-8">Ensure your paper meets all standard requirements before submission or peer review.</p>

                            <div className="space-y-4">
                                {CHECKLIST_ITEMS.map((item) => {
                                    const isChecked = checkedItems.includes(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleChecklist(item.id)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${isChecked
                                                ? 'bg-primary/10 border-primary/30 text-white'
                                                : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-primary text-black' : 'border-2 border-gray-600'}`}>
                                                {isChecked && <CheckSquare className="w-4 h-4" />}
                                            </div>
                                            <span className={`text-sm ${isChecked ? 'line-through opacity-70' : ''}`}>{item.text}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                                <div className="text-sm text-gray-400">
                                    <span className="text-primary font-bold">{checkedItems.length}</span> of {CHECKLIST_ITEMS.length} completed
                                </div>
                                <div className="w-48 h-2 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${(checkedItems.length / CHECKLIST_ITEMS.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PaperGuidePage;
