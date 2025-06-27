import indexHtml from './index.html';
import loginHtml from './login.html';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const hasDeepLinkParams = url.searchParams.size;

  if (hasDeepLinkParams) {
    // Device detection
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);

    // Redirect URLs
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.pakdata.QuranMajeed&hl=en";
    const appStoreUrl = "https://apps.apple.com/us/app/quran-majeed-%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id365557665";

    const fallbackWebUrl = `https://quranmajeed.com/`;

    if (isAndroid) {
      return Response.redirect(playStoreUrl, 302);
    } else if (isIOS) {
      return Response.redirect(appStoreUrl, 302);
    } else {
      return Response.redirect(fallbackWebUrl, 302);
    }
  }

  const isLoggedIn = await checkLoginStatus(request, env);

  if (isLoggedIn) {
    return new Response(indexHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  } else {
    // return new Response(loginHtml, {
    //   headers: { "Content-Type": "text/html;charset=UTF-8" },
    // });
    const redirectUrl = "https://pakdata.com/";
    return Response.redirect(redirectUrl, 302);
  }
}

async function checkLoginStatus(request, env) {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.match(/token=([^;]+)/)?.[1];

  if (!token) return false;

  // You can validate the token here using KV or JWT
  return true;
}
