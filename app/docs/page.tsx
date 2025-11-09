import React from 'react';

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Documentation</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="text-gray-700 mb-4">
          Mr.Prompt เป็นแพลตฟอร์ม AI Agent ที่ช่วยสร้างเว็บไซต์ Full-Stack 
          จากคำสั่งภาษาธรรมชาติ ภายในไม่กี่นาที
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>สมัครสมาชิกและเข้าสู่ระบบ</li>
          <li>ไปที่หน้า Dashboard</li>
          <li>กรอกคำอธิบายโปรเจกต์ที่ต้องการสร้าง</li>
          <li>กดปุ่ม "สร้างเว็บไซต์"</li>
          <li>รอให้ AI Agents สร้างโปรเจกต์ให้</li>
          <li>Download หรือ Deploy โปรเจกต์ของคุณ</li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>AI-Powered Code Generation</li>
          <li>7 Specialized AI Agents</li>
          <li>Full-Stack Projects (Next.js + TypeScript)</li>
          <li>Auto Deploy to Vercel</li>
          <li>GitHub Integration</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Reference</h2>
        <p className="text-gray-700">
          สำหรับ API Documentation โปรดดูที่ 
          <a href="/api-docs" className="text-blue-600 hover:underline ml-1">
            API Docs
          </a>
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">AI Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Agent 1: Project Analyzer</h3>
            <p className="text-gray-600">วิเคราะห์และเข้าใจความต้องการของโปรเจกต์</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Agent 2: Architecture Designer</h3>
            <p className="text-gray-600">ออกแบบสถาปัตยกรรมของระบบ</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Agent 3: Frontend Developer</h3>
            <p className="text-gray-600">สร้าง UI Components และ Pages</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Agent 4: Backend Developer</h3>
            <p className="text-gray-600">สร้าง API Routes และ Server Logic</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Agent 5: Database Designer</h3>
            <p className="text-gray-600">ออกแบบ Schema และ Migrations</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Agent 6: Testing Engineer</h3>
            <p className="text-gray-600">สร้าง Test Cases และ Quality Assurance</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Agent 7: Deployment Specialist</h3>
            <p className="text-gray-600">จัดการ Deployment และ Configuration</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Q: ทำไม AI ไม่ตอบกลับ?</h3>
            <p className="text-gray-700">A: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง หากยังไม่ได้ กรุณาติดต่อทีมสนับสนุน</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Q: สามารถแก้ไขโค้ดที่ AI สร้างได้หรือไม่?</h3>
            <p className="text-gray-700">A: ได้ คุณสามารถแก้ไขโค้ดใน Code Editor ได้ตามต้องการ</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Q: Deploy ไปที่ไหนได้บ้าง?</h3>
            <p className="text-gray-700">A: ปัจจุบันรองรับ Vercel และคุณสามารถ Download เป็น ZIP ไป Deploy เองได้</p>
          </div>
        </div>
      </section>
    </div>
  );
}
