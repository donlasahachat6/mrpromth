import { performance } from "node:perf_hooks";

import type { SupabaseClient } from "@supabase/supabase-js";

import { executeAgent1 } from "./agent1";
import { executeAgent2 } from "./agent2";
import type {
  Agent1Output,
  Agent2Output,
  AgentChainResultPayload,
} from "./types";

export type AgentStatus = "pending" | "running" | "completed" | "error";

export interface AgentProgressEvent {
  agentNumber: number;
  agentName: string;
  status: AgentStatus;
  totalAgents: number;
  attempt: number;
  output?: unknown;
  error?: string;
}

export type AgentChainResult = AgentChainResultPayload;

interface AgentOutputs {
  agent1_output?: Agent1Output;
  agent2_output?: Agent2Output;
  agent3_output?: unknown;
  agent4_output?: unknown;
  agent5_output?: unknown;
  agent6_output?: unknown;
  agent7_output?: unknown;
}

interface AgentExecutionContext {
  userPrompt: string;
  outputs: AgentOutputs;
}

interface AgentDefinition<TKey extends keyof AgentOutputs = keyof AgentOutputs> {
  number: number;
  name: string;
  key: TKey;
  run?: (context: AgentExecutionContext) => Promise<AgentOutputs[TKey]>;
}

const AGENTS: AgentDefinition[] = [
  {
    number: 1,
    name: "Prompt Expander & Analyzer",
    key: "agent1_output",
    run: async ({ userPrompt }) => executeAgent1(userPrompt),
  },
  {
    number: 2,
    name: "Architecture Designer",
    key: "agent2_output",
    run: async ({ outputs }) => {
      if (!outputs.agent1_output) {
        throw new Error("Agent 2 requires Agent 1 output but none was found");
      }
      return executeAgent2(outputs.agent1_output);
    },
  },
  {
    number: 3,
    name: "Database & Backend Developer",
    key: "agent3_output",
  },
  {
    number: 4,
    name: "Frontend Component Developer",
    key: "agent4_output",
  },
  {
    number: 5,
    name: "Integration & Logic Developer",
    key: "agent5_output",
  },
  {
    number: 6,
    name: "Testing & Quality Assurance",
    key: "agent6_output",
  },
  {
    number: 7,
    name: "Optimization & Deployment",
    key: "agent7_output",
  },
];

interface AgentChainOrchestratorOptions {
  supabase: SupabaseClient;
  projectId: string;
  userId: string;
  onProgress?: (event: AgentProgressEvent) => Promise<void> | void;
  maxRetries?: number;
}

export class AgentChainOrchestrator {
  private readonly supabase: SupabaseClient;
  private readonly projectId: string;
  private readonly userId: string;
  private readonly onProgress?: (event: AgentProgressEvent) => Promise<void> | void;
  private readonly maxRetries: number;
  private readonly totalAgents: number;

  constructor(options: AgentChainOrchestratorOptions) {
    this.supabase = options.supabase;
    this.projectId = options.projectId;
    this.userId = options.userId;
    this.onProgress = options.onProgress;
    this.maxRetries = options.maxRetries ?? 1;
    this.totalAgents = AGENTS.length;
  }

  async execute(userPrompt: string): Promise<AgentChainResult> {
    const outputs: AgentOutputs = {};
    const executableAgents = AGENTS.filter((agent) => typeof agent.run === "function");

    for (const definition of executableAgents) {
      await this.updateProject({
        status: "running",
        current_agent: definition.number,
        agent_outputs: this.serializeOutputs(outputs),
      });

      await this.emitProgress({
        agentNumber: definition.number,
        agentName: definition.name,
        status: "running",
        attempt: 1,
      });

      const executionStart = performance.now();
      let attempt = 0;
      let lastError: unknown;

      while (attempt <= this.maxRetries) {
        attempt += 1;
        try {
          const output = await definition.run!({ userPrompt, outputs });
          (outputs as Record<string, unknown>)[definition.key] = output;

          const executionTimeMs = Math.round(performance.now() - executionStart);

          await this.insertAgentLog({
            agentNumber: definition.number,
            agentName: definition.name,
            status: "completed",
            output,
            executionTimeMs,
          });

          const isLastExecutedAgent = definition.number === executableAgents[executableAgents.length - 1].number;

          await this.updateProject({
            status: isLastExecutedAgent ? "completed" : "running",
            current_agent: definition.number,
            agent_outputs: this.serializeOutputs(outputs),
            ...(isLastExecutedAgent
              ? {
                  final_output: this.serializeFinalResult(outputs),
                }
              : {}),
          });

          await this.emitProgress({
            agentNumber: definition.number,
            agentName: definition.name,
            status: "completed",
            totalAgents: this.totalAgents,
            attempt,
            output,
          });

          break;
        } catch (error) {
          lastError = error;

          if (attempt > this.maxRetries) {
            const executionTimeMs = Math.round(performance.now() - executionStart);

            await this.insertAgentLog({
              agentNumber: definition.number,
              agentName: definition.name,
              status: "error",
              executionTimeMs,
              error: error instanceof Error ? error.message : String(error),
            });

            await this.updateProject({
              status: "error",
              current_agent: definition.number,
              agent_outputs: this.serializeOutputs(outputs),
              error_message: error instanceof Error ? error.message : String(error),
            });

            await this.emitProgress({
              agentNumber: definition.number,
              agentName: definition.name,
              status: "error",
              totalAgents: this.totalAgents,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });

            throw error;
          }

          await this.emitProgress({
            agentNumber: definition.number,
            agentName: definition.name,
            status: "running",
            totalAgents: this.totalAgents,
            attempt: attempt + 1,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (lastError) {
        throw lastError;
      }
    }

    if (!outputs.agent1_output || !outputs.agent2_output) {
      throw new Error("Agent chain finished without mandatory outputs from agents 1 and 2");
    }

    const finalResult: AgentChainResult = {
      agent1_output: outputs.agent1_output,
      agent2_output: outputs.agent2_output,
      final_project: null,
    };

    return finalResult;
  }

  private async updateProject(data: Record<string, unknown>) {
    const { error } = await this.supabase
      .from("projects")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", this.projectId)
      .eq("user_id", this.userId);

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  private async insertAgentLog(params: {
    agentNumber: number;
    agentName: string;
    status: AgentStatus;
    executionTimeMs: number;
    output?: unknown;
    error?: string;
  }) {
    const { error } = await this.supabase.from("agent_logs").insert({
      project_id: this.projectId,
      agent_number: params.agentNumber,
      agent_name: params.agentName,
      status: params.status,
      output: params.output ?? null,
      error_message: params.error ?? null,
      execution_time_ms: params.executionTimeMs,
    });

    if (error) {
      throw new Error(`Failed to record agent log: ${error.message}`);
    }
  }

  private serializeOutputs(outputs: AgentOutputs) {
    return JSON.parse(JSON.stringify(outputs));
  }

  private serializeFinalResult(outputs: AgentOutputs) {
    const result: Partial<AgentChainResult> = {
      agent1_output: outputs.agent1_output,
      agent2_output: outputs.agent2_output,
      final_project: null,
    };
    return JSON.parse(JSON.stringify(result));
  }

  private async emitProgress(event: Omit<AgentProgressEvent, "totalAgents"> & { totalAgents?: number }) {
    if (!this.onProgress) return;

    await this.onProgress({
      totalAgents: this.totalAgents,
      ...event,
    });
  }
}
