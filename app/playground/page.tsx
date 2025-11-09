'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Play, Lightbulb, CheckCircle, Sparkles } from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const SAMPLE_CODE = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
  
  python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,
  
  typescript: `// TypeScript Example
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`
}

export default function CodePlayground() {
  const [code, setCode] = useState(SAMPLE_CODE.javascript)
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [explanation, setExplanation] = useState('')
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'output' | 'explanation' | 'review'>('output')

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    setCode(SAMPLE_CODE[lang as keyof typeof SAMPLE_CODE] || '')
    setOutput('')
    setExplanation('')
    setReview('')
  }

  const handleRun = () => {
    setActiveTab('output')
    setLoading(true)
    
    try {
      // Simple JavaScript execution
      if (language === 'javascript' || language === 'typescript') {
        const logs: string[] = []
        const originalLog = console.log
        console.log = (...args) => {
          logs.push(args.map(arg => String(arg)).join(' '))
        }
        
        eval(code)
        
        console.log = originalLog
        setOutput(logs.join('\n') || 'No output')
      } else {
        setOutput('Code execution is only supported for JavaScript/TypeScript in the browser.')
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleExplain = async () => {
    setActiveTab('explanation')
    setLoading(true)
    
    try {
      const response = await fetch('/api/code/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
      
      if (!response.ok) throw new Error('Failed to explain code')
      
      const data = await response.json()
      setExplanation(data.explanation)
    } catch (error: any) {
      setExplanation(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    setActiveTab('review')
    setLoading(true)
    
    try {
      const response = await fetch('/api/code/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
      
      if (!response.ok) throw new Error('Failed to review code')
      
      const data = await response.json()
      setReview(data.review)
    } catch (error: any) {
      setReview(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Code Playground</h1>
            <p className="text-sm text-gray-600">Write, run, and get AI assistance for your code</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
            
            <button
              onClick={handleRun}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Play className="h-4 w-4" />
              Run Code
            </button>
            
            <button
              onClick={handleExplain}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              Explain
            </button>
            
            <button
              onClick={handleReview}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Review
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Output */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 border-r border-gray-200">
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('output')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'output'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Output
            </button>
            <button
              onClick={() => setActiveTab('explanation')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'explanation'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Explanation
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'review'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Review
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-gray-600">
                  <Sparkles className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              </div>
            )}

            {!loading && activeTab === 'output' && (
              <pre className="font-mono text-sm text-gray-900 whitespace-pre-wrap">
                {output || 'Click "Run Code" to see output'}
              </pre>
            )}

            {!loading && activeTab === 'explanation' && (
              <div className="prose prose-sm max-w-none">
                {explanation ? (
                  <div className="whitespace-pre-wrap text-gray-900">{explanation}</div>
                ) : (
                  <p className="text-gray-500">Click "Explain" to get AI explanation</p>
                )}
              </div>
            )}

            {!loading && activeTab === 'review' && (
              <div className="prose prose-sm max-w-none">
                {review ? (
                  <div className="whitespace-pre-wrap text-gray-900">{review}</div>
                ) : (
                  <p className="text-gray-500">Click "Review" to get AI code review</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
