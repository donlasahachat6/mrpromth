'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  Users, Activity, Settings, BarChart3, Shield, Database,
  TrendingUp, AlertCircle, CheckCircle, XCircle, Clock,
  Search, RefreshCw, Eye, Lock, Unlock
} from 'lucide-react'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  totalChats: number
  totalTokens: number
  apiCalls24h: number
  errorRate: number
  avgResponseTime: number
}

interface User {
  id: string
  email: string
  role: string
  created_at: string
  last_sign_in_at: string
  is_active: boolean
  projects_count: number
  chats_count: number
}

interface ActivityLog {
  id: string
  user_email: string
  action: string
  resource: string
  timestamp: string
  status: 'success' | 'error' | 'warning'
  details: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalChats: 0,
    totalTokens: 0,
    apiCalls24h: 0,
    errorRate: 0,
    avgResponseTime: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'activity'>('overview')
  const [refreshing, setRefreshing] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    checkAdminAccess()
  }, [])
  
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
    }
  }, [isAdmin])
  
  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    setUser(user)
    setIsAdmin(true)
    setLoading(false)
  }
  
  async function loadDashboardData() {
    try {
      // Load system stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
      
      // Load users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }
      
      // Load activity logs
      const logsResponse = await fetch('/api/admin/activity')
      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        setActivityLogs(logsData.logs || [])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }
  
  async function handleRefresh() {
    setRefreshing(true)
    await loadDashboardData()
    setTimeout(() => setRefreshing(false), 500)
  }
  
  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      
      if (response.ok) {
        await loadDashboardData()
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }
  
  async function updateUserRole(userId: string, newRole: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      if (response.ok) {
        await loadDashboardData()
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }
  
  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
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
  
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">กำลังโหลด...</p>
        </div>
      </div>
    )
  }
  
  if (!isAdmin) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-400">System Management & Control</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className={`p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors ${refreshing ? 'animate-spin' : ''}`}
                title="รีเฟรช"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                กลับสู่ Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="bg-gray-800/30 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
              { id: 'users', label: 'ผู้ใช้งาน', icon: Users },
              { id: 'activity', label: 'กิจกรรม', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-indigo-500 text-white bg-gray-800/50'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-indigo-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <p className="text-3xl font-bold">{formatNumber(stats.totalUsers)}</p>
                <p className="text-sm text-gray-400 mt-1">ผู้ใช้ทั้งหมด</p>
                <p className="text-xs text-green-400 mt-2">{stats.activeUsers} ออนไลน์</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Database className="h-6 w-6 text-purple-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <p className="text-3xl font-bold">{formatNumber(stats.totalProjects)}</p>
                <p className="text-sm text-gray-400 mt-1">โปรเจกต์</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-3xl font-bold">{formatNumber(stats.apiCalls24h)}</p>
                <p className="text-sm text-gray-400 mt-1">API Calls (24h)</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-400" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stats.errorRate < 1 ? 'bg-green-500/20 text-green-400' :
                    stats.errorRate < 5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {stats.errorRate.toFixed(2)}%
                  </span>
                </div>
                <p className="text-3xl font-bold">{stats.avgResponseTime}ms</p>
                <p className="text-sm text-gray-400 mt-1">Avg Response Time</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาผู้ใช้..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
            </div>
            
            {/* Users Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ผู้ใช้</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">บทบาท</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">สถานะ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">กิจกรรม</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">สร้างเมื่อ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p>{user.projects_count} โปรเจกต์</p>
                          <p className="text-gray-400">{user.chats_count} การสนทนา</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {getRelativeTime(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title={user.is_active ? 'ระงับ' : 'เปิดใช้งาน'}
                          >
                            {user.is_active ? (
                              <Lock className="h-4 w-4 text-red-400" />
                            ) : (
                              <Unlock className="h-4 w-4 text-green-400" />
                            )}
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="ดูรายละเอียด">
                            <Eye className="h-4 w-4 text-blue-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Activity Tab */}
        {selectedTab === 'activity' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                System Activity Logs
              </h3>
              
              <div className="space-y-3">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>ไม่มีกิจกรรม</p>
                  </div>
                ) : (
                  activityLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        log.status === 'success' ? 'bg-green-500/20' :
                        log.status === 'error' ? 'bg-red-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                        {log.status === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
                        {log.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-400">{log.user_email} • {log.resource}</p>
                        {log.details && <p className="text-xs text-gray-500 mt-1">{log.details}</p>}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(log.timestamp)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
