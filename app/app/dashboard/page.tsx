'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AgentChainProgress, AgentStep, AgentStepStatus } from '@/components/AgentChainProgress';
import { PromptInput } from '@/components/PromptInput';
import { ProjectOutput } from '@/components/ProjectOutput';
import type {
  Agent1Output,
  Agent2Output,
  AgentChainResultPayload,
  AgentLogRecord,
  ProjectRecord,
} from '@/lib/agents/types';

const TOTAL_AGENTS = 7;

type AgentTemplate = Pick<AgentStep, 'id' | 'title' | 'description'>;

const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 1,
    title: 'Prompt Expander & Analyzer',
    description: 'แปลง prompt เริ่มต้นให้เป็นสเปคโปรเจกต์ที่ละเอียด ครอบคลุมทุกความต้องการ',
  },
  {
    id: 2,
    title: 'Architecture Designer',
    description: 'วางสถาปัตยกรรมระบบ โครงสร้าง database และ dependency ทั้งหมด',
  },
  {
    id: 3,
    title: 'Database & Backend Developer',
    description: 'สร้างสคริปต์ migration และ API routes ตามสเปค',
  },
  {
    id: 4,
    title: 'Frontend Component Developer',
    description: 'ประกอบ UI components และหน้าเว็บให้ตรงตามดีไซน์',
  },
  {
    id: 5,
    title: 'Integration & Logic Developer',
    description: 'เชื่อมต่อ frontend-backend จัดการ state validation และ business logic',
  },
  {
    id: 6,
    title: 'Testing & Quality Assurance',
    description: 'สร้างชุดทดสอบ ตรวจสอบคุณภาพและความเสถียรของระบบ',
  },
  {
    id: 7,
    title: 'Optimization & Deployment',
    description: 'ปรับประสิทธิภาพและเตรียม configuration สำหรับ deploy ขึ้น Vercel',
  },
];

function summarizeLog(agentNumber: number, output: unknown): string | undefined {
  if (!output || typeof output !== 'object') {
    return undefined;
  }

  if (agentNumber === 1) {
    const spec = output as Partial<Agent1Output>;
    const featureCount = Array.isArray(spec.features) ? spec.features.length : 0;
    const pageCount = Array.isArray(spec.pages) ? spec.pages.length : 0;
    const projectType = spec.project_type ?? 'Unknown';
    return `Project: ${projectType} · Features: ${featureCount} · Pages: ${pageCount}`;
  }

  if (agentNumber === 2) {
    const architecture = output as Partial<Agent2Output>;
    const tableCount = architecture.database_schema?.tables?.length ?? 0;
    const endpointCount = architecture.api_endpoints?.length ?? 0;
    return `Tables: ${tableCount} · APIs: ${endpointCount}`;
  }

  return undefined;
}

function buildSteps(
  templates: AgentTemplate[],
  project: ProjectRecord | null,
  logs: AgentLogRecord[],
): AgentStep[] {
  return templates.map((template) => {
    const log = logs.find((entry) => entry.agent_number === template.id) ?? null;
    let status: AgentStepStatus = 'idle';

    if (log) {
      if (log.status === 'completed') status = 'completed';
      else if (log.status === 'error') status = 'error';
    } else if (project) {
      if (project.status === 'error' && project.current_agent === template.id) {
        status = 'error';
      } else if (project.status === 'running' && project.current_agent === template.id) {
        status = 'running';
      } else if (project.status === 'pending' && template.id === 1) {
        status = 'running';
      }
    }

    return {
      ...template,
      status,
      outputPreview: summarizeLog(template.id, log?.output ?? undefined),
    } satisfies AgentStep;
  });
}

function formatSpecSection(output: Agent1Output): string {
  const lines = [
    `Project Type: ${output.project_type}`,
    `Design Style: ${output.design_style}`,
    '',
  ];

  if (output.features?.length) {
    lines.push('Key Features:', ...output.features.map((feature) => `• ${feature}`), '');
  }

  if (output.pages?.length) {
    lines.push('Core Pages:', ...output.pages.map((page) => `• ${page}`), '');
  }

  lines.push('Expanded Specification:', output.expanded_prompt);
  return lines.join('\n');
}

function formatArchitectureSection(output: Agent2Output): string {
  const dependencyEntries = Object.entries(output.dependencies ?? {});
  const tableLines = output.database_schema?.tables?.map(
    (table) => `• ${table.name}: ${table.columns.join(', ')}`,
  ) ?? [];

  const lines = ['Folder Structure:', ...output.folder_structure.app.map((item) => `• app/${item}`), ''];

  if (output.folder_structure.components?.length) {
    lines.push('Components:', ...output.folder_structure.components.map((item) => `• ${item}`), '');
  }

  if (output.api_endpoints?.length) {
    lines.push('API Endpoints:', ...output.api_endpoints.map((endpoint) => `• ${endpoint}`), '');
  }

  if (tableLines.length) {
    lines.push('Database Tables:', ...tableLines, '');
  }

  if (dependencyEntries.length) {
    lines.push(
      'Dependencies:',
      ...dependencyEntries.map(([name, version]) => `• ${name}@${version}`),
      '',
    );
  }

  return lines.join('\n');
}

export default function DashboardPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [logs, setLogs] = useState<AgentLogRecord[]>([]);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  }, []);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;

    const response = await fetch(`/api/projects/${projectId}`);
    if (!response.ok) {
      if (response.status === 404) {
        stopPolling();
      }
      throw new Error('Failed to fetch project status');
    }

    const data: { project: ProjectRecord; logs: AgentLogRecord[] } = await response.json();
    setProject(data.project);
    setLogs(data.logs ?? []);

    if (data.project.status === 'completed' || data.project.status === 'error') {
      stopPolling();
    }
  }, [projectId, stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    if (!projectId) return;

    fetchProject().catch((error) => {
      console.error(error);
      setErrorMessage('ไม่สามารถดึงสถานะโปรเจกต์ได้ กรุณาลองใหม่');
    });

    if (!pollerRef.current) {
      pollerRef.current = setInterval(() => {
        fetchProject().catch((error) => {
          console.error(error);
        });
      }, 3000);
    }
  }, [projectId, fetchProject]);

  const handleGenerate = useCallback(
    async (prompt: string) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      setActivePrompt(prompt);
      setProject(null);
      setLogs([]);
      stopPolling();

      try {
        const response = await fetch('/api/agent-chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start agent chain');
        }

        setProjectId(data.project_id as string);
      } catch (error) {
        console.error(error);
        setErrorMessage(error instanceof Error ? error.message : 'ไม่สามารถเริ่มกระบวนการได้');
      } finally {
        setIsSubmitting(false);
      }
    },
    [stopPolling],
  );

  const derivedSteps = useMemo(() => buildSteps(AGENT_TEMPLATES, project, logs), [project, logs]);

  const chainOutput = useMemo<Partial<AgentChainResultPayload> | null>(() => {
    if (!project) return null;
    if (project.final_output) return project.final_output;
    if (project.agent_outputs && typeof project.agent_outputs === 'object') {
      return project.agent_outputs as Partial<AgentChainResultPayload>;
    }
    return null;
  }, [project]);

  const projectSections = useMemo(() => {
    if (!chainOutput) return undefined;
    const sections: { title: string; content: string; icon?: 'spec' | 'architecture' | 'code' }[] = [];

    if (chainOutput.agent1_output) {
      sections.push({
        title: 'Expanded Specification',
        icon: 'spec',
        content: formatSpecSection(chainOutput.agent1_output),
      });
    }

    if (chainOutput.agent2_output) {
      sections.push({
        title: 'Architecture Blueprint',
        icon: 'architecture',
        content: formatArchitectureSection(chainOutput.agent2_output),
      });
    }

    return sections.length > 0 ? sections : undefined;
  }, [chainOutput]);

  const stats = useMemo(
    () => [
      { label: 'Agents', value: TOTAL_AGENTS.toString() },
      { label: 'Status', value: project?.status ? project.status.toUpperCase() : 'IDLE' },
      { label: 'Deploy Ready', value: 'Vercel' },
    ],
    [project?.status],
  );

  const isGenerating = isSubmitting || (project?.status === 'running' || project?.status === 'pending');

  return (
    <div className="flex flex-1 flex-col gap-10 pb-12">
      <section className="rounded-4xl border border-border/60 bg-card/95 p-10 shadow-xl shadow-primary/10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Agent Chain Platform
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              เปลี่ยนไอเดียให้เป็นเว็บไซต์พร้อมใช้งานในไม่กี่นาที
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground md:max-w-2xl">
              Mr.Promth จัดการทุกขั้นตอนตั้งแต่ขยายความต้องการ วางโครงสร้างระบบ พัฒนาโค้ด ไปจนถึงพร้อม deploy
              ด้วยเอเจนต์ 7 ตัวที่ทำงานต่อเนื่องแบบอัตโนมัติ
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-background/80 px-4 py-5 text-center shadow-sm"
                >
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-secondary/30 bg-secondary/10 p-6 text-secondary-foreground">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary-foreground/70">
                Agent Chain Flow
              </p>
              <p className="mt-4 text-2xl font-semibold">
                User Prompt → Agent 1 → … → Agent 7 → Production
              </p>
            </div>
            <div className="rounded-2xl border border-secondary/40 bg-background/60 px-4 py-4 text-sm text-muted-foreground">
              <p className="font-medium text-secondary-foreground">
                ใช้ VanchinAI เป็นสมองหลัก พร้อมฐานข้อมูล Supabase และ deploy บน Vercel
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground/80">
                Tech Stack: Next.js 14 · React 18 · Tailwind CSS
              </p>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <PromptInput onGenerate={handleGenerate} isLoading={isGenerating} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <AgentChainProgress steps={derivedSteps} />
        <ProjectOutput
          prompt={activePrompt}
          isLoading={isGenerating}
          sections={projectSections}
          errorMessage={project?.error_message ?? null}
        />
      </div>
    </div>
  );
}
