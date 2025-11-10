/**
 * Optimized Workflow Orchestrator
 * เวอร์ชันที่ปรับปรุงประสิทธิภาพและความน่าเชื่อถือ
 */

import { createClient } from '@supabase/supabase-js'
import { workflowEvents } from './events'
import { ProjectManager } from '../file-manager/project-manager'
import { executeWithSmartSelection, modelSelector } from '../ai/smart-model-selector'
import { performanceMonitor } from '../utils/performance-monitor'
import { ErrorFactory, retryWithBackoff, withTimeout } from '../utils/error-handler'
import { ENV } from '../env'

export interface WorkflowRequest {
  userId: string
  projectName: string
  prompt: string
  options?: {
    skipTesting?: boolean
    skipDeployment?: boolean
    autoGitHub?: boolean
    timeout?: number
  }
}

export interface WorkflowState {
  id: string
  userId: string
  projectName: string
  projectPath: string
  status: 'pending' | 'analyzing' | 'expanding' | 'generating-backend' | 'generating-frontend' | 'testing' | 'deploying' | 'monitoring' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  progress: number
  results: {
    analysis?: any
    expansion?: any
    backend?: any
    frontend?: any
    testing?: any
    deployment?: any
    monitoring?: any
    package?: {
      zipPath: string
      downloadUrl: string
      size: number
      fileCount: number
    }
  }
  errors: string[]
  performance?: {
    totalDuration: number
    stepDurations: Record<string, number>
  }
  createdAt: string
  updatedAt: string
}

/**
 * Optimized Workflow Orchestrator
 */
export class OptimizedWorkflowOrchestrator {
  private state: WorkflowState
  private supabase: ReturnType<typeof createClient>
  private projectManager: ProjectManager
  private startTime: number

  constructor(request: WorkflowRequest) {
    this.projectManager = new ProjectManager()
    this.startTime = Date.now()
    
    this.state = {
      id: this.generateId(),
      userId: request.userId,
      projectName: request.projectName,
      projectPath: `/tmp/projects/${request.userId}/${this.sanitizeName(request.projectName)}`,
      status: 'pending',
      currentStep: 0,
      totalSteps: 7,
      progress: 0,
      results: {},
      errors: [],
      performance: {
        totalDuration: 0,
        stepDurations: {},
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.supabase = createClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_SERVICE_ROLE_KEY
    )
  }

  /**
   * Execute workflow with optimizations
   */
  async execute(prompt: string, options?: WorkflowRequest['options']): Promise<WorkflowState> {
    const workflowTimeout = options?.timeout || 300000 // 5 minutes default

    try {
      console.log('[OptimizedWorkflow] Starting workflow:', this.state.id)

      // Wrap entire workflow with timeout
      await withTimeout(
        async () => {
          // Save initial state
          await this.saveState()

          // Step 1: Analyze prompt
          await this.executeStep('analyzing', 1, async () => {
            const analysis = await this.analyzePrompt(prompt)
            this.state.results.analysis = analysis
          })

          // Step 2: Expand prompt
          await this.executeStep('expanding', 2, async () => {
            const expansion = await this.expandPrompt(this.state.results.analysis)
            this.state.results.expansion = expansion
          })

          // Step 3: Generate backend
          await this.executeStep('generating-backend', 3, async () => {
            const backend = await this.generateBackend(this.state.results.expansion)
            this.state.results.backend = backend
          })

          // Step 4: Generate frontend
          await this.executeStep('generating-frontend', 4, async () => {
            const frontend = await this.generateFrontend(this.state.results.expansion)
            this.state.results.frontend = frontend
          })

          // Step 5: Testing (optional)
          if (!options?.skipTesting) {
            await this.executeStep('testing', 5, async () => {
              const testing = await this.runTests()
              this.state.results.testing = testing
            })
          }

          // Step 6: Deployment (optional)
          if (!options?.skipDeployment) {
            await this.executeStep('deploying', 6, async () => {
              const deployment = await this.deploy()
              this.state.results.deployment = deployment
            })
          }

          // Step 7: Monitoring
          await this.executeStep('monitoring', 7, async () => {
            const monitoring = await this.setupMonitoring()
            this.state.results.monitoring = monitoring
          })

          // Step 8: Package project
          await this.executeStep('completed', 7, async () => {
            const packageResult = await this.packageProject()
            this.state.results.package = packageResult
          })
        },
        workflowTimeout,
        'Workflow execution'
      )

      // Calculate total duration
      this.state.performance!.totalDuration = Date.now() - this.startTime

      // Complete
      await this.updateStatus('completed', 7)
      console.log('[OptimizedWorkflow] ✅ Workflow completed:', this.state.id)

      // Emit completion event
      workflowEvents.emitComplete(this.state.id, {
        success: true,
        results: this.state.results,
        duration: this.state.performance!.totalDuration,
      })

      // Print performance summary
      this.printPerformanceSummary()

      return this.state
    } catch (error) {
      console.error('[OptimizedWorkflow] ❌ Error:', error)
      this.state.status = 'failed'
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.state.errors.push(errorMessage)
      await this.saveState()

      // Emit error event
      workflowEvents.emitError(this.state.id, {
        error: errorMessage,
        step: this.state.currentStep,
        recoverable: false,
      })

      // Emit completion event with failure
      workflowEvents.emitComplete(this.state.id, {
        success: false,
        results: this.state.results,
        duration: Date.now() - this.startTime,
      })

      throw error
    }
  }

  /**
   * Execute a workflow step with monitoring and error handling
   */
  private async executeStep(
    status: WorkflowState['status'],
    stepNumber: number,
    operation: () => Promise<void>
  ): Promise<void> {
    await this.updateStatus(status, stepNumber)

    const stepName = `workflow_step_${stepNumber}_${status}`
    const stepStartTime = Date.now()

    try {
      // Execute with performance monitoring
      await performanceMonitor.measure(stepName, operation, {
        workflowId: this.state.id,
        step: stepNumber,
      })

      // Record step duration
      const stepDuration = Date.now() - stepStartTime
      this.state.performance!.stepDurations[status] = stepDuration

      await this.saveState()
    } catch (error) {
      console.error(`[OptimizedWorkflow] Step ${stepNumber} (${status}) failed:`, error)
      throw error
    }
  }

  /**
   * Analyze prompt with retry logic
   */
  private async analyzePrompt(prompt: string): Promise<any> {
    console.log('[OptimizedWorkflow] Analyzing prompt...')

    workflowEvents.emitProgress(this.state.id, {
      step: 1,
      totalSteps: this.state.totalSteps,
      status: 'analyzing',
      message: 'Analyzing your requirements with AI...',
      progress: Math.round((1 / this.state.totalSteps) * 100),
    })

    const analysisPrompt = `Analyze this project request and provide a structured analysis:

Project Request: ${prompt}

Provide:
1. Project type (e.g., web app, mobile app, API)
2. Key features needed
3. Complexity level (simple/medium/complex)
4. Estimated development time
5. Recommended tech stack

Respond in JSON format.`

    // Use smart model selection with retry
    const result = await retryWithBackoff(
      async () => {
        return executeWithSmartSelection(
          [{ role: 'user', content: analysisPrompt }],
          'analysis',
          { temperature: 0.3, maxTokens: 1000, retries: 2 }
        )
      },
      {
        maxRetries: 3,
        onRetry: (attempt, error) => {
          console.log(`[OptimizedWorkflow] Analysis retry ${attempt}:`, error.message)
        },
      }
    )

    console.log('[OptimizedWorkflow] AI Analysis completed with model:', result.modelKey)

    // Parse AI response
    try {
      const jsonMatch = result.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.warn('[OptimizedWorkflow] Failed to parse AI response, using fallback')
    }

    // Fallback analysis
    return {
      type: this.detectProjectType(prompt),
      features: this.extractFeatures(prompt),
      complexity: this.estimateComplexity(prompt),
      estimatedTime: '10-15 minutes',
      aiAnalysis: result.response,
    }
  }

  /**
   * Expand prompt with optimization
   */
  private async expandPrompt(analysis: any): Promise<any> {
    console.log('[OptimizedWorkflow] Expanding prompt...')

    workflowEvents.emitProgress(this.state.id, {
      step: 2,
      totalSteps: this.state.totalSteps,
      status: 'expanding',
      message: 'Creating detailed specifications...',
      progress: Math.round((2 / this.state.totalSteps) * 100),
    })

    const expansionPrompt = `Based on this analysis, create detailed technical specifications:

Analysis: ${JSON.stringify(analysis, null, 2)}
Project: ${this.state.projectName}

Provide detailed specs for:
1. Backend (API endpoints, database schema, authentication)
2. Frontend (pages, components, styling)
3. File structure
4. Dependencies

Respond in JSON format.`

    const result = await retryWithBackoff(
      async () => {
        return executeWithSmartSelection(
          [{ role: 'user', content: expansionPrompt }],
          'analysis',
          { temperature: 0.4, maxTokens: 2000, retries: 2 }
        )
      },
      { maxRetries: 3 }
    )

    console.log('[OptimizedWorkflow] Expansion completed with model:', result.modelKey)

    // Parse or use fallback
    try {
      const jsonMatch = result.response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.warn('[OptimizedWorkflow] Failed to parse expansion, using fallback')
    }

    return {
      backend: { description: 'REST API', endpoints: ['items'] },
      frontend: { description: 'Web app', pages: ['home'] },
      fileStructure: ['src/', 'public/'],
      dependencies: ['next', 'react'],
    }
  }

  /**
   * Generate backend code
   */
  private async generateBackend(expansion: any): Promise<any> {
    console.log('[OptimizedWorkflow] Generating backend...')

    workflowEvents.emitProgress(this.state.id, {
      step: 3,
      totalSteps: this.state.totalSteps,
      status: 'generating-backend',
      message: 'Generating backend code...',
      progress: Math.round((3 / this.state.totalSteps) * 100),
    })

    // Import agent
    const { agent3GenerateBackend } = await import('../agents/agent3-code-generator')

    return await retryWithBackoff(
      async () => {
        return agent3GenerateBackend({
          projectId: this.state.id,
          projectPath: this.state.projectPath,
          task: {
            type: 'api',
            description: `Generate backend for ${this.state.projectName}`,
            specifications: expansion.backend || {}
          }
        })
      },
      { maxRetries: 2 }
    )
  }

  /**
   * Generate frontend code
   */
  private async generateFrontend(expansion: any): Promise<any> {
    console.log('[OptimizedWorkflow] Generating frontend...')

    workflowEvents.emitProgress(this.state.id, {
      step: 4,
      totalSteps: this.state.totalSteps,
      status: 'generating-frontend',
      message: 'Generating frontend code...',
      progress: Math.round((4 / this.state.totalSteps) * 100),
    })

    const { agent4GenerateFrontend } = await import('../agents/agent4-frontend-generator')

    return await retryWithBackoff(
      async () => {
        return agent4GenerateFrontend({
          projectId: this.state.id,
          projectPath: this.state.projectPath,
          task: {
            type: 'page',
            description: `Generate frontend for ${this.state.projectName}`,
            specifications: expansion.frontend || {}
          }
        })
      },
      { maxRetries: 2 }
    )
  }

  /**
   * Run tests
   */
  private async runTests(): Promise<any> {
    console.log('[OptimizedWorkflow] Running tests...')

    workflowEvents.emitProgress(this.state.id, {
      step: 5,
      totalSteps: this.state.totalSteps,
      status: 'testing',
      message: 'Running tests...',
      progress: Math.round((5 / this.state.totalSteps) * 100),
    })

    const { agent5TestingQA } = await import('../agents/agent5-testing-qa')

    return await agent5TestingQA({
      projectId: this.state.id,
      projectPath: this.state.projectPath,
      task: {
        type: 'full-qa',
        testFramework: 'jest',
        coverageThreshold: 80
      }
    })
  }

  /**
   * Deploy project
   */
  private async deploy(): Promise<any> {
    console.log('[OptimizedWorkflow] Deploying...')

    workflowEvents.emitProgress(this.state.id, {
      step: 6,
      totalSteps: this.state.totalSteps,
      status: 'deploying',
      message: 'Deploying to Vercel...',
      progress: Math.round((6 / this.state.totalSteps) * 100),
    })

    const { agent6Deploy } = await import('../agents/agent6-deployment')

    return await agent6Deploy({
      projectId: this.state.id,
      projectPath: this.state.projectPath,
      task: {
        type: 'full-deployment',
        platform: 'vercel',
        environment: 'production'
      }
    })
  }

  /**
   * Setup monitoring
   */
  private async setupMonitoring(): Promise<any> {
    console.log('[OptimizedWorkflow] Setting up monitoring...')

    workflowEvents.emitProgress(this.state.id, {
      step: 7,
      totalSteps: this.state.totalSteps,
      status: 'monitoring',
      message: 'Setting up monitoring...',
      progress: Math.round((7 / this.state.totalSteps) * 100),
    })

    const { agent7Monitor } = await import('../agents/agent7-monitoring')

    return await agent7Monitor({
      projectId: this.state.id,
      task: {
        type: 'analytics',
        data: {
          projectPath: this.state.projectPath,
          projectName: this.state.projectName
        }
      }
    })
  }

  /**
   * Package project
   */
  private async packageProject(): Promise<any> {
    console.log('[OptimizedWorkflow] Packaging project...')

    const packageResult = await this.projectManager.packageProject(
      this.state.projectPath,
      this.state.id
    )

    return {
      zipPath: packageResult.zipPath,
      downloadUrl: `/api/projects/${this.state.id}/download`,
      size: packageResult.size,
      fileCount: packageResult.fileCount,
    }
  }

  /**
   * Helper methods
   */
  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  }

  private detectProjectType(prompt: string): string {
    const lower = prompt.toLowerCase()
    if (lower.includes('api')) return 'api'
    if (lower.includes('blog')) return 'blog'
    if (lower.includes('dashboard')) return 'dashboard'
    if (lower.includes('e-commerce') || lower.includes('shop')) return 'e-commerce'
    return 'web-app'
  }

  private extractFeatures(prompt: string): string[] {
    const features: string[] = []
    const lower = prompt.toLowerCase()

    if (lower.includes('auth') || lower.includes('login')) features.push('authentication')
    if (lower.includes('database') || lower.includes('crud')) features.push('database')
    if (lower.includes('api')) features.push('api')
    if (lower.includes('responsive')) features.push('responsive-design')

    return features.length > 0 ? features : ['basic-functionality']
  }

  private estimateComplexity(prompt: string): string {
    const wordCount = prompt.split(/\s+/).length
    if (wordCount < 20) return 'simple'
    if (wordCount < 50) return 'medium'
    return 'complex'
  }

  private async updateStatus(
    status: WorkflowState['status'],
    step: number
  ): Promise<void> {
    this.state.status = status
    this.state.currentStep = step
    this.state.progress = Math.round((step / this.state.totalSteps) * 100)
    this.state.updatedAt = new Date().toISOString()
  }

  private async saveState(): Promise<void> {
    try {
      const { error } = await this.supabase.from('workflows').upsert({
        id: this.state.id,
        user_id: this.state.userId,
        project_name: this.state.projectName,
        status: this.state.status,
        progress: this.state.progress,
        result: this.state.results,
        error: this.state.errors.join(', ') || null,
        updated_at: this.state.updatedAt,
      } as any)

      if (error) {
        console.error('[OptimizedWorkflow] Failed to save state:', error)
      }
    } catch (error) {
      console.error('[OptimizedWorkflow] Error saving state:', error)
    }
  }

  private printPerformanceSummary(): void {
    console.log('\n' + '='.repeat(80))
    console.log('📊 Workflow Performance Summary')
    console.log('='.repeat(80))
    console.log(`Workflow ID: ${this.state.id}`)
    console.log(`Total Duration: ${this.state.performance!.totalDuration}ms`)
    console.log('\nStep Durations:')
    
    for (const [step, duration] of Object.entries(this.state.performance!.stepDurations)) {
      console.log(`  ${step}: ${duration}ms`)
    }
    
    console.log('='.repeat(80))

    // Print AI model metrics
    modelSelector.printMetrics()
  }
}
