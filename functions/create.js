/**
 * @api {post} /create Create
 */

function generateRandomString(length) {
    const characters = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

export async function onRequest(context) {
    if (context.request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    const { request, env } = context;
    const originurl = new URL(request.url);
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("clientIP");
    const userAgent = request.headers.get("user-agent");
    const origin = `${originurl.protocol}//${originurl.hostname}`;

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

    const { url, slug } = await request.json();

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };

    if (!url) {
        return Response.json({ message: 'Missing required parameter: url.' }, {
            headers: corsHeaders,
            status: 400
        });
    }

    if (!/^https?:\/\/.{3,}/.test(url)) {
        return Response.json({ message: 'Illegal format: url.' }, {
            headers: corsHeaders,
            status: 400
        });
    }

    if (slug && (slug.length < 2 || slug.length > 40 || /.+\.[a-zA-Z]+$/.test(slug))) {
        return Response.json({
            message: 'Illegal length: slug, (>= 2 && <= 10), or not ending with a file extension.'
        }, {
            headers: corsHeaders,
            status: 400
        });
    }

    try {
        if (slug) {
            const existUrl = await env.DB.prepare(
                `SELECT url as existUrl FROM links WHERE slug = ?`
            ).bind(slug).first();

            if (existUrl && existUrl.existUrl === url) {
                return Response.json({ slug, link: `${origin}/${slug}` }, {
                    headers: corsHeaders,
                    status: 200
                });
            }

            if (existUrl) {
                return Response.json({ message: 'Slug already exists.' }, {
                    headers: corsHeaders,
                    status: 200
                });
            }
        }

        const existSlug = await env.DB.prepare(
            `SELECT slug as existSlug FROM links WHERE url = ?`
        ).bind(url).first();

        if (existSlug && !slug) {
            return Response.json({ slug: existSlug.existSlug, link: `${origin}/${existSlug.existSlug}` }, {
                headers: corsHeaders,
                status: 200
            });
        }

        const slug2 = slug ? slug : generateRandomString(4);

        await env.DB.prepare(`
            INSERT INTO links (url, slug, ip, status, ua, create_time, domain)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(url, slug2, clientIP, 1, userAgent, formattedDate, origin).run();

        return Response.json({ slug: slug2, link: `${origin}/${slug2}` }, {
            headers: corsHeaders,
            status: 200
        });

    } catch (e) {
        return Response.json({ message: e.message }, {
            headers: corsHeaders,
            status: 500
        });
    }
}