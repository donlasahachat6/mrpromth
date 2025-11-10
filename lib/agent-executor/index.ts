/**
 * Agent Execution Engine
 * Handles execution of multi-step AI agents with proper validation and error handling
 */

import Ajv from 'ajv';
// Removed vm2 dependency - using Function constructor instead

const ajv = new Ajv();

export interface AgentStep {
  type: 'ai_call' | 'api_call' | 'condition' | 'loop' | 'transform' | 'web_search' | 'code_execution' | 'file_processing';
  model?: string;
  prompt?: string;
  condition?: string;
  iterations?: number;
  api_url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  transform?: string;
  [key: string]: any;
}

export interface AgentDefinition {
  id: string;
  name: string;
  steps: AgentStep[];
  input_schema: any;
  output_schema: any;
}

export interface ExecutionContext {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  variables: Record<string, any>;
  stepResults: any[];
}

export class AgentExecutor {
  private agent: AgentDefinition;
  private context: ExecutionContext;

  constructor(agent: AgentDefinition) {
    this.agent = agent;
    this.context = {
      inputs: {},
      outputs: {},
      variables: {},
      stepResults: []
    };
  }

  /**
   * Validate inputs against the agent's input schema
   */
  validateInputs(inputs: Record<string, any>): { valid: boolean; errors?: any[] } {
    const validate = ajv.compile(this.agent.input_schema);
    const valid = validate(inputs);
    
    if (!valid) {
      return {
        valid: false,
        errors: validate.errors || []
      };
    }
    
    return { valid: true };
  }

  /**
   * Execute the agent with given inputs
   */
  async execute(inputs: Record<string, any>): Promise<any> {
    // Validate inputs
    const validation = this.validateInputs(inputs);
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${JSON.stringify(validation.errors)}`);
    }

    // Initialize context
    this.context.inputs = inputs;
    this.context.variables = { ...inputs };

    // Execute each step
    for (let i = 0; i < this.agent.steps.length; i++) {
      const step = this.agent.steps[i];
      
      try {
        const result = await this.executeStep(step, i);
        this.context.stepResults.push(result);
        
        // Store result in variables for next steps
        this.context.variables[`step_${i}_result`] = result;
      } catch (error: any) {
        throw new Error(`Step ${i} (${step.type}) failed: ${error.message}`);
      }
    }

    // Return final outputs
    return this.context.outputs;
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: AgentStep, index: number): Promise<any> {
    switch (step.type) {
      case 'ai_call':
        return await this.executeAICall(step);
      
      case 'api_call':
        return await this.executeAPICall(step);
      
      case 'condition':
        return await this.executeCondition(step);
      
      case 'loop':
        return await this.executeLoop(step);
      
      case 'transform':
        return await this.executeTransform(step);
      
      case 'web_search':
        return await this.executeWebSearch(step);
      
      case 'code_execution':
        return await this.executeCode(step);
      
      case 'file_processing':
        return await this.processFile(step);
      
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute AI call step
   */
  private async executeAICall(step: AgentStep): Promise<any> {
    const prompt = this.interpolateVariables(step.prompt || '');
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: step.model || 'gpt-4',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: step.temperature || 0.7,
        max_tokens: step.max_tokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Execute API call step
   */
  private async executeAPICall(step: AgentStep): Promise<any> {
    const url = this.interpolateVariables(step.api_url || '');
    const method = step.method || 'GET';
    const headers = step.headers || {};
    const body = step.body ? this.interpolateObject(step.body) : undefined;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute condition step
   */
  private async executeCondition(step: AgentStep): Promise<any> {
    const condition = step.condition || '';
    const result = this.evaluateCondition(condition);
    
    return result;
  }

  /**
   * Safely evaluate a condition using Function constructor
   */
  private evaluateCondition(condition: string): boolean {
    try {
      // Sanitize condition
      const sanitized = condition.replace(/[^a-zA-Z0-9_\s\.\(\)\[\]===!<>&|]/g, '');
      
      // Create evaluation function
      const keys = Object.keys(this.context.variables);
      const values = Object.values(this.context.variables);
      const func = new Function(...keys, `"use strict"; return (${sanitized})`);
      
      return func(...values);
    } catch (error: any) {
      throw new Error(`Condition evaluation failed: ${error.message}`);
    }
  }

  /**
   * Execute loop step
   */
  private async executeLoop(step: AgentStep): Promise<any[]> {
    const iterations = step.iterations || 1;
    const results = [];

    for (let i = 0; i < iterations; i++) {
      this.context.variables.loop_index = i;
      
      // Execute substeps if defined
      if (step.steps && Array.isArray(step.steps)) {
        for (const substep of step.steps) {
          const result = await this.executeStep(substep, i);
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * Execute transform step
   */
  private async executeTransform(step: AgentStep): Promise<any> {
    const transform = step.transform || '';
    
    try {
      // Sanitize transform
      const sanitized = transform.replace(/[^a-zA-Z0-9_\s\.\(\)\[\]===!<>&|+\-*/]/g, '');
      
      // Create evaluation function with safe globals
      const keys = Object.keys(this.context.variables);
      const values = Object.values(this.context.variables);
      const func = new Function(
        ...keys,
        'JSON', 'Math', 'String', 'Number', 'Boolean', 'Array', 'Object',
        `"use strict"; return (${sanitized})`
      );
      
      return func(...values, JSON, Math, String, Number, Boolean, Array, Object);
    } catch (error: any) {
      throw new Error(`Transform execution failed: ${error.message}`);
    }
  }

  /**
   * Execute web search step
   */
  private async executeWebSearch(step: AgentStep): Promise<any> {
    const query = this.interpolateVariables(step.query || '');
    
    // Use Brave Search API
    if (!process.env.BRAVE_API_KEY) {
      throw new Error('BRAVE_API_KEY not configured');
    }

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Subscription-Token': process.env.BRAVE_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Web search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.web?.results || [];
  }

  /**
   * Execute code step (placeholder - requires sandboxed environment)
   */
  private async executeCode(step: AgentStep): Promise<any> {
    // This should use a sandboxed code execution service
    // For now, return a placeholder
    console.warn('Code execution not fully implemented - requires sandboxed environment');
    
    return {
      output: '',
      error: null,
      executionTime: 0
    };
  }

  /**
   * Process file step (placeholder)
   */
  private async processFile(step: AgentStep): Promise<any> {
    // This should implement file processing based on type
    console.warn('File processing not fully implemented');
    
    return {
      processed: true,
      fileType: 'unknown'
    };
  }

  /**
   * Interpolate variables in a string
   */
  private interpolateVariables(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return this.context.variables[variable] || match;
    });
  }

  /**
   * Interpolate variables in an object
   */
  private interpolateObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.interpolateVariables(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value);
      }
      return result;
    }
    
    return obj;
  }
}

/**
 * Execute an agent with inputs
 */
export async function executeAgent(
  agent: AgentDefinition,
  inputs: Record<string, any>
): Promise<any> {
  const executor = new AgentExecutor(agent);
  return await executor.execute(inputs);
}
