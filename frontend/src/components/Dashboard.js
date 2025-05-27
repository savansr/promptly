import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardDocumentIcon,
  TrashIcon,
  CheckIcon,
  ArrowPathIcon,
  PlusIcon,
  SparklesIcon,
  HashtagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { logout } from '../store/slices/authSlice';
import {
  fetchPrompts,
  createPrompt,
  deletePrompt,
  enhancePrompt,
  setSortBy,
  setFilterTags,
  clearEnhancedContent,
} from '../store/slices/promptSlice';

// Add gradient-text class definition
const gradientTextClass = "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500";

const Dashboard = () => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [activeTextArea, setActiveTextArea] = useState('original');
  const [copiedPromptId, setCopiedPromptId] = useState(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const contentRef = useRef(null);
  const enhancedContentRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    prompts,
    loading,
    error,
    sortBy,
    filterTags,
    enhancedContent,
  } = useSelector((state) => state.prompt);

  useEffect(() => {
    dispatch(fetchPrompts());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/signin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contentToSave = activeTextArea === 'enhanced' ? enhancedContent : content;
    const tagsArray = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    
    await dispatch(createPrompt({ content: contentToSave, tags: tagsArray }));
    setContent('');
    setTags('');
    setActiveTextArea('original');
  };

  const handleEnhance = async () => {
    if (!content.trim()) return;
    try {
      dispatch(clearEnhancedContent());
      setShowEnhanced(true);
      const result = await dispatch(enhancePrompt(content));
      if (result.payload) {
        setActiveTextArea('enhanced');
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await dispatch(deletePrompt(id));
      } catch (error) {
        console.error('Error deleting prompt:', error);
      }
    }
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPromptId(content);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
  };

  const allTags = [...new Set(prompts.flatMap((prompt) => prompt.tags))];

  const filteredPrompts = prompts
    .filter((prompt) => {
      if (filterTags.length === 0) return true;
      return filterTags.every((tag) => prompt.tags.includes(tag));
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-indigo-500" />
              <h1 className={`text-2xl font-bold ${gradientTextClass}`}>Promptly</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 hover:border-slate-400 transition-all flex items-center space-x-2"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Prompt Creation Section */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${gradientTextClass} flex items-center space-x-2`}>
                <ClipboardDocumentIcon className="h-5 w-5" />
                <span>Save Your Prompt</span>
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Original Prompt
                </label>
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setActiveTextArea('original')}
                  className={`w-full h-32 px-4 py-3 bg-slate-700/50 border ${
                    activeTextArea === 'original' ? 'border-indigo-500' : 'border-slate-600'
                  } rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="Enter your prompt here..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center space-x-2">
                  <XMarkIcon className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {showEnhanced && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Enhanced Prompt
                    </label>
                    <button
                      onClick={() => {
                        setShowEnhanced(false);
                        dispatch(clearEnhancedContent());
                      }}
                      className="text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    ref={enhancedContentRef}
                    value={enhancedContent}
                    onChange={(e) => {
                      dispatch(clearEnhancedContent());
                      setContent(e.target.value);
                      setActiveTextArea('original');
                    }}
                    onFocus={() => setActiveTextArea('enhanced')}
                    className={`w-full h-32 px-4 py-3 bg-slate-700/50 border ${
                      activeTextArea === 'enhanced' ? 'border-indigo-500' : 'border-slate-600'
                    } rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    placeholder="Enhanced prompt will appear here..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center space-x-2">
                  <HashtagIcon className="h-4 w-4" />
                  <span>Tags (comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="e.g., writing, creative, business"
                />
              </div>

              <div className="flex justify-start space-x-3">
                <button
                  type="submit"
                  disabled={loading || (!content && !enhancedContent)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4" />
                      <span>Save Prompt</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={!content.trim() || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      <span>Enhance Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Saved Prompts Section */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-700/50">
            <div className="flex flex-col items-center mb-6">
              <h2 className={`text-3xl font-bold mb-6 ${gradientTextClass} flex items-center space-x-2`}>
                <ClipboardDocumentIcon className="h-8 w-8" />
                <span>Saved Prompts</span>
              </h2>
              <div className="w-full flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center space-x-2">
                    {sortBy === 'newest' ? (
                      <ArrowDownIcon className="h-4 w-4" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4" />
                    )}
                    <span>Sort By</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center space-x-2">
                    <HashtagIcon className="h-4 w-4" />
                    <span>Filter by Tags</span>
                  </label>
                  <select
                    value={filterTags.length === 0 ? 'all' : filterTags[0]}
                    onChange={(e) => {
                      const value = e.target.value;
                      dispatch(setFilterTags(value === 'all' ? [] : [value]));
                    }}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="all">All Tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center space-x-2">
                <XMarkIcon className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : filteredPrompts.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No prompts found</p>
            ) : (
              <div className="space-y-4">
                {filteredPrompts.map((prompt) => (
                  <div
                    key={prompt._id}
                    className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all"
                  >
                    <p className="text-slate-200 mb-3 whitespace-pre-wrap">{prompt.content}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {prompt.tags.map((tag) => (
                        <span
                          key={`${prompt._id}-${tag}`}
                          className="px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full flex items-center space-x-1"
                        >
                          <HashtagIcon className="h-3 w-3" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleCopy(prompt.content)}
                        className="p-2 text-slate-400 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="Copy prompt"
                      >
                        {copiedPromptId === prompt.content ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <ClipboardDocumentIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(prompt._id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="Delete prompt"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 