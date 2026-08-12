const axios = require('axios');

async function test() {
  try {
    const login = await axios.post('http://localhost:8081/api/auth/login', {
      email: 'demo@taskportal.com',
      password: 'Demo@123'
    });
    console.log('Login successful, got token');
    const token = login.data.token;
    
    const tasks = await axios.get('http://localhost:8081/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Tasks response:', Object.keys(tasks.data));
    console.log('Tasks content:', tasks.data.content);
    
    const dashboard = await axios.get('http://localhost:8081/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Dashboard response:', dashboard.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

test();
