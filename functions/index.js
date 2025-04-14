import indexHtml from './index.html';
import loginHtml from './login.html';

export async function onRequestGet(context) {
  const { request, env } = context;

  const isLoggedIn = await checkLoginStatus(request, env); // 👈 Your logic here

  if (isLoggedIn) {
    return new Response(indexHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  } else {
    return new Response(loginHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  }
}

async function checkLoginStatus(request, env) {
    
    const cookie = request.headers.get("cookie") || "";
    const token = cookie.match(/token=([^;]+)/)?.[1];
  
    if (!token) return false;
  
    // Validate token, example with env.SECRET or KV
    // const session = await env.SESSIONS.get(token);
    return true;
  }