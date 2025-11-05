const https = require('https');

const services = {
  'Gateway API': 'https://gateway-api-lztd.onrender.com/',
  'Users API': 'https://users-api-jmp5.onrender.com/',
  'Appointments API': 'https://carwash-appointments.onrender.com/',
  'Services API': 'https://carwash-services.onrender.com/',
  'Frontend': 'https://carwashfrontend.netlify.app/'
};

async function testConnectivity() {
  console.log('🔍 Testing connectivity between services...\n');
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await fetch(url);
      const status = response.status;
      
      if (status >= 200 && status < 300) {
        console.log(`✅ ${name}: OK (${status})`);
      } else {
        console.log(`⚠️  ${name}: Warning (${status})`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
    }
  }
}

testConnectivity();