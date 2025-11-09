import React from 'react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About Mr.Prompt</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          Mr.Prompt ถูกสร้างขึ้นเพื่อทำให้การพัฒนาเว็บไซต์เป็นเรื่องง่าย 
          และเข้าถึงได้สำหรับทุกคน ไม่ว่าจะมีพื้นฐานการเขียนโค้ดหรือไม่ก็ตาม 
          เราเชื่อว่าทุกคนควรมีโอกาสสร้างสรรค์ไอเดียของตัวเองให้เป็นจริง
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Technology</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          ระบบของเราใช้เทคโนโลยี AI ที่ทันสมัยที่สุด ประกอบด้วย:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>7 AI Agents ที่เชี่ยวชาญเฉพาะด้าน</li>
          <li>Next.js 14 และ TypeScript</li>
          <li>Supabase สำหรับ Database และ Authentication</li>
          <li>Vercel สำหรับ Deployment</li>
          <li>Vanchin AI สำหรับ AI Processing</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Mr.Prompt ใช้ระบบ Multi-Agent AI Chain ที่ทำงานร่วมกันเพื่อสร้างโปรเจกต์ Full-Stack:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
            <h3 className="font-semibold mb-2">วิเคราะห์ความต้องการ</h3>
            <p className="text-gray-600">Agent 1 วิเคราะห์คำอธิบายของคุณและเข้าใจความต้องการ</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">2</div>
            <h3 className="font-semibold mb-2">ออกแบบสถาปัตยกรรม</h3>
            <p className="text-gray-600">Agent 2 ออกแบบโครงสร้างและสถาปัตยกรรมของระบบ</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
            <h3 className="font-semibold mb-2">สร้าง Frontend</h3>
            <p className="text-gray-600">Agent 3 สร้าง UI Components และหน้าเว็บต่างๆ</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">4</div>
            <h3 className="font-semibold mb-2">สร้าง Backend</h3>
            <p className="text-gray-600">Agent 4 สร้าง API และ Server-side Logic</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-pink-600 mb-2">5</div>
            <h3 className="font-semibold mb-2">ออกแบบ Database</h3>
            <p className="text-gray-600">Agent 5 ออกแบบ Schema และจัดการข้อมูล</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">6</div>
            <h3 className="font-semibold mb-2">ทดสอบระบบ</h3>
            <p className="text-gray-600">Agent 6 สร้าง Test Cases และตรวจสอบคุณภาพ</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-indigo-600 mb-2">7</div>
            <h3 className="font-semibold mb-2">Deploy</h3>
            <p className="text-gray-600">Agent 7 จัดการ Deployment และ Configuration</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Mr.Prompt?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-semibold mb-2">รวดเร็ว</h3>
            <p className="text-gray-600">สร้างเว็บไซต์ได้ภายในไม่กี่นาที</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-semibold mb-2">แม่นยำ</h3>
            <p className="text-gray-600">AI เข้าใจความต้องการของคุณ</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="font-semibold mb-2">ปรับแต่งได้</h3>
            <p className="text-gray-600">แก้ไขโค้ดได้ตามต้องการ</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="text-gray-700">
          หากมีคำถามหรือข้อเสนอแนะ สามารถติดต่อเราได้ที่ 
          <a href="/contact" className="text-blue-600 hover:underline ml-1">
            หน้า Contact
          </a>
        </p>
      </section>
    </div>
  );
}
