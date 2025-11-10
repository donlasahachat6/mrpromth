/**
 * Workflow Repository
 * Data access layer for workflows with caching support
 */

import { db } from '../db-client'
import { cache, CacheKeys } from '../cache-manager'
import { ErrorFactory, retryWithBackoff } from '../../utils/error-handler'
import { performanceMonitor } from '../../utils/performance-monitor'

/**
 * Workflow data structure
 */
export interface Workflow {
  id: string
  user_id: string
  project_name: string
  project_description?: string | null
  status: string
  result?: any | null
  error?: string | null
  created_at: string
  updated_at: string
  project_package_url?: string | null
  deployment_url?: string | null
  github_repo_url?: string | null
  progress?: number
}

/**
 * Workflow create input
 */
export interface CreateWorkflowInput {
  id?: string
  user_id: string
  project_name: string
  project_description?: string
  status?: string
  result?: any
  error?: string
  progress?: number
}

/**
 * Workflow update input
 */
export interface UpdateWorkflowInput {
  project_name?: string
  project_description?: string
  status?: string
  result?: any
  error?: string
  project_package_url?: string
  deployment_url?: string
  github_repo_url?: string
  progress?: number
}

/**
 * Workflow repository class
 */
export class WorkflowRepository {
  /**
   * Create a new workflow
   */
  async create(input: CreateWorkflowInput): Promise<Workflow> {
    return performanceMonitor.measure('workflow_create', async () => {
      const workflow: any = {
        id: input.id || `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: input.user_id,
        project_name: input.project_name,
        project_description: input.project_description || null,
        status: input.status || 'pending',
        result: input.result || null,
        error: input.error || null,
        progress: input.progress || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await retryWithBackoff(
        async () => db.insert<Workflow>('workflows', workflow),
        { maxRetries: 3 }
      )

      if (error) {
        throw ErrorFactory.database('Failed to create workflow', { error })
      }

      const created = data![0]

      // Cache the workflow
      cache.set(CacheKeys.workflow(created.id), created, 300000) // 5 minutes

      // Invalidate user's workflow list
      cache.delete(CacheKeys.workflowList(input.user_id))

      return created
    })
  }

  /**
   * Get workflow by ID
   */
  async findById(id: string): Promise<Workflow | null> {
    return performanceMonitor.measure('workflow_find_by_id', async () => {
      // Try cache first
      const cached = cache.get<Workflow>(CacheKeys.workflow(id))
      if (cached) {
        return cached
      }

      // Query database
      const { data, error } = await db.select<Workflow>('workflows', {
        match: { id },
        limit: 1,
      })

      if (error) {
        throw ErrorFactory.database('Failed to find workflow', { error, id })
      }

      const workflow = data && data.length > 0 ? data[0] : null

      // Cache if found
      if (workflow) {
        cache.set(CacheKeys.workflow(id), workflow, 300000)
      }

      return workflow
    })
  }

  /**
   * Get workflows by user ID
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number
      orderBy?: 'created_at' | 'updated_at'
      ascending?: boolean
    }
  ): Promise<Workflow[]> {
    return performanceMonitor.measure('workflow_find_by_user', async () => {
      const cacheKey = CacheKeys.workflowList(userId)

      // Try cache first (only if no custom options)
      if (!options || (!options.limit && !options.orderBy)) {
        const cached = cache.get<Workflow[]>(cacheKey)
        if (cached) {
          return cached
        }
      }

      // Query database
      const { data, error } = await db.select<Workflow>('workflows', {
        match: { user_id: userId },
        order: {
          column: options?.orderBy || 'created_at',
          ascending: options?.ascending ?? false,
        },
        limit: options?.limit,
      })

      if (error) {
        throw ErrorFactory.database('Failed to find workflows', { error, userId })
      }

      const workflows = data || []

      // Cache if no custom options
      if (!options || (!options.limit && !options.orderBy)) {
        cache.set(cacheKey, workflows, 300000)
      }

      return workflows
    })
  }

  /**
   * Update workflow
   */
  async update(id: string, input: UpdateWorkflowInput): Promise<Workflow> {
    return performanceMonitor.measure('workflow_update', async () => {
      const updateData: any = {
        ...input,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await retryWithBackoff(
        async () => db.update<Workflow>('workflows', updateData, { id }),
        { maxRetries: 3 }
      )

      if (error) {
        throw ErrorFactory.database('Failed to update workflow', { error, id })
      }

      if (!data || data.length === 0) {
        throw ErrorFactory.notFound('Workflow')
      }

      const updated = data[0]

      // Update cache
      cache.set(CacheKeys.workflow(id), updated, 300000)

      // Invalidate user's workflow list
      cache.delete(CacheKeys.workflowList(updated.user_id))

      return updated
    })
  }

  /**
   * Delete workflow
   */
  async delete(id: string): Promise<void> {
    return performanceMonitor.measure('workflow_delete', async () => {
      // Get workflow first to invalidate user cache
      const workflow = await this.findById(id)

      const { error } = await db.delete('workflows', { id })

      if (error) {
        throw ErrorFactory.database('Failed to delete workflow', { error, id })
      }

      // Clear cache
      cache.delete(CacheKeys.workflow(id))

      if (workflow) {
        cache.delete(CacheKeys.workflowList(workflow.user_id))
      }
    })
  }

  /**
   * Get workflow count by user
   */
  async countByUserId(userId: string): Promise<number> {
    const workflows = await this.findByUserId(userId)
    return workflows.length
  }

  /**
   * Get recent workflows
   */
  async getRecent(limit: number = 10): Promise<Workflow[]> {
    const { data, error } = await db.select<Workflow>('workflows', {
      order: { column: 'created_at', ascending: false },
      limit,
    })

    if (error) {
      throw ErrorFactory.database('Failed to get recent workflows', { error })
    }

    return data || []
  }

  /**
   * Get workflows by status
   */
  async findByStatus(status: string): Promise<Workflow[]> {
    const { data, error } = await db.select<Workflow>('workflows', {
      match: { status },
      order: { column: 'updated_at', ascending: false },
    })

    if (error) {
      throw ErrorFactory.database('Failed to find workflows by status', { error, status })
    }

    return data || []
  }

  /**
   * Clear cache for user
   */
  clearUserCache(userId: string): void {
    cache.delete(CacheKeys.workflowList(userId))
  }

  /**
   * Clear cache for workflow
   */
  clearWorkflowCache(id: string): void {
    cache.delete(CacheKeys.workflow(id))
  }
}

/**
 * Global workflow repository instance
 */
export const workflowRepository = new WorkflowRepository()
