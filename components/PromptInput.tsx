'use client';

import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';

interface PromptInputProps {
  onGenerate: (prompt: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function PromptInput({ onGenerate, isLoading = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    await onGenerate(trimmed);
  };

  const examplePrompts = [
    'สร้างเว็บ e-commerce สำหรับคาเฟ่ มีระบบสั่ง preorder และสะสมแต้มสมาชิก',
    'ออกแบบแพลตฟอร์มจัดตารางเรียนออนไลน์ พร้อมระบบชำระเงินและ dashboard ครู',
    'สร้าง landing page สำหรับ startup ด้านสุขภาพ พร้อมบล็อกและระบบนัดหมายแพทย์',
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur">
        <label htmlFor="mr-promth-prompt" className="text-sm font-medium text-muted-foreground">
          What would you like Mr.Promth to build for you?
        </label>
        <textarea
          id="mr-promth-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="ตัวอย่าง: สร้างเว็บสำหรับเวิร์คช็อปสอนทำขนม มีระบบจองรอบและเก็บอีเมลลูกค้า"
          className="mt-3 w-full resize-y rounded-2xl border border-border/80 bg-card/90 px-4 py-3 text-base leading-7 text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
          rows={4}
          disabled={isLoading}
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {examplePrompts.map((example) => (
              <button
                type="button"
                key={example}
                className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                onClick={() => setPrompt(example)}
              >
                {example}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !prompt.trim()}
            className="w-full rounded-full bg-primary px-6 py-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 sm:w-auto"
          >
            {isLoading ? 'Generating...' : 'Generate Website'}
          </Button>
        </div>
      </div>
    </form>
  );
}
