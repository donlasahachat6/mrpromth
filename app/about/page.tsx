import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { Sparkles, Code, Database, Zap, Shield, Rocket } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-modern section-spacing-sm">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">
                About Mr.Prompt
              </h1>
            </div>
          </div>
        </section>

        <section className="container-narrow py-16">
          <div className="space-y-12">
            <div className="card-modern">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg">
                Mr.Prompt ถูกสร้างขึ้นเพื่อทำให้การพัฒนาเว็บไซต์เป็นเรื่องง่าย และเข้าถึงได้สำหรับทุกคน 
                ไม่ว่าจะมีพื้นฐานการเขียนโค้ดหรือไม่ก็ตาม เราเชื่อว่าทุกคนควรมีโอกาสสร้างสรรค์ไอเดียของตัวเองให้เป็นจริง
              </p>
            </div>

            <div className="card-modern">
              <h2 className="text-3xl font-bold mb-6">Technology</h2>
              <p className="text-muted-foreground mb-6">ระบบของเราใช้เทคโนโลยี AI ที่ทันสมัยที่สุด ประกอบด้วย:</p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  '7 AI Agents ที่เชี่ยวชาญเฉพาะด้าน',
                  'Next.js 14 และ TypeScript',
                  'Supabase สำหรับ Database และ Authentication',
                  'Vercel สำหรับ Deployment',
                  'Vanchin AI สำหรับ AI Processing',
                  'GitHub Integration',
                ].map((tech, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-modern">
              <h2 className="text-3xl font-bold mb-6">How It Works</h2>
              <p className="text-muted-foreground mb-8">
                Mr.Prompt ใช้ระบบ Multi-Agent AI Chain ที่ทำงานร่วมกันเพื่อสร้างโปรเจกต์ Full-Stack:
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { step: 1, title: 'วิเคราะห์ความต้องการ', desc: 'Agent วิเคราะห์คำอธิบายของคุณ', icon: Sparkles },
                  { step: 2, title: 'ออกแบบสถาปัตยกรรม', desc: 'ออกแบบโครงสร้างระบบ', icon: Code },
                  { step: 3, title: 'สร้าง Frontend', desc: 'สร้าง UI Components', icon: Code },
                  { step: 4, title: 'สร้าง Backend', desc: 'สร้าง API และ Logic', icon: Database },
                  { step: 5, title: 'ออกแบบ Database', desc: 'จัดการข้อมูล', icon: Database },
                  { step: 6, title: 'ทดสอบระบบ', desc: 'ตรวจสอบคุณภาพ', icon: Shield },
                  { step: 7, title: 'Deploy', desc: 'จัดการ Deployment', icon: Rocket },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="p-4 rounded-lg border border-border hover:shadow-md transition-smooth">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {item.step}
                        </div>
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-modern">
              <h2 className="text-3xl font-bold mb-6">Why Choose Mr.Prompt?</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { icon: Zap, title: 'รวดเร็ว', desc: 'สร้างเว็บไซต์ได้ภายในไม่กี่นาที' },
                  { icon: Sparkles, title: 'แม่นยำ', desc: 'AI เข้าใจความต้องการของคุณ' },
                  { icon: Code, title: 'ปรับแต่งได้', desc: 'แก้ไขโค้ดได้ตามต้องการ' },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                      <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-modern text-center">
              <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-6">
                หากมีคำถามหรือข้อเสนอแนะ สามารถติดต่อเราได้ที่
              </p>
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                ติดต่อเรา
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container-modern py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2024 Mr.Prompt. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">Privacy Policy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-smooth">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
