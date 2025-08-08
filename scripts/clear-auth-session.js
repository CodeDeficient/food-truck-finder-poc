// Script to clear Supabase auth session and test OAuth flow
console.log('Clearing Supabase auth session...');

// This script should be run in the browser console
const clearAuthSession = () => {
  // Clear all Supabase-related localStorage items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Clear session storage as well
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    console.log(`Removing from session: ${key}`);
    sessionStorage.removeItem(key);
  });
  
  // Clear cookies related to auth
  document.cookie.split(";").forEach(function(c) { 
    if (c.includes('sb-') || c.includes('supabase')) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      console.log(`Cleared cookie: ${c.split('=')[0]}`);
    }
  });
  
  console.log('Auth session cleared. Please refresh the page.');
};

// Instructions for use
console.log(`
To clear your auth session and test OAuth flow:
1. Open your browser's developer console
2. Copy and paste this entire function:

${clearAuthSession.toString()}

3. Then run: clearAuthSession()
4. Refresh the page
5. Try signing in with Google again

This will ensure you have a completely fresh session.
`);
