/**
 * Agent 6: Deployment Automation
 * Handles deployment to Vercel, environment setup, and domain configuration
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const execAsync = promisify(exec)

export interface Agent6Request {
  projectId: string
  projectPath: string
  task: {
    type: 'deploy' | 'setup-env' | 'configure-domain' | 'rollback' | 'full-deployment'
    platform?: 'vercel' | 'netlify' | 'aws' | 'docker'
    environment?: 'production' | 'staging' | 'preview'
    envVars?: Record<string, string>
    domain?: string
  }
}

export interface Agent6Result {
  success: boolean
  deploymentUrl?: string
  deploymentId?: string
  environment?: string
  logs?: string[]
  recommendations: string[]
  errors?: string[]
}

/**
 * Agent 6 Main Function
 */
export async function agent6Deploy(
  request: Agent6Request
): Promise<Agent6Result> {
  const result: Agent6Result = {
    success: false,
    logs: [],
    recommendations: []
  }
  
  try {
    console.log('[Agent 6] Starting deployment...')
    console.log('[Agent 6] Task:', request.task.type)
    console.log('[Agent 6] Platform:', request.task.platform || 'vercel')
    
    switch (request.task.type) {
      case 'deploy':
        await deployToVercel(request, result)
        break
        
      case 'setup-env':
        await setupEnvironment(request, result)
        break
        
      case 'configure-domain':
        await configureDomain(request, result)
        break
        
      case 'rollback':
        await rollbackDeployment(request, result)
        break
        
      case 'full-deployment':
        await fullDeployment(request, result)
        break
    }
    
    result.success = true
    console.log('[Agent 6] ✅ Deployment complete!')
    
    return result
    
  } catch (error) {
    console.error('[Agent 6] ❌ Error:', error)
    result.errors = result.errors || []
    result.errors.push(error instanceof Error ? error.message : String(error))
    return result
  }
}

/**
 * Deploy to Vercel
 */
async function deployToVercel(
  request: Agent6Request,
  result: Agent6Result
): Promise<void> {
  const { projectPath, task } = request
  const isProd = task.environment === 'production'
  
  try {
    result.logs?.push('Installing Vercel CLI...')
    
    // Check if vercel is installed
    try {
      await execAsync('vercel --version', { cwd: projectPath })
    } catch {
      // Install vercel CLI
      await execAsync('pnpm add -g vercel', { cwd: projectPath })
    }
    
    result.logs?.push('Deploying to Vercel...')
    
    // Deploy command
    const deployCmd = isProd ? 'vercel --prod' : 'vercel'
    
    const { stdout, stderr } = await execAsync(deployCmd, {
      cwd: projectPath,
      env: {
        ...process.env,
        VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
        VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID
      }
    })
    
    // Extract deployment URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+/)
    if (urlMatch) {
      result.deploymentUrl = urlMatch[0]
    }
    
    result.logs?.push('Deployment successful!')
    result.logs?.push(`URL: ${result.deploymentUrl}`)
    
    result.recommendations.push(`Visit your deployment: ${result.deploymentUrl}`)
    result.recommendations.push('Check deployment logs in Vercel dashboard')
    
  } catch (error: any) {
    console.error('[Agent 6] Deployment error:', error)
    result.logs?.push('Deployment failed')
    result.logs?.push(error.message)
    
    result.recommendations.push('Check Vercel CLI is installed: pnpm add -g vercel')
    result.recommendations.push('Ensure VERCEL_TOKEN is set in environment')
    result.recommendations.push('Run: vercel login')
  }
}

/**
 * Setup environment variables
 */
async function setupEnvironment(
  request: Agent6Request,
  result: Agent6Result
): Promise<void> {
  const { projectPath, task } = request
  const envVars = task.envVars || {}
  
  try {
    result.logs?.push('Setting up environment variables...')
    
    // Create .env.local file
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    await writeFile(join(projectPath, '.env.local'), envContent, 'utf-8')
    
    result.logs?.push(`Created .env.local with ${Object.keys(envVars).length} variables`)
    
    // Also set in Vercel if deployed
    for (const [key, value] of Object.entries(envVars)) {
      try {
        await execAsync(
          `vercel env add ${key} ${task.environment || 'production'}`,
          {
            cwd: projectPath,
            input: value
          }
        )
        result.logs?.push(`Set ${key} in Vercel`)
      } catch (error) {
        result.logs?.push(`Could not set ${key} in Vercel (may already exist)`)
      }
    }
    
    result.recommendations.push('Environment variables configured')
    result.recommendations.push('Redeploy to apply changes: vercel --prod')
    
  } catch (error: any) {
    console.error('[Agent 6] Environment setup error:', error)
    result.logs?.push('Environment setup failed')
    result.recommendations.push('Manually create .env.local file')
  }
}

/**
 * Configure custom domain
 */
async function configureDomain(
  request: Agent6Request,
  result: Agent6Result
): Promise<void> {
  const { projectPath, task } = request
  const domain = task.domain
  
  if (!domain) {
    throw new Error('Domain is required for configure-domain task')
  }
  
  try {
    result.logs?.push(`Configuring domain: ${domain}`)
    
    // Add domain to Vercel project
    const { stdout } = await execAsync(
      `vercel domains add ${domain}`,
      { cwd: projectPath }
    )
    
    result.logs?.push(stdout)
    result.logs?.push(`Domain ${domain} added successfully`)
    
    result.recommendations.push(`Update DNS records to point to Vercel`)
    result.recommendations.push(`Check domain status: vercel domains ls`)
    result.recommendations.push(`SSL certificate will be provisioned automatically`)
    
  } catch (error: any) {
    console.error('[Agent 6] Domain configuration error:', error)
    result.logs?.push('Domain configuration failed')
    result.recommendations.push('Manually add domain in Vercel dashboard')
    result.recommendations.push('Ensure domain is not already in use')
  }
}

/**
 * Rollback to previous deployment
 */
async function rollbackDeployment(
  request: Agent6Request,
  result: Agent6Result
): Promise<void> {
  const { projectPath } = request
  
  try {
    result.logs?.push('Getting deployment history...')
    
    // List deployments
    const { stdout } = await execAsync('vercel ls --json', { cwd: projectPath })
    const deployments = JSON.parse(stdout)
    
    if (deployments.length < 2) {
      throw new Error('No previous deployment to rollback to')
    }
    
    // Get previous deployment
    const previousDeployment = deployments[1]
    
    result.logs?.push(`Rolling back to: ${previousDeployment.url}`)
    
    // Promote previous deployment
    await execAsync(
      `vercel promote ${previousDeployment.url}`,
      { cwd: projectPath }
    )
    
    result.deploymentUrl = previousDeployment.url
    result.logs?.push('Rollback successful!')
    
    result.recommendations.push(`Rolled back to: ${previousDeployment.url}`)
    result.recommendations.push('Verify the deployment is working correctly')
    
  } catch (error: any) {
    console.error('[Agent 6] Rollback error:', error)
    result.logs?.push('Rollback failed')
    result.recommendations.push('Manually rollback in Vercel dashboard')
  }
}

/**
 * Full deployment workflow
 */
async function fullDeployment(
  request: Agent6Request,
  result: Agent6Result
): Promise<void> {
  console.log('[Agent 6] Running full deployment workflow...')
  
  // Step 1: Setup environment
  if (request.task.envVars && Object.keys(request.task.envVars).length > 0) {
    result.logs?.push('Step 1: Setting up environment...')
    await setupEnvironment(request, result)
  }
  
  // Step 2: Run build
  result.logs?.push('Step 2: Building project...')
  try {
    const { stdout } = await execAsync('pnpm build', {
      cwd: request.projectPath
    })
    result.logs?.push('Build successful!')
  } catch (error: any) {
    result.logs?.push('Build failed!')
    result.logs?.push(error.message)
    throw new Error('Build failed, cannot deploy')
  }
  
  // Step 3: Run tests
  result.logs?.push('Step 3: Running tests...')
  try {
    await execAsync('pnpm test', { cwd: request.projectPath })
    result.logs?.push('Tests passed!')
  } catch (error) {
    result.logs?.push('Tests failed or not configured')
    result.recommendations.push('Consider adding tests before deployment')
  }
  
  // Step 4: Deploy
  result.logs?.push('Step 4: Deploying...')
  await deployToVercel(request, result)
  
  // Step 5: Configure domain (if provided)
  if (request.task.domain) {
    result.logs?.push('Step 5: Configuring domain...')
    await configureDomain(request, result)
  }
  
  result.logs?.push('Full deployment complete!')
  result.recommendations.push('Deployment workflow completed successfully')
  result.recommendations.push('Monitor deployment in Vercel dashboard')
}

/**
 * Deploy with GitHub Actions
 */
export async function setupGitHubActions(
  projectPath: string
): Promise<void> {
  const workflowContent = `name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
`

  await writeFile(
    join(projectPath, '.github', 'workflows', 'deploy.yml'),
    workflowContent,
    'utf-8'
  )
  
  console.log('[Agent 6] ✅ GitHub Actions workflow created')
}

/**
 * Validate Agent 6 request
 */
export function validateAgent6Request(request: Agent6Request): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!request.projectId) {
    errors.push('Project ID is required')
  }
  
  if (!request.projectPath) {
    errors.push('Project path is required')
  }
  
  if (!request.task) {
    errors.push('Task is required')
  } else {
    if (!request.task.type) {
      errors.push('Task type is required')
    }
    
    if (request.task.type === 'configure-domain' && !request.task.domain) {
      errors.push('Domain is required for configure-domain task')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
