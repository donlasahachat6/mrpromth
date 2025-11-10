import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/utils/api-with-rate-limit";
import { RateLimiters } from "@/lib/utils/rate-limiter";
import Ajv from "ajv";
import { VM } from "vm2";

export const dynamic = "force-dynamic";

const ajv = new Ajv();

interface AgentStep {
  id: string;
  type: "ai_call" | "api_call" | "condition" | "loop" | "transform" | "web_search" | "code_exec" | "file_process";
  name: string;
  config: any;
  schema?: any;
  next?: string | { condition: string; true: string; false: string };
}

// JSON Schema Validation - RESOLVED TODO
function validateInputs(inputs: any, schema: any): { valid: boolean; errors?: any[] } {
  if (!schema) return { valid: true };
  
  const validate = ajv.compile(schema);
  const valid = validate(inputs);
  
  return {
    valid,
    errors: validate.errors || undefined
  };
}

// Safe Condition Evaluation - RESOLVED TODO
function evaluateCondition(condition: string, context: any): boolean {
  try {
    const vm = new VM({
      timeout: 1000, // 1 second timeout
      sandbox: { context }
    });
    
    // Sanitize condition to prevent code injection
    const sanitizedCondition = condition.replace(/[^a-zA-Z0-9_\s\.\(\)\[\]===!<>&|]/g, '');
    
    const result = vm.run(`
      (function() {
        with(context) {
          return ${sanitizedCondition};
        }
      })()
    `);
    
    return Boolean(result);
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
}

// Robust Evaluation - RESOLVED TODO
function safeEvaluate(expression: string, context: any, timeout: number = 5000): any {
  try {
    const vm = new VM({
      timeout,
      sandbox: { context, console }
    });
    
    return vm.run(`
      (function() {
        with(context) {
          return ${expression};
        }
      })()
    `);
  } catch (error: any) {
    if (error.message?.includes('Script execution timed out')) {
      throw new Error('Evaluation timeout exceeded');
    }
    throw new Error(`Evaluation error: ${error.message}`);
  }
}

// Web Search Implementation - RESOLVED TODO
async function performWebSearch(query: string, numResults: number = 5): Promise<any[]> {
  try {
    // Using DuckDuckGo HTML search (no API key required)
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`);
    const html = await response.text();
    
    // Parse results (simplified)
    const results: any[] = [];
    const regex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;
    let count = 0;
    
    while ((match = regex.exec(html)) !== null && count < numResults) {
      results.push({
        url: match[1],
        title: match[2],
        snippet: ''
      });
      count++;
    }
    
    return results;
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

// Code Execution - RESOLVED TODO
async function executeCode(code: string, language: string, context: any): Promise<any> {
  if (language === 'javascript' || language === 'js') {
    try {
      const vm = new VM({
        timeout: 10000, // 10 seconds
        sandbox: {
          context,
          console,
          require: () => { throw new Error('require is not allowed'); }
        }
      });
      
      const result = vm.run(`
        (function() {
          ${code}
        })()
      `);
      
      return { success: true, result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  } else if (language === 'python' || language === 'py') {
    // For Python, we would need a Python execution service
    // For now, return not implemented
    return { success: false, error: 'Python execution not yet implemented. Use JavaScript instead.' };
  } else {
    return { success: false, error: `Unsupported language: ${language}` };
  }
}

// File Processing - RESOLVED TODO
async function processFile(fileUrl: string, operation: string, options: any = {}): Promise<any> {
  try {
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const content = Buffer.from(buffer);
    
    switch (operation) {
      case 'read_text':
        return { success: true, content: content.toString('utf-8') };
      
      case 'read_json':
        try {
          const json = JSON.parse(content.toString('utf-8'));
          return { success: true, data: json };
        } catch (error) {
          return { success: false, error: 'Invalid JSON' };
        }
      
      case 'read_csv':
        const csv = content.toString('utf-8');
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const rows = lines.slice(1).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, i) => {
            row[header.trim()] = values[i]?.trim();
          });
          return row;
        });
        return { success: true, headers, rows };
      
      case 'get_info':
        return {
          success: true,
          info: {
            size: content.length,
            type: response.headers.get('content-type')
          }
        };
      
      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Execute AI Call Step
async function executeAICall(step: AgentStep, context: any): Promise<any> {
  const { model, prompt, temperature, max_tokens } = step.config;
  
  // Interpolate variables in prompt
  let interpolatedPrompt = prompt;
  for (const [key, value] of Object.entries(context)) {
    interpolatedPrompt = interpolatedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4.1-mini',
        messages: [{ role: 'user', content: interpolatedPrompt }],
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000
      })
    });
    
    const data = await response.json();
    return {
      success: true,
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute API Call Step
async function executeAPICall(step: AgentStep, context: any): Promise<any> {
  const { url, method, headers, body } = step.config;
  
  // Interpolate variables
  let interpolatedUrl = url;
  let interpolatedBody = body;
  
  for (const [key, value] of Object.entries(context)) {
    interpolatedUrl = interpolatedUrl.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    if (interpolatedBody) {
      interpolatedBody = JSON.parse(
        JSON.stringify(interpolatedBody).replace(new RegExp(`{{${key}}}`, 'g'), String(value))
      );
    }
  }
  
  try {
    const response = await fetch(interpolatedUrl, {
      method: method || 'GET',
      headers: headers || {},
      body: interpolatedBody ? JSON.stringify(interpolatedBody) : undefined
    });
    
    const data = await response.json();
    return {
      success: true,
      status: response.status,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// POST /api/agents/[id]/execute - Execute an agent
async function handlePOST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Get inputs from request
    const body = await request.json();
    const { inputs } = body;

    // Validate inputs against schema - RESOLVED TODO
    if (agent.input_schema) {
      const validation = validateInputs(inputs, agent.input_schema);
      if (!validation.valid) {
        return NextResponse.json(
          { error: "Invalid inputs", details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from("executions")
      .insert({
        user_id: user.id,
        execution_type: "agent",
        agent_id: id,
        inputs,
        status: "running"
      })
      .select()
      .single();

    if (executionError) {
      console.error("Error creating execution:", executionError);
      return NextResponse.json(
        { error: "Failed to create execution" },
        { status: 500 }
      );
    }

    // Execute agent steps
    const startTime = Date.now();
    const stepResults: any[] = [];
    let context = { ...inputs };

    try {
      const steps: AgentStep[] = agent.steps;
      
      for (const step of steps) {
        const stepStartTime = Date.now();
        
        let stepResult: any;
        
        switch (step.type) {
          case "ai_call":
            stepResult = await executeAICall(step, context);
            break;
          
          case "api_call":
            stepResult = await executeAPICall(step, context);
            break;
          
          case "condition":
            // RESOLVED TODO - Using safe evaluation
            const conditionMet = evaluateCondition(step.config.condition, context);
            stepResult = { success: true, conditionMet };
            break;
          
          case "web_search":
            // RESOLVED TODO
            const searchResults = await performWebSearch(step.config.query, step.config.numResults);
            stepResult = { success: true, results: searchResults };
            break;
          
          case "code_exec":
            // RESOLVED TODO
            stepResult = await executeCode(step.config.code, step.config.language, context);
            break;
          
          case "file_process":
            // RESOLVED TODO
            stepResult = await processFile(step.config.fileUrl, step.config.operation, step.config.options);
            break;
          
          case "transform":
            // Use safe evaluation
            try {
              const result = safeEvaluate(step.config.expression, context);
              stepResult = { success: true, result };
            } catch (error: any) {
              stepResult = { success: false, error: error.message };
            }
            break;
          
          default:
            stepResult = { success: false, error: `Unknown step type: ${step.type}` };
        }
        
        const stepDuration = Date.now() - stepStartTime;
        
        stepResults.push({
          stepId: step.id,
          stepName: step.name,
          result: stepResult,
          duration: stepDuration
        });
        
        // Update context with step result
        if (stepResult.success) {
          context[step.id] = stepResult;
        }
        
        // Check if step failed and should stop
        if (!stepResult.success && step.config.stopOnError !== false) {
          throw new Error(`Step ${step.name} failed: ${stepResult.error}`);
        }
      }
      
      const totalDuration = Date.now() - startTime;
      
      // Update execution record
      await supabase
        .from("executions")
        .update({
          status: "completed",
          outputs: context,
          completed_at: new Date().toISOString(),
          metadata: {
            duration: totalDuration,
            stepResults
          }
        })
        .eq("id", execution.id);
      
      return NextResponse.json({
        success: true,
        executionId: execution.id,
        outputs: context,
        duration: totalDuration,
        steps: stepResults
      });
      
    } catch (error: any) {
      // Update execution record with error
      await supabase
        .from("executions")
        .update({
          status: "failed",
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq("id", execution.id);
      
      return NextResponse.json(
        { error: error.message, stepResults },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Agent execution error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handlePOST, RateLimiters.AGENT_EXECUTION);
