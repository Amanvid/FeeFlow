// Test authentication script
const testAuth = async () => {
  try {
    // Try to login with test credentials
    const response = await fetch('http://localhost:9002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@campusflow.com',
        password: 'admin123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Login successful:', data);
      
      // Set the token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token set in localStorage');
        
        // Test permissions
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } else {
      console.error('Login failed:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Add a button to trigger the test
const button = document.createElement('button');
button.textContent = 'Test Login';
button.onclick = testAuth;
button.style.position = 'fixed';
button.style.top = '10px';
button.style.right = '10px';
button.style.zIndex = '9999';
button.style.padding = '10px';
button.style.backgroundColor = 'blue';
button.style.color = 'white';
document.body.appendChild(button);