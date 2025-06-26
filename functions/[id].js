import page404 from './404.html';
import login from './login.html';
import home from './index.html';
import link from './links.html';
import appleAppSiteAssociation from '../apple-app-site-association.json';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.hostname}`;
  const pathname = url.pathname;
  const reservedRoutes = {
    login: login,
    links: link,
    contact: "contact.html",
  };

  // Handle root `/`
  if (pathname === "/") {
    const isLoggedIn = false;

    if (isLoggedIn) {
      return new Response(login, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    } else {
      return new Response(home, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }
  }
  if (reservedRoutes[params.id]) {
    return new Response(reservedRoutes[params.id], {
      status: 200,
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  }

  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("clientIP");
  const userAgent = request.headers.get("user-agent");
  const Referer = request.headers.get('Referer') || "Referer";
  const slug = params.id;

  if (request.url.includes('/apple-app-site-association')) {
    return new Response(JSON.stringify(appleAppSiteAssociation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const Url = await env.DB.prepare(`SELECT url FROM links WHERE slug = ?`).bind(slug).first();

  if (!Url) {
    return new Response(page404, {
      status: 404,
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  }

  try {
    const formattedDate = new Intl.DateTimeFormat('en-PK', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());

    await env.DB.prepare(`INSERT INTO logs (url, slug, ip, referer, ua, create_time)
      VALUES (?, ?, ?, ?, ?, ?)`).bind(
      Url.url, slug, clientIP, Referer, userAgent, formattedDate
    ).run();

    let redirectUrl = Url.url;
    if (origin === "https://g.quranmajeed.com") {
      if (/android/i.test(userAgent)) {
        redirectUrl = `https://play.google.com/store/apps/details?id=com.pakdata.QuranMajeed&hl=en`;
      } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        redirectUrl = "https://apps.apple.com/us/app/quran-majeed-%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id365557665";
      } else {
        redirectUrl = "https://quranmajeed.com/";
      }
    }
    else if (origin === "https://g.kitabi.pk") {
      if (/android/i.test(userAgent)) {
        redirectUrl = `https://play.google.com/store/apps/details?id=com.pakdata.kitabi`;
      }
      // else if (/iphone|ipad|ipod/i.test(userAgent)) {
      //   redirectUrl = "https://apps.apple.com/us/app/quran-majeed-%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id365557665";
      // } 
      else {
        redirectUrl = "https://kitabi.pk/";
      }
    }
    else if (origin === "https://e.pakdata.com") {
      if (/android/i.test(userAgent)) {
        redirectUrl = `https://play.google.com/store/apps/details?id=com.pakdata.easyurdu`;
      }
      else if (/iphone|ipad|ipod/i.test(userAgent)) {
        redirectUrl = "https://apps.apple.com/us/app/easy-urdu-keyboard-editor/id866001472";
      }
      else {
        redirectUrl = "https://easyurdu.pk/";
      }
    }
    else {
      redirectUrl = "https://pakdata.com/";
    }

    return Response.redirect(redirectUrl, 302);
  } catch (error) {
    console.error(error);
    return Response.redirect(Url.url, 302);
  }
}
