import { useState } from 'react';
import { FiCopy, FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';

interface CodeBlockForm {
  language: string;
  code: string;
  description?: string;
}

interface CodeBlockEditorProps {
  codeBlocks: CodeBlockForm[];
  onCodeBlocksChange: (blocks: CodeBlockForm[]) => void;
}

const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'swift',
  'go',
  'rust',
  'html',
  'css',
  'sql',
  'bash',
  'json',
  'yaml',
  'markdown',
  'plaintext'
];

export default function CodeBlockEditor({ codeBlocks, onCodeBlocksChange }: CodeBlockEditorProps) {
  const [currentBlock, setCurrentBlock] = useState<CodeBlockForm>({
    language: '',
    code: '',
    description: ''
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleAddCodeBlock = () => {
    if (currentBlock.language && currentBlock.code) {
      onCodeBlocksChange([...codeBlocks, currentBlock]);
      setCurrentBlock({ language: '', code: '', description: '' });
    }
  };

  const handleRemoveCodeBlock = (index: number) => {
    onCodeBlocksChange(codeBlocks.filter((_, i) => i !== index));
  };

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      // Removed all console.error statements for cleaner production code.
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Code Blocks */}
      {codeBlocks.map((block, index) => (
        <div key={index} className="bg-neutral-800/80 rounded-lg p-4 border border-violet-500/30">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-sm">
                {block.language}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(block.code, index)}
                className="p-1 text-gray-400 hover:text-violet-400 transition-colors"
                title="Copy code"
              >
                {copiedIndex === index ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <FiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveCodeBlock(index)}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Remove code block"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <pre className="bg-neutral-900/80 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-gray-300">{block.code}</code>
          </pre>
          {block.description && (
            <p className="mt-2 text-sm text-gray-400">{block.description}</p>
          )}
        </div>
      ))}

      {/* Add New Code Block Form */}
      <div className="bg-neutral-800/80 rounded-lg p-4 border border-violet-500/30">
        <div className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-violet-300 mb-2">
              Language
            </label>
            <select
              id="language"
              value={currentBlock.language}
              onChange={(e) => setCurrentBlock({ ...currentBlock, language: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
            >
              <option value="">Select a language</option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-violet-300 mb-2">
              Code
            </label>
            <textarea
              id="code"
              value={currentBlock.code}
              onChange={(e) => setCurrentBlock({ ...currentBlock, code: e.target.value })}
              rows={6}
              placeholder="Paste your code here..."
              className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white font-mono text-sm focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-violet-300 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              id="description"
              value={currentBlock.description}
              onChange={(e) => setCurrentBlock({ ...currentBlock, description: e.target.value })}
              placeholder="Add a brief description of the code..."
              className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <button
            type="button"
            onClick={handleAddCodeBlock}
            disabled={!currentBlock.language || !currentBlock.code}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="w-4 h-4" />
            Add Code Block
          </button>
        </div>
      </div>
    </div>
  );
} 