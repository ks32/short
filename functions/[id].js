/**
 * @param {string} slug
 */
import page404 from './404.html'

export async function onRequestGet(context) {
    const { request, env, params } = context;
    // const url = new URL(request.url);
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("clientIP");
    const userAgent = request.headers.get("user-agent");
    const Referer = request.headers.get('Referer') || "Referer"
    const originurl = new URL(request.url);
    const options = {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const timedata = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-PK', options).format(timedata);

    const slug = params.id;

    const Url = await env.DB.prepare(`SELECT url FROM links where slug = '${slug}'`).first()

    if (!Url) {
        return new Response(page404, {
            status: 404,
            headers: {
                "content-type": "text/html;charset=UTF-8",
            }
        });
    } else {
        try {
            const info = await env.DB.prepare(`INSERT INTO logs (url, slug, ip,referer,  ua, create_time) 
            VALUES ('${Url.url}', '${slug}', '${clientIP}','${Referer}', '${userAgent}', '${formattedDate}')`).run()
            // console.log(info);
            let redirectUrl = Url.url;
            if (/android/i.test(userAgent)) {
                // Android: Try opening the app, fallback to Play Store
                redirectUrl = `https://play.google.com/store/apps/details?id=com.pakdata.QuranMajeed&hl=en`;
            } else if (/iphone|ipad|ipod/i.test(userAgent)) {
                // iOS: Try opening the app, fallback to App Store
                redirectUrl = "https://apps.apple.com/us/app/quran-majeed-%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id365557665";
            } else {
                // Web/Desktop fallback
                redirectUrl = "https://quranmajeed.com/";
            }
            return Response.redirect(redirectUrl, 302);
            
        } catch (error) {
            console.log(error);
            return Response.redirect(Url.url, 302);
        }
    }

}
