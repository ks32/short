/**
 * @api {post} /create Create
 */

// Path: functions/create.js

export async function onRequest(context) {
    if (context.request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400', // 24小时
            },
        });
    }
    // export async function onRequestPost(context) {
    const { request, env } = context;
    const { slug } = await request.json();
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // 24 hours
    };

    // 自定义slug长度检查 2<slug<10 是否不以文件后缀结尾
    if (slug && (slug.length < 2 || slug.length > 10 || /.+\.[a-zA-Z]+$/.test(slug))) {
        return Response.json({ message: 'Illegal length: slug, (>= 2 && <= 10), or not ending with a file extension.' }, {
            headers: corsHeaders,
            status: 400

        });
    }

    try {

        // 如果自定义slug
        if (slug) {
            const existUrl = await env.DB.prepare(`SELECT url as existUrl FROM links where slug = ?`).bind(slug).first()

            // url & slug 是一样的。
            if (existUrl && existUrl.existUrl) {
                // return Response.json({ slug, link: `${existUrl.existUrl}` }, {
                //     headers: corsHeaders,
                //     status: 200
                // })
                const response = Response.json({ slug, link: existUrl.existUrl }, {
                    headers: corsHeaders,
                    status: 200
                });

                // Then asynchronously update the count (non-blocking)
                context.waitUntil(
                    env.DB.prepare(`UPDATE links SET opened = opened + 1 WHERE slug = ?`)
                        .bind(slug)
                        .run()
                );

                return response;
            }
        }
        else{
            return Response.json({ message: "Slug is not provided. Please provide slug to get full URL." }, {
                headers: corsHeaders,
                status: 200
            })
        }
    } catch (e) {
        // console.log(e);
        return Response.json({ message: e.message }, {
            headers: corsHeaders,
            status: 500
        })
    }
}



