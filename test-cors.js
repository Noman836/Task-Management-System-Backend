// Simple CORS test script
const fetch = require('node-fetch');

async function testCORS() {
  console.log('🧪 Testing CORS and API endpoints...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5005/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test tasks endpoint
    console.log('\n2. Testing tasks endpoint...');
    const tasksResponse = await fetch('http://localhost:5005/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('Status:', tasksResponse.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': tasksResponse.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': tasksResponse.headers.get('access-control-allow-methods'),
      'Access-Control-Allow-Headers': tasksResponse.headers.get('access-control-allow-headers')
    });
    
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log('✅ Tasks data:', tasksData);
    } else {
      const errorData = await tasksResponse.json();
      console.log('❌ Error:', errorData);
    }
    
    // Test POST endpoint
    console.log('\n3. Testing POST endpoint...');
    const postResponse = await fetch('http://localhost:5005/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        title: 'Test Task',
        description: 'This is a test task',
        due_date: '2024-12-31',
        priority: 'Medium'
      })
    });
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ Task created:', postData);
    } else {
      const errorData = await postResponse.json();
      console.log('❌ Error creating task:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 5000');
  }
}

testCORS();
