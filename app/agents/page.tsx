'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  description: string
  category: string
  icon: string
  rating: number
  usageCount: number
  isActive: boolean
  tags: string[]
}

const AGENT_CATEGORIES = [
  'All',
  'Code Generation',
  'Writing',
  'Analysis',
  'Design',
  'Data Processing',
  'Testing'
]

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent1',
    name: 'Code Generator',
    description: 'Generate production-ready code in multiple languages with best practices',
    category: 'Code Generation',
    icon: '💻',
    rating: 4.8,
    usageCount: 1250,
    isActive: true,
    tags: ['React', 'TypeScript', 'Node.js']
  },
  {
    id: 'agent2',
    name: 'Technical Writer',
    description: 'Create comprehensive technical documentation and API guides',
    category: 'Writing',
    icon: '📝',
    rating: 4.6,
    usageCount: 890,
    isActive: true,
    tags: ['Documentation', 'API', 'Markdown']
  },
  {
    id: 'agent3',
    name: 'Code Reviewer',
    description: 'Analyze code quality, security, and suggest improvements',
    category: 'Analysis',
    icon: '🔍',
    rating: 4.9,
    usageCount: 2100,
    isActive: true,
    tags: ['Security', 'Performance', 'Best Practices']
  },
  {
    id: 'agent4',
    name: 'UI Designer',
    description: 'Generate beautiful UI components and design systems',
    category: 'Design',
    icon: '🎨',
    rating: 4.7,
    usageCount: 1450,
    isActive: false,
    tags: ['Tailwind', 'UI/UX', 'Components']
  },
  {
    id: 'agent5',
    name: 'Data Analyst',
    description: 'Process and analyze data with insights and visualizations',
    category: 'Data Processing',
    icon: '📊',
    rating: 4.5,
    usageCount: 780,
    isActive: true,
    tags: ['Analytics', 'Visualization', 'SQL']
  },
  {
    id: 'agent6',
    name: 'Test Generator',
    description: 'Create comprehensive unit and integration tests',
    category: 'Testing',
    icon: '🧪',
    rating: 4.4,
    usageCount: 650,
    isActive: false,
    tags: ['Jest', 'Testing', 'TDD']
  },
  {
    id: 'agent7',
    name: 'API Builder',
    description: 'Design and implement RESTful APIs with documentation',
    category: 'Code Generation',
    icon: '🔌',
    rating: 4.8,
    usageCount: 1100,
    isActive: true,
    tags: ['REST', 'OpenAPI', 'Express']
  }
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS)
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(MOCK_AGENTS)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    checkUser()
  }, [])
  
  useEffect(() => {
    filterAgents()
  }, [selectedCategory, searchQuery, showActiveOnly])
  
  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }
  }
  
  function filterAgents() {
    let filtered = agents
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(agent => agent.category === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // Filter by active status
    if (showActiveOnly) {
      filtered = filtered.filter(agent => agent.isActive)
    }
    
    setFilteredAgents(filtered)
  }
  
  async function toggleAgent(agentId: string) {
    setLoading(true)
    
    try {
      // TODO: Call API to toggle agent
      setAgents(agents.map(agent =>
        agent.id === agentId ? { ...agent, isActive: !agent.isActive } : agent
      ))
      
      // Show success message
      alert(`Agent ${agents.find(a => a.id === agentId)?.isActive ? 'deactivated' : 'activated'} successfully!`)
    } catch (error) {
      console.error('Error toggling agent:', error)
      alert('Failed to toggle agent')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold">🤖 Agent Marketplace</h1>
          <p className="mt-2 text-lg text-indigo-100">
            Discover and activate AI agents to supercharge your workflow
          </p>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <svg
                className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {AGENT_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Active only</span>
          </label>
        </div>
        
        {/* Stats */}
        <div className="mb-6 text-sm text-gray-600">
          Showing {filteredAgents.length} of {agents.length} agents
          {showActiveOnly && ` (${agents.filter(a => a.isActive).length} active)`}
        </div>
        
        {/* Agents Grid */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-4xl">{agent.icon}</span>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-gray-500">{agent.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAgent(agent.id)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        agent.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {agent.isActive ? 'Active' : 'Activate'}
                    </button>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{agent.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span>{agent.usageCount.toLocaleString()} uses</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex space-x-2">
                    <Link
                      href={`/agents/${agent.id}`}
                      className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => router.push(`/app/chat?agent=${agent.id}`)}
                      disabled={!agent.isActive}
                      className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Try Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
