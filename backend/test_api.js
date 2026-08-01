async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/users/test-drives', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cars: ['GT3 RS'],
        showroom: 'Showroom Hà Nội',
        scheduledAt: new Date(Date.now() + 86400000).toISOString()
      })
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

test();
