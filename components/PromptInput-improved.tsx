"use client";

import { FormEvent, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, Github, Sparkles, MessageSquare, Zap, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PromptInputProps {
  onGenerate: (prompt: string) => void | Promise<void>;
  isLoading?: boolean;
}

type Mode = 'agent' | 'chat' | 'auto';

export function PromptInput({ onGenerate, isLoading = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('auto');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    await onGenerate(trimmed);
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGitHubImport = async () => {
    try {
      // Redirect to GitHub import page
      window.location.href = '/api/github/import';
    } catch (error) {
      console.error('GitHub import error:', error);
      alert('Failed to start GitHub import. Please try again.');
    }
  };

  const examplePrompts = [
    'สร้างเว็บ e-commerce สำหรับคาเฟ่ มีระบบสั่ง preorder และสะสมแต้มสมาชิก',
    'ออกแบบแพลตฟอร์มจัดตารางเรียนออนไลน์ พร้อมระบบชำระเงินและ dashboard ครู',
    'สร้าง landing page สำหรับ startup ด้านสุขภาพ พร้อมบล็อกและระบบนัดหมายแพทย์',
  ];

  const getModeIcon = (m: Mode) => {
    switch (m) {
      case 'agent': return <Sparkles className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'auto': return <Zap className="h-4 w-4" />;
    }
  };

  const getModeLabel = (m: Mode) => {
    switch (m) {
      case 'agent': return 'Agent Mode';
      case 'chat': return 'Chat Mode';
      case 'auto': return 'Auto Mode';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="mr-promth-prompt" className="text-sm font-medium text-muted-foreground">
            บอก AI ว่าคุณต้องการอะไร
          </label>
          
          {/* Mode Selector */}
          <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <SelectTrigger className="w-[160px] h-8">
              <div className="flex items-center gap-2">
                {getModeIcon(mode)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Auto Mode
                </div>
              </SelectItem>
              <SelectItem value="agent">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Agent Mode
                </div>
              </SelectItem>
              <SelectItem value="chat">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat Mode
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <textarea
          id="mr-promth-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="ตัวอย่าง: สร้างเว็บสำหรับเวิร์คช็อปสอนทำขนม มีระบบจองรอบและเก็บอีเมลลูกค้า"
          className="mt-3 w-full resize-y rounded-2xl border border-border/80 bg-card/90 px-4 py-3 text-base leading-7 text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
          rows={8}
          disabled={isLoading}
        />

        {/* Attached Files - IMPROVED UI */}
        {attachedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-muted-foreground font-medium">
              ไฟล์ที่แนบ ({attachedFiles.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm group hover:bg-muted transition-colors"
                >
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground font-medium max-w-[200px] truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-1 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                    title="ลบไฟล์"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Action Buttons - IMPROVED LAYOUT */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".txt,.md,.json,.js,.ts,.tsx,.jsx,.html,.css,.py,.java,.cpp,.c,.go,.rs,.rb,.php"
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFileAttach}
              disabled={isLoading}
              className="gap-2"
            >
              <Paperclip className="h-4 w-4" />
              <span className="hidden sm:inline">แนบไฟล์</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGitHubImport}
              disabled={isLoading}
              className="gap-2"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
          </div>

          {/* Submit Button - IMPROVED */}
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>กำลังสร้าง...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>สร้างเว็บไซต์</span>
              </>
            )}
          </Button>
        </div>

        {/* Mode Description */}
        <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="mt-0.5">{getModeIcon(mode)}</div>
            <div>
              <span className="font-semibold text-foreground">{getModeLabel(mode)}:</span>{' '}
              {mode === 'auto' && 'AI จะเลือกโหมดที่เหมาะสมให้อัตโนมัติ (แนะนำ)'}
              {mode === 'agent' && 'ใช้ Agent Chain สร้างเว็บไซต์แบบเต็มรูปแบบ'}
              {mode === 'chat' && 'คุยกับ AI แบบ interactive เพื่อพัฒนาโปรเจกต์'}
            </div>
          </div>
        </div>

        {/* Example Prompts - IMPROVED */}
        <div className="mt-4 space-y-2">
          <div className="text-xs text-muted-foreground font-medium">ตัวอย่าง Prompt:</div>
          <div className="grid gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(example)}
                disabled={isLoading}
                className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
