import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="text-gray-600 mb-8">
        Last updated: {new Date().toLocaleDateString('th-TH')}
      </p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. การยอมรับข้อกำหนด</h2>
          <p className="text-gray-700 leading-relaxed">
            การใช้บริการ Mr.Prompt ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขทั้งหมดที่ระบุไว้ในเอกสารนี้ 
            หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ กรุณาหยุดการใช้บริการทันที
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. การใช้บริการ</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            เงื่อนไขการใช้บริการ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>คุณต้องมีอายุอย่างน้อย 18 ปี หรือได้รับอนุญาตจากผู้ปกครอง</li>
            <li>คุณต้องให้ข้อมูลที่ถูกต้องและเป็นจริงในการสมัครสมาชิก</li>
            <li>คุณรับผิดชอบในการรักษาความปลอดภัยของบัญชีและรหัสผ่าน</li>
            <li>คุณต้องไม่ใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมายหรือไม่เหมาะสม</li>
            <li>คุณต้องไม่พยายามเจาะระบบหรือรบกวนการทำงานของบริการ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. บัญชีผู้ใช้</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ความรับผิดชอบของผู้ใช้:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>คุณมีหน้าที่รับผิดชอบในการรักษาความปลอดภัยของบัญชี</li>
            <li>คุณต้องแจ้งเราทันทีหากพบการใช้งานที่ไม่ได้รับอนุญาต</li>
            <li>คุณรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ</li>
            <li>คุณต้องไม่แบ่งปันบัญชีหรือให้ผู้อื่นใช้บัญชีของคุณ</li>
            <li>คุณสามารถลบบัญชีได้ตลอดเวลาผ่านการตั้งค่า</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. ทรัพย์สินทางปัญญา</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            สิทธิ์ในทรัพย์สินทางปัญญา:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>โค้ดที่ AI สร้างขึ้นเป็นของคุณ และคุณสามารถใช้ได้อย่างเสรี</li>
            <li>คุณต้องใช้โค้ดที่สร้างขึ้นอย่างถูกต้องตามกฎหมาย</li>
            <li>แพลตฟอร์ม Mr.Prompt และเทคโนโลยีที่ใช้เป็นทรัพย์สินของเรา</li>
            <li>คุณต้องไม่คัดลอก ทำซ้ำ หรือดัดแปลงแพลตฟอร์มของเรา</li>
            <li>เนื้อหาและเครื่องหมายการค้าบนเว็บไซต์เป็นของเรา</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. การชำระเงินและการคืนเงิน</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            นโยบายการชำระเงิน:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>บริการบางส่วนอาจมีค่าใช้จ่าย ซึ่งจะแจ้งให้ทราบล่วงหน้า</li>
            <li>การชำระเงินจะดำเนินการผ่านช่องทางที่ปลอดภัย</li>
            <li>คุณรับผิดชอบในการชำระค่าบริการตามกำหนด</li>
            <li>การคืนเงินจะพิจารณาเป็นรายกรณี ภายใน 30 วัน</li>
            <li>เราขอสงวนสิทธิ์ในการเปลี่ยนแปลงราคาโดยแจ้งล่วงหน้า</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. การยกเลิกบริการ</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีในกรณีต่อไปนี้:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>การละเมิดข้อกำหนดและเงื่อนไขนี้</li>
            <li>การใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมาย</li>
            <li>การให้ข้อมูลเท็จหรือหลอกลวง</li>
            <li>การไม่ชำระค่าบริการตามกำหนด</li>
            <li>การกระทำที่เป็นอันตรายต่อระบบหรือผู้ใช้อื่น</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. การจำกัดความรับผิด</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ข้อจำกัดความรับผิดชอบ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>บริการให้บริการ "ตามสภาพ" โดยไม่มีการรับประกันใดๆ</li>
            <li>เราไม่รับประกันว่าบริการจะไม่มีข้อผิดพลาดหรือหยุดชะงัก</li>
            <li>เราไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้บริการ</li>
            <li>เราไม่รับผิดชอบต่อโค้ดที่ AI สร้างขึ้น</li>
            <li>ความรับผิดสูงสุดของเราจำกัดอยู่ที่ค่าบริการที่คุณชำระ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. การรับประกันและการปฏิเสธ</h2>
          <p className="text-gray-700 leading-relaxed">
            คุณรับทราบและยอมรับว่า:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
            <li>AI อาจสร้างโค้ดที่มีข้อผิดพลาดหรือไม่สมบูรณ์</li>
            <li>คุณต้องตรวจสอบและทดสอบโค้ดก่อนนำไปใช้งานจริง</li>
            <li>เราไม่รับประกันว่าโค้ดจะตรงตามความต้องการของคุณ 100%</li>
            <li>คุณรับผิดชอบในการปรับแต่งและแก้ไขโค้ดตามต้องการ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. การเปลี่ยนแปลงบริการ</h2>
          <p className="text-gray-700 leading-relaxed">
            เราขอสงวนสิทธิ์ในการ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
            <li>แก้ไข เพิ่มเติม หรือยกเลิกฟีเจอร์ใดๆ ของบริการ</li>
            <li>ปรับปรุงหรือเปลี่ยนแปลงแพลตฟอร์มโดยไม่ต้องแจ้งล่วงหน้า</li>
            <li>หยุดให้บริการชั่วคราวเพื่อบำรุงรักษา</li>
            <li>เปลี่ยนแปลงข้อกำหนดและเงื่อนไขนี้</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. ความเป็นส่วนตัว</h2>
          <p className="text-gray-700 leading-relaxed">
            การใช้บริการของเราอยู่ภายใต้นโยบายความเป็นส่วนตัวของเรา 
            กรุณาอ่าน{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              นโยบายความเป็นส่วนตัว
            </a>{' '}
            เพื่อทำความเข้าใจว่าเราเก็บรวบรวมและใช้ข้อมูลของคุณอย่างไร
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. การแก้ไขข้อกำหนด</h2>
          <p className="text-gray-700 leading-relaxed">
            เราอาจแก้ไขข้อกำหนดและเงื่อนไขนี้ได้ตลอดเวลา 
            การเปลี่ยนแปลงที่สำคัญจะถูกแจ้งให้ทราบล่วงหน้าผ่านเว็บไซต์หรืออีเมล 
            การใช้บริการต่อไปหลังจากการเปลี่ยนแปลงถือว่าคุณยอมรับข้อกำหนดใหม่
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. กฎหมายที่ใช้บังคับ</h2>
          <p className="text-gray-700 leading-relaxed">
            ข้อกำหนดและเงื่อนไขนี้อยู่ภายใต้กฎหมายของประเทศไทย 
            ข้อพิพาทใดๆ จะอยู่ในเขตอำนาจของศาลไทย
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. การติดต่อเรา</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            หากคุณมีคำถามเกี่ยวกับข้อกำหนดและเงื่อนไขนี้ กรุณาติดต่อเราที่:
          </p>
          <ul className="list-none space-y-2 text-gray-700 ml-4">
            <li><strong>อีเมล:</strong> legal@mrprompt.com</li>
            <li><strong>ที่อยู่:</strong> Bangkok, Thailand</li>
            <li><strong>เว็บไซต์:</strong> <a href="/contact" className="text-blue-600 hover:underline">หน้า Contact</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. ข้อกำหนดเพิ่มเติม</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ข้อกำหนดพิเศษ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>หากข้อกำหนดใดเป็นโมฆะ ข้อกำหนดอื่นยังคงมีผลบังคับ</li>
            <li>การไม่บังคับใช้สิทธิ์ใดๆ ไม่ถือเป็นการสละสิทธิ์</li>
            <li>คุณต้องไม่โอนสิทธิ์ตามข้อกำหนดนี้ให้ผู้อื่น</li>
            <li>ข้อกำหนดนี้เป็นข้อตกลงที่สมบูรณ์ระหว่างคุณและเรา</li>
          </ul>
        </section>
      </div>

      <div className="mt-12 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <span className="text-2xl mr-2">⚠️</span>
          ข้อควรระวัง
        </h3>
        <p className="text-gray-700">
          การใช้บริการ Mr.Prompt แสดงว่าคุณได้อ่านและเข้าใจข้อกำหนดและเงื่อนไขทั้งหมด 
          และยอมรับที่จะปฏิบัติตามข้อกำหนดเหล่านี้ หากคุณไม่เห็นด้วย กรุณาหยุดการใช้บริการทันที
        </p>
      </div>
    </div>
  );
}
