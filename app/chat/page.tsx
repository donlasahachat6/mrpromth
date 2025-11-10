'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Paperclip, X, FileText, Image as ImageIcon, FileCode, File, Send, Loader2, Copy, Check, MessageCircle, Code2, FolderKanban, Bug, Zap, Shuffle, Cpu, Brain, Paperclip as PaperclipIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
  files?: UploadedFile[]
  isStreaming?: boolean
}

interface UploadedFile {
  name: string
  size: number
  type: string
  url?: string
  preview?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('auto')
  const [selectedMode, setSelectedMode] = useState<'chat' | 'code' | 'project' | 'debug'>('chat')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    checkAuth()
    initializeSession()
  }, [])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    }
  }
  
  const initializeSession = async () => {
    // Create or get existing session
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
    setSessionId(newSessionId)
    
    // Load chat history if needed
    // const history = await loadChatHistory(newSessionId)
    // if (history) setMessages(history)
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />
    if (type.includes('code') || type.includes('text')) return <FileCode className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleSend = async () => {
    if ((!input.trim() && files.length === 0) || loading) return
    
    setUploading(true)
    
    // Upload files if any
    const uploadedFiles: UploadedFile[] = []
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          uploadedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: data.url
          })
        }
      } catch (error) {
        console.error('File upload error:', error)
      }
    }
    
    setUploading(false)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input || 'Uploaded files',
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    }
    
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setFiles([])
    setLoading(true)
    
    // Create placeholder for streaming response
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    setMessages(prev => [...prev, assistantMessage])
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
            files: m.files
          })),
          mode: selectedMode,
          stream: true
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response')
      }
      
      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''
      
      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(line => line.trim() !== '')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              try {
                const parsed = JSON.parse(data)
                
                if (parsed.type === 'chunk' && parsed.content) {
                  accumulatedContent += parsed.content
                  
                  // Update message with accumulated content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ))
                } else if (parsed.type === 'done') {
                  // Mark streaming as complete
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false, model: selectedModel }
                      : msg
                  ))
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.error)
                }
              } catch (e) {
                console.warn('Failed to parse SSE chunk:', e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId
          ? { 
              ...msg, 
              content: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
              isStreaming: false
            }
          : msg
      ))
    } finally {
      setLoading(false)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }
  
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                MP
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MR.Prompt AI Chat
              </h1>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
              19 AI Models
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="chat">Chat Mode</option>
              <option value="code">Code Mode</option>
              <option value="project">Project Mode</option>
              <option value="debug">Debug Mode</option>
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="auto">Auto (Load Balanced)</option>
              <option value="random">Random Selection</option>
              <optgroup label="Project Planning">
                <option value="model_1">Model 1 - Project Planner</option>
                <option value="model_2">Model 2 - Requirements</option>
                <option value="model_3">Model 3 - Architecture</option>
              </optgroup>
              <optgroup label="Frontend Development">
                <option value="model_4">Model 4 - React/Next.js</option>
                <option value="model_5">Model 5 - UI Components</option>
                <option value="model_6">Model 6 - Frontend Logic</option>
                <option value="model_7">Model 7 - State Management</option>
                <option value="model_8">Model 8 - Routing</option>
              </optgroup>
              <optgroup label="Backend Development">
                <option value="model_9">Model 9 - API Routes</option>
                <option value="model_10">Model 10 - Server Logic</option>
                <option value="model_11">Model 11 - Authentication</option>
                <option value="model_12">Model 12 - Middleware</option>
                <option value="model_13">Model 13 - Integration</option>
              </optgroup>
              <optgroup label="Database & Design">
                <option value="model_14">Model 14 - Schema Design</option>
                <option value="model_15">Model 15 - Migrations</option>
                <option value="model_16">Model 16 - Query Optimization</option>
                <option value="model_17">Model 17 - UI/UX Design</option>
                <option value="model_18">Model 18 - Styling</option>
                <option value="model_19">Model 19 - Design System</option>
              </optgroup>
            </select>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-lg">
                MP
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                ยินดีต้อนรับสู่ MR.Prompt AI
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                AI Agent ที่ทรงพลังด้วย 19 AI Models พร้อมช่วยคุณสร้างโค้ดและตอบคำถามทุกอย่าง
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">สร้างโค้ด</h3>
                  <p className="text-sm text-gray-600">สร้างโปรเจคเว็บไซต์, แอพ, API อัตโนมัติ</p>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">ตอบคำถาม</h3>
                  <p className="text-sm text-gray-600">ตอบทุกคำถาม วิเคราะห์ปัญหา แนะนำแก้ไข</p>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <PaperclipIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">อัพโหลดไฟล์</h3>
                  <p className="text-sm text-gray-600">รองรับ PDF, รูปภาพ, CSV, และโค้ด</p>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-bl-sm shadow-sm'
                } px-5 py-4`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100">
                    <ReactMarkdown
                      components={{
                        code({node, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          const codeString = String(children).replace(/\n$/, '')
                          const inline = !className
                          
                          return !inline && match ? (
                            <div className="relative group">
                              <button
                                onClick={() => copyCode(codeString)}
                                className="absolute right-2 top-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy code"
                              >
                                {copiedCode === codeString ? (
                                  <Check className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Copy className="h-4 w-4 text-gray-300" />
                                )}
                              </button>
                              <SyntaxHighlighter
                                {...props}
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-indigo-600 animate-pulse ml-1"></span>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                
                {message.files && message.files.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-white/20 pt-3">
                    {message.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm opacity-90">
                        {getFileIcon(file.type)}
                        <span>{file.name}</span>
                        <span className="text-xs">({formatFileSize(file.size)})</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {message.model && !message.isStreaming && (
                  <p className="text-xs mt-3 opacity-60 border-t border-white/20 pt-2">
                    Model: {message.model} • {message.timestamp.toLocaleTimeString('th-TH')}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {loading && messages[messages.length - 1]?.isStreaming && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm px-5 py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">กำลังพิมพ์...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* File Preview */}
          {files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm border border-gray-200">
                  {getFileIcon(file.type)}
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex gap-2 ${dragActive ? 'ring-2 ring-indigo-500 rounded-xl' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.go,.rs,.rb,.php,.html,.css,.jpg,.jpeg,.png,.gif,.webp"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading}
              className="p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="แนบไฟล์"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={dragActive ? "วางไฟล์ที่นี่..." : "พิมพ์ข้อความหรือคำถาม... (กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)"}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white"
              rows={3}
              disabled={loading || uploading}
            />
            <button
              onClick={handleSend}
              disabled={loading || uploading || (!input.trim() && files.length === 0)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="font-medium">ส่ง</span>
            </button>
          </div>
          
          {dragActive && (
            <div className="mt-2 text-sm text-indigo-600 text-center font-medium">
              📎 วางไฟล์ที่นี่เพื่ออัพโหลด
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
