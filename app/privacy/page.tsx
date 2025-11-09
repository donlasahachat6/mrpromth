import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">
        Last updated: {new Date().toLocaleDateString('th-TH')}
      </p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            เราเก็บรวบรวมข้อมูลประเภทต่อไปนี้:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>ข้อมูลส่วนตัว: ชื่อ, อีเมล, รหัสผ่าน (ที่เข้ารหัสแล้ว)</li>
            <li>ข้อมูลการใช้งาน: โปรเจกต์ที่สร้าง, คำสั่งที่ใช้, เวลาการใช้งาน</li>
            <li>ข้อมูลทางเทคนิค: IP Address, Browser Type, Device Information</li>
            <li>ข้อมูลจาก OAuth: ข้อมูลพื้นฐานจาก Google และ GitHub (ตามที่คุณอนุญาต)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. วิธีการใช้ข้อมูล</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            เราใช้ข้อมูลของคุณเพื่อ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>ให้บริการสร้างและจัดการโปรเจกต์</li>
            <li>ปรับปรุงและพัฒนาบริการของเรา</li>
            <li>ส่งการแจ้งเตือนและข้อมูลที่เกี่ยวข้อง</li>
            <li>วิเคราะห์การใช้งานเพื่อปรับปรุงประสบการณ์</li>
            <li>ป้องกันการใช้งานที่ผิดกฎหมายหรือละเมิดข้อกำหนด</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. การแบ่งปันข้อมูล</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            เราไม่ขายหรือแบ่งปันข้อมูลส่วนตัวของคุณกับบุคคลที่สาม ยกเว้น:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>ผู้ให้บริการที่จำเป็นต่อการดำเนินงาน (Supabase, Vercel, Vanchin AI)</li>
            <li>เมื่อมีคำสั่งจากหน่วยงานราชการตามกฎหมาย</li>
            <li>เพื่อปกป้องสิทธิ์และความปลอดภัยของเราและผู้ใช้อื่น</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. ความปลอดภัยของข้อมูล</h2>
          <p className="text-gray-700 leading-relaxed">
            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
            <li>การเข้ารหัสข้อมูลด้วย SSL/TLS</li>
            <li>การเข้ารหัสรหัสผ่านด้วย Bcrypt</li>
            <li>การจำกัดการเข้าถึงข้อมูลเฉพาะผู้มีสิทธิ์</li>
            <li>การตรวจสอบและอัพเดทระบบความปลอดภัยอย่างสม่ำเสมอ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. สิทธิ์ของคุณ</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            คุณมีสิทธิ์ในการ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>เข้าถึงและขอสำเนาข้อมูลส่วนตัวของคุณ</li>
            <li>แก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์</li>
            <li>ลบข้อมูลของคุณ (ยกเว้นข้อมูลที่จำเป็นตามกฎหมาย)</li>
            <li>คัดค้านการประมวลผลข้อมูลบางประเภท</li>
            <li>ถอนความยินยอมที่ให้ไว้</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies และเทคโนโลยีติดตาม</h2>
          <p className="text-gray-700 leading-relaxed">
            เราใช้ Cookies และเทคโนโลยีที่คล้ายกันเพื่อ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
            <li>จดจำการเข้าสู่ระบบของคุณ</li>
            <li>เก็บการตั้งค่าของคุณ</li>
            <li>วิเคราะห์การใช้งานเว็บไซต์</li>
            <li>ปรับปรุงประสบการณ์การใช้งาน</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            คุณสามารถปิดการใช้งาน Cookies ได้ในการตั้งค่าเบราว์เซอร์ แต่อาจส่งผลต่อการใช้งานบางฟีเจอร์
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. การเก็บรักษาข้อมูล</h2>
          <p className="text-gray-700 leading-relaxed">
            เราเก็บรักษาข้อมูลของคุณตдо:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
            <li>คุณลบบัญชีของคุณ</li>
            <li>ข้อมูลไม่จำเป็นต่อวัตถุประสงค์ที่เก็บรวบรวม</li>
            <li>คุณขอให้ลบข้อมูล (ยกเว้นข้อมูลที่จำเป็นตามกฎหมาย)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. บริการของบุคคลที่สาม</h2>
          <p className="text-gray-700 leading-relaxed">
            เว็บไซต์ของเราอาจมีลิงก์ไปยังเว็บไซต์ของบุคคลที่สาม 
            เราไม่รับผิดชอบต่อนโยบายความเป็นส่วนตัวของเว็บไซต์เหล่านั้น 
            กรุณาอ่านนโยบายความเป็นส่วนตัวของเว็บไซต์ที่คุณเยี่ยมชม
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. ข้อมูลของเด็ก</h2>
          <p className="text-gray-700 leading-relaxed">
            บริการของเราไม่ได้มุ่งเป้าไปที่เด็กอายุต่ำกว่า 18 ปี 
            หากเราทราบว่ามีการเก็บรวบรวมข้อมูลของเด็กโดยไม่ได้รับความยินยอมจากผู้ปกครอง 
            เราจะดำเนินการลบข้อมูลนั้นทันที
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. การเปลี่ยนแปลงนโยบาย</h2>
          <p className="text-gray-700 leading-relaxed">
            เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว 
            การเปลี่ยนแปลงที่สำคัญจะถูกแจ้งให้ทราบผ่านเว็บไซต์หรืออีเมล 
            กรุณาตรวจสอบนโยบายนี้เป็นประจำ
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. การติดต่อเรา</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเราที่:
          </p>
          <ul className="list-none space-y-2 text-gray-700 ml-4">
            <li><strong>อีเมล:</strong> privacy@mrprompt.com</li>
            <li><strong>ที่อยู่:</strong> Bangkok, Thailand</li>
            <li><strong>เว็บไซต์:</strong> <a href="/contact" className="text-blue-600 hover:underline">หน้า Contact</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. กฎหมายที่ใช้บังคับ</h2>
          <p className="text-gray-700 leading-relaxed">
            นโยบายความเป็นส่วนตัวนี้อยู่ภายใต้กฎหมายของประเทศไทย 
            และสอดคล้องกับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>
        </section>
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">สรุป</h3>
        <p className="text-gray-700">
          เราให้ความสำคัญกับความเป็นส่วนตัวของคุณอย่างจริงจัง 
          และมุ่งมั่นที่จะปกป้องข้อมูลส่วนตัวของคุณด้วยมาตรการที่เหมาะสมและทันสมัย 
          หากมีข้อสงสัยหรือข้อกังวลใดๆ กรุณาติดต่อเราได้ตลอดเวลา
        </p>
      </div>
    </div>
  );
}
