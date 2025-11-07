import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Zap, Shield, Code } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-new-light.png"
              alt="Mr.Prompt"
              width={150}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How it works
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                เริ่มต้นใช้งาน
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <Image
              src="/logo-new-light.png"
              alt="Mr.Prompt"
              width={400}
              height={120}
              className="mx-auto opacity-60"
              priority
            />
          </div>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            แค่บอกว่าคุณต้องการเว็บไซต์แบบไหน AI จะสร้างให้คุณ
            <br />
            ไม่ต้องเขียนโค้ด ไม่ต้องมีพื้นฐาน
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                เริ่มต้นใช้งานฟรี
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                ดูวิธีการทำงาน
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24 md:py-32 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              ทำไมต้อง Mr.Prompt?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI ช่วยสร้างเว็บไซต์ให้คุณ รวดเร็ว ใช้งานง่าย
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">เข้าใจภาษาไทย</h3>
              <p className="text-muted-foreground">
                AI เข้าใจภาษาไทยและความต้องการของคุณ
                สร้างเว็บไซต์ที่ตรงใจ
              </p>
            </div>
            
            <div className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">รวดเร็ว</h3>
              <p className="text-muted-foreground">
                สร้างเว็บไซต์ได้ในไม่กี่นาที
                พร้อมใช้งานทันที
              </p>
            </div>
            
            <div className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">ปลอดภัย</h3>
              <p className="text-muted-foreground">
                มีระบบรักษาความปลอดภัยพื้นฐาน
                ข้อมูลของคุณปลอดภัย
              </p>
            </div>
            
            <div className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">โค้ดคุณภาพดี</h3>
              <p className="text-muted-foreground">
                ใช้เทคโนโลยีสมัยใหม่
                พร้อม deploy ได้
              </p>
            </div>
            
            <div className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">ปรับแต่งได้</h3>
              <p className="text-muted-foreground">
                แก้ไขและปรับแต่งได้ตามต้องการ
                ใช้งานสะดวก
              </p>
            </div>
            
            <div className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">ดูการทำงาน Real-time</h3>
              <p className="text-muted-foreground">
                เห็น AI ทำงานแบบเรียลไทม์
                โปร่งใส เข้าใจง่าย
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              วิธีการทำงาน
            </h2>
            <p className="text-lg text-muted-foreground">
              ง่ายแค่ 3 ขั้นตอน
            </p>
          </div>
          
          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">บอก AI ว่าคุณต้องการเว็บไซต์แบบไหน</h3>
                <p className="text-muted-foreground">
                  เช่น "สร้างเว็บขายกาแฟ มีระบบสั่งซื้อออนไลน์"
                </p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI สร้างเว็บไซต์ให้คุณ</h3>
                <p className="text-muted-foreground">
                  AI จะวิเคราะห์ความต้องการและสร้างเว็บไซต์ให้คุณ
                  คุณสามารถดูการทำงานแบบเรียลไทม์ได้
                </p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">ใช้งานได้ทันที</h3>
                <p className="text-muted-foreground">
                  เว็บไซต์พร้อมใช้งาน สามารถ deploy หรือปรับแต่งเพิ่มเติมได้
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            พร้อมสร้างเว็บไซต์แล้วหรือยัง?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            เริ่มต้นใช้งานฟรี
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              เริ่มต้นใช้งานฟรี
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo-new-light.png"
                  alt="Mr.Prompt"
                  width={120}
                  height={32}
                  className="h-6 w-auto"
                />
              </Link>
              <p className="text-sm text-muted-foreground">
                สร้างเว็บไซต์ด้วย AI
                <br />
                ง่าย รวดเร็ว
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Docs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Mr.Prompt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
