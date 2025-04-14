export async function onRequestGet(context) {
  const GOOGLE_CLIENT_ID = "1029406386881-egt0onk7rvne2a9sgm1f2d0mrbv49240.apps.googleusercontent.com";
  const GOOGLE_CLIENT_SECRET = "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";

  const url = new URL(context.request.url);
  const origin = url.origin;
  const GOOGLE_REDIRECT_URI = `${origin}/auth/callback`;
  const code = url.searchParams.get("code");

  // Step 1: Get token from Google
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code"
    }).toString()
  });

  const tokenData = await tokenRes.json();
  const { access_token } = tokenData;

  // Step 2: Get user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const user = await userRes.json();

  // Step 3: Set cookies (token is HttpOnly, user info is accessible)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 24 hours

  const headers = new Headers();
  headers.append('Set-Cookie', `token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`);
  headers.append('Set-Cookie', `user=${encodeURIComponent(JSON.stringify({
    name: user.name,
    email: user.email,
    picture: user.picture
  }))}; Path=/; Secure; SameSite=Lax; Expires=${expires}`);
  
  headers.set('Location', '/');

  return new Response(null, {
    status: 302,
    headers
  });
}
