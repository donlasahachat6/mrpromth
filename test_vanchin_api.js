// Test Vanchin API
const VANCHIN_BASE_URL = process.env.VANCHIN_BASE_URL || 'https://vanchin.streamlake.ai/api/gateway/v1/endpoints';
const VANCHIN_API_KEY_1 = process.env.VANCHIN_API_KEY_1;
const VANCHIN_ENDPOINT_1 = process.env.VANCHIN_ENDPOINT_1;

async function testVanchinAPI() {
  if (!VANCHIN_API_KEY_1 || !VANCHIN_ENDPOINT_1) {
    console.error('Missing environment variables');
    console.log('VANCHIN_BASE_URL:', VANCHIN_BASE_URL);
    console.log('VANCHIN_API_KEY_1:', VANCHIN_API_KEY_1 ? 'SET' : 'NOT SET');
    console.log('VANCHIN_ENDPOINT_1:', VANCHIN_ENDPOINT_1 ? 'SET' : 'NOT SET');
    return;
  }

  const url = `${VANCHIN_BASE_URL}/${VANCHIN_ENDPOINT_1}/chat/completions`;
  console.log('Testing URL:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VANCHIN_API_KEY_1}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: 'สวัสดีครับ ทดสอบระบบ' }
        ],
        stream: false,
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const text = await response.text();
    console.log('Response:', text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\n✅ SUCCESS!');
      console.log('Response:', data.choices[0]?.message?.content);
    } else {
      console.log('\n❌ ERROR!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testVanchinAPI();
