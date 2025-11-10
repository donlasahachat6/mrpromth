'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Download, FileText, MessageSquare, Code, Settings, 
  TrendingUp, Calendar, Clock, User, LogOut,
  BarChart3, Activity, Folder, FileCode, Database
} from 'lucide-react'

interface Stats {
  totalProjects: number
  totalPrompts: number
  totalChats: number
  tokensUsed: number
  requestsToday: number
}

interface RecentActivity {
  id: string
  type: 'chat' | 'project' | 'prompt'
  title: string
  timestamp: string
  content?: string
}

interface Project {
  id: string
  name: string
  description: string
  status: string
  created_at: string
  files_count: number
}

interface ChatSession {
  id: string
  title: string
  messages_count: number
  created_at: string
  last_message_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalPrompts: 0,
    totalChats: 0,
    tokensUsed: 0,
    requestsToday: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    checkUser()
  }, [])
  
  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    setUser(user)
    await loadDashboardData(user.id)
  }
  
  async function loadDashboardData(userId: string) {
    setLoading(true)
    
    try {
      // Load stats from API
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
      
      // Load recent activity from API
      const activityResponse = await fetch('/api/dashboard/activity')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData)
      }
      
      // Load projects
      const projectsResponse = await fetch('/api/projects')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.projects || [])
      }
      
      // Load chat sessions
      const chatsResponse = await fetch('/api/chat/sessions')
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json()
        setChatSessions(chatsData.sessions || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function downloadProject(projectId: string, projectName: string) {
    setDownloadingId(projectId)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/download`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('ไม่สามารถดาวน์โหลดโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setDownloadingId(null)
    }
  }
  
  async function downloadChatHistory(sessionId: string, title: string) {
    setDownloadingId(sessionId)
    
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/export`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-${title}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('ไม่สามารถส่งออกประวัติการสนทนาได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setDownloadingId(null)
    }
  }
  
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }
  
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
  
  function getRelativeTime(timestamp: string): string {
    const now = Date.now()
    const then = new Date(timestamp).getTime()
    const diff = now - then
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return 'เมื่อสักครู่'
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    return `${days} วันที่แล้ว`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                MP
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600">ยินดีต้อนรับ, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/chat"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>เริ่มแชท</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Folder className="h-6 w-6 text-indigo-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalProjects)}</p>
            <p className="text-sm text-gray-600">โปรเจกต์ทั้งหมด</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalPrompts)}</p>
            <p className="text-sm text-gray-600">Prompts</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalChats)}</p>
            <p className="text-sm text-gray-600">การสนทนา</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.tokensUsed)}</p>
            <p className="text-sm text-gray-600">Tokens ที่ใช้</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.requestsToday)}</p>
            <p className="text-sm text-gray-600">คำขอวันนี้</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Folder className="h-5 w-5 text-indigo-600" />
                  โปรเจกต์ล่าสุด
                </h2>
                <Link
                  href="/projects"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ดูทั้งหมด →
                </Link>
              </div>
              
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>ยังไม่มีโปรเจกต์</p>
                    <Link
                      href="/chat"
                      className="inline-block mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      สร้างโปรเจกต์แรกของคุณ →
                    </Link>
                  </div>
                ) : (
                  projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                          <FileCode className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{project.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{project.files_count} ไฟล์</span>
                            <span>•</span>
                            <span>{getRelativeTime(project.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadProject(project.id, project.name)}
                        disabled={downloadingId === project.id}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ดาวน์โหลดโปรเจกต์"
                      >
                        {downloadingId === project.id ? (
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Chat Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  การสนทนาล่าสุด
                </h2>
                <Link
                  href="/chat"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  ดูทั้งหมด →
                </Link>
              </div>
              
              <div className="space-y-3">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>ยังไม่มีการสนทนา</p>
                  </div>
                ) : (
                  chatSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{session.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{session.messages_count} ข้อความ</span>
                          <span>•</span>
                          <span>{getRelativeTime(session.last_message_at)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadChatHistory(session.id, session.title)}
                        disabled={downloadingId === session.id}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ส่งออกประวัติการสนทนา"
                      >
                        {downloadingId === session.id ? (
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                กิจกรรมล่าสุด
              </h2>
              
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>ยังไม่มีกิจกรรม</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className={`p-2 rounded-lg h-fit ${
                        activity.type === 'chat' ? 'bg-blue-100' :
                        activity.type === 'project' ? 'bg-indigo-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.type === 'chat' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'project' && <Code className="h-4 w-4 text-indigo-600" />}
                        {activity.type === 'prompt' && <FileText className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                        {activity.content && (
                          <p className="text-xs text-gray-600 truncate mt-1">{activity.content}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{getRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mt-6 text-white">
              <h2 className="text-lg font-bold mb-4">การดำเนินการด่วน</h2>
              <div className="space-y-3">
                <Link
                  href="/chat"
                  className="block p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">เริ่มแชทใหม่</span>
                  </div>
                </Link>
                <Link
                  href="/projects/new"
                  className="block p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">สร้างโปรเจกต์ใหม่</span>
                  </div>
                </Link>
                <Link
                  href="/settings"
                  className="block p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">ตั้งค่า</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
