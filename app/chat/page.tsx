'use client'

import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('auto')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    checkAuth()
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
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          model: selectedModel
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response')
      }
      
      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        model: data.model
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">🚀 MR.Promth AI Chat</h1>
          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
            19 AI Models
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="auto">🤖 Auto (Load Balanced)</option>
            <option value="random">🎲 Random Selection</option>
            <option value="model_1">Model 1</option>
            <option value="model_2">Model 2</option>
            <option value="model_3">Model 3</option>
          </select>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ยินดีต้อนรับสู่ MR.Promth AI
            </h2>
            <p className="text-gray-600 mb-6">
              AI Agent ที่ทรงพลังด้วย 19 AI Models พร้อมช่วยคุณสร้างโค้ดและตอบคำถามทุกอย่าง
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">💻</div>
                <h3 className="font-semibold text-gray-900 mb-1">สร้างโค้ด</h3>
                <p className="text-sm text-gray-600">สร้างโปรเจคเว็บไซต์, แอพ, API อัตโนมัติ</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-semibold text-gray-900 mb-1">ตอบคำถาม</h3>
                <p className="text-sm text-gray-600">ตอบทุกคำถาม วิเคราะห์ปัญหา แนะนำแก้ไข</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-1">19 AI Models</h3>
                <p className="text-sm text-gray-600">Load balancing อัตโนมัติเพื่อประสิทธิภาพสูงสุด</p>
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
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && (
                  <div className="text-xl">🤖</div>
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.model && (
                    <p className="text-xs mt-2 opacity-70">
                      Model: {message.model}
                    </p>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="text-xl">👤</div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-3xl px-4 py-3 rounded-lg bg-white border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="text-xl">🤖</div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="พิมพ์ข้อความหรือคำถาม... (กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '⏳' : '🚀'}
          </button>
        </div>
      </div>
    </div>
  )
}
