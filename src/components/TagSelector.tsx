import { useState, useEffect, useRef } from 'react';
import { FiX, FiTag } from 'react-icons/fi';

interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  availableTags: Tag[];
  error?: string;
  required?: boolean;
  disableClickOutside?: boolean;
  /** Hide the "Tags help categorize..." help text (e.g. in compact filter panels) */
  hideHelpText?: boolean;
}

export default function TagSelector({ 
  selectedTags, 
  onTagsChange, 
  availableTags, 
  error,
  required = true,
  disableClickOutside = false,
  hideHelpText = false
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description === null
  );

  const selectedTagObjects = availableTags.filter(tag => 
    selectedTags.includes(tag.id)
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    if (disableClickOutside) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, disableClickOutside]);

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    onTagsChange(newSelectedTags);
  };

  const removeTag = (tagId: string) => {
    const newSelectedTags = selectedTags.filter(id => id !== tagId);
    onTagsChange(newSelectedTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-700 dark:text-white">
          Tags {required && <span className="text-red-500 dark:text-red-400">*</span>}
        </label>
        <span className="text-xs text-neutral-500 dark:text-gray-400">
          {selectedTags.length} selected
        </span>
      </div>

      {/* Selected Tags Display */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTagObjects.map(tag => (
            <div
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${tag.color}20`, 
                color: tag.color,
                border: `1px solid ${tag.color}40`
              }}
            >
              <FiTag className="w-3 h-3 mr-1" />
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-2 hover:bg-black/20 rounded-full p-0.5 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tag Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 text-left bg-white dark:bg-neutral-800/60 border border-neutral-300 dark:border-violet-500/30 rounded-lg transition-colors ${
            error 
              ? 'border-red-500/50 dark:border-red-500/50 focus:border-red-500' 
              : 'border-neutral-300 dark:border-violet-500/30 focus:border-violet-500'
          } ${isOpen ? 'border-violet-500' : 'hover:border-violet-500/50'}`}
        >
          <div className="flex items-center justify-between">
            <span className={selectedTags.length === 0 ? 'text-neutral-400 dark:text-gray-400' : 'text-neutral-900 dark:text-white'}>
              {selectedTags.length === 0 
                ? 'Select at least one tag...' 
                : `${selectedTags.length} tag${selectedTags.length === 1 ? '' : 's'} selected`
              }
            </span>
            <div className="flex items-center space-x-2">
              {selectedTags.length > 0 && (
                <span className="text-xs text-neutral-500 dark:text-gray-400">
                  {selectedTags.length}/10
                </span>
              )}
              <svg
                className={`w-4 h-4 text-neutral-400 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-violet-500/30 rounded-lg shadow-xl max-h-64 overflow-hidden" ref={dropdownRef}>
            {/* Search Input */}
            <div className="p-3 border-b border-neutral-200 dark:border-violet-500/20">
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-300 dark:border-violet-500/20 rounded-md text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-400 focus:outline-hidden focus:border-violet-500"
              />
            </div>

            {/* Tags List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <div className="p-4 text-center text-neutral-500 dark:text-gray-400">
                  No tags found matching &quot;{searchTerm}&quot;
                </div>
              ) : (
                <div className="p-2">
                  {filteredTags.map(tag => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40' 
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <div className="text-left">
                            <div className="font-medium text-neutral-900 dark:text-white">{tag.name}</div>
                            <div className="text-sm text-neutral-500 dark:text-gray-400">{tag.description || 'No description'}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-neutral-200 dark:border-violet-500/20 bg-neutral-50 dark:bg-neutral-700/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-gray-400">
                  {selectedTags.length} of {availableTags.length} tags selected
                </span>
                {required && selectedTags.length === 0 && (
                  <span className="text-red-500 dark:text-red-400">At least one tag required</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Help Text */}
      {!hideHelpText && (
        <p className="text-xs text-neutral-500 dark:text-gray-400">
          Tags help categorize your post and make it easier for others to find.
          Select tags that best describe your content.
        </p>
      )}
    </div>
  );
} 