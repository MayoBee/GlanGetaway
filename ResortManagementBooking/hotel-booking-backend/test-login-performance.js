async function testLoginPerformance() {
  console.log('🔧 Testing Login Performance...');
  console.log('====================================');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'biennickwadingan@gmail.com',
        password: 'password123'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ Login successful!`);
    console.log(`⚡ Response time: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`🎫 Token received: ${data.token ? 'Yes' : 'No'}`);
    console.log(`👤 User ID: ${data.userId || 'N/A'}`);
    
    if (responseTime > 5000) {
      console.log('⚠️  Warning: Login took more than 5 seconds');
    } else if (responseTime > 3000) {
      console.log('⚠️  Warning: Login took more than 3 seconds');
    } else {
      console.log('🚀 Login performance is good!');
    }
    
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`❌ Login failed after ${responseTime}ms`);
    console.log(`Error: ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.log('⏰ Request timed out - server may be slow');
    }
  }
}

testLoginPerformance();
