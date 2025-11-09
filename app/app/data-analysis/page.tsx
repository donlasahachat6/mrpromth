'use client'

import { useState } from 'react'
import { Upload, FileSpreadsheet, BarChart3, LineChart, PieChart, Download } from 'lucide-react'
import Papa from 'papaparse'
import { LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataRow {
  [key: string]: any
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function DataAnalysisPage() {
  const [data, setData] = useState<DataRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('bar')
  const [xAxis, setXAxis] = useState('')
  const [yAxis, setYAxis] = useState('')
  const [insights, setInsights] = useState<string[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data as DataRow[]
        const cols = results.meta.fields || []
        
        setData(parsedData.filter(row => Object.values(row).some(val => val !== null && val !== '')))
        setColumns(cols)
        
        if (cols.length > 0) {
          setXAxis(cols[0])
          if (cols.length > 1) {
            setYAxis(cols[1])
          }
        }

        generateInsights(parsedData, cols)
        setLoading(false)
      },
      error: (error) => {
        console.error('Parse error:', error)
        setLoading(false)
      }
    })
  }

  const generateInsights = (data: DataRow[], cols: string[]) => {
    const newInsights: string[] = []
    
    // Basic statistics
    newInsights.push(`📊 Dataset contains ${data.length} rows and ${cols.length} columns`)
    
    // Find numeric columns
    const numericCols = cols.filter(col => {
      return data.some(row => typeof row[col] === 'number')
    })

    if (numericCols.length > 0) {
      numericCols.forEach(col => {
        const values = data.map(row => row[col]).filter(v => typeof v === 'number') as number[]
        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0)
          const avg = sum / values.length
          const max = Math.max(...values)
          const min = Math.min(...values)
          
          newInsights.push(`📈 ${col}: Average = ${avg.toFixed(2)}, Max = ${max}, Min = ${min}`)
        }
      })
    }

    setInsights(newInsights)
  }

  const renderChart = () => {
    if (data.length === 0 || !xAxis || !yAxis) return null

    const chartData = data.slice(0, 20) // Limit to 20 rows for better visualization

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLine data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yAxis} stroke="#8884d8" strokeWidth={2} />
            </RechartsLine>
          </ResponsiveContainer>
        )
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBar data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxis} fill="#8884d8" />
            </RechartsBar>
          </ResponsiveContainer>
        )
      
      case 'pie':
        const pieData = chartData.map(row => ({
          name: row[xAxis],
          value: row[yAxis]
        }))
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPie>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Analysis</h1>
          <p className="text-gray-600">Upload CSV files and visualize your data with interactive charts</p>
        </div>

        {/* Upload Section */}
        {data.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-flex p-6 rounded-full bg-indigo-100 mb-4">
                <FileSpreadsheet className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Your Data</h2>
              <p className="text-gray-600 mb-6">Upload a CSV file to get started with data analysis</p>
              
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                <Upload className="h-5 w-5" />
                Choose CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              
              {loading && (
                <p className="mt-4 text-sm text-gray-500">Loading data...</p>
              )}
            </div>
          </div>
        )}

        {/* Data Preview & Analysis */}
        {data.length > 0 && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                  <select
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis</label>
                  <select
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                    <Upload className="h-4 w-4" />
                    Upload New
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Visualization</h2>
              {renderChart()}
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Insights</h2>
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <p key={index} className="text-gray-700">{insight}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Preview</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map(col => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        {columns.map(col => (
                          <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[col]?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 10 && (
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    Showing 10 of {data.length} rows
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
