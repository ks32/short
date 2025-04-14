export async function onRequestGet(context) {
  // const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = context.env;
  debugger
  const  GOOGLE_CLIENT_ID = context.env.client_id;
  const GOOGLE_CLIENT_SECRET = context.env.client_secret;
  const url = new URL(context.request.url);
  const GOOGLE_REDIRECT_URI = url.origin+ '/auth/callback';
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${GOOGLE_REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=email%20profile` +
    `&access_type=online`;

  return Response.redirect(redirectUri, 302);
}
