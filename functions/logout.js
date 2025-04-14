export async function onRequestGet(context) {
    const headers = new Headers();
  
    // Clear both cookies by setting them to expire in the past
    headers.append('Set-Cookie', 'token=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    headers.append('Set-Cookie', 'user=; Path=/; HttpOnly=false; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  
    // Redirect to login page
    headers.set('Location', '/login');
  
    return new Response(null, {
      status: 302,
      headers
    });
  }
  