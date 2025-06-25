export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.hostname}`;
    const { results } = await env.DB.prepare(
      `SELECT * FROM links WHERE domain = ?`
    ).bind(origin).all();
  const data = results;
    return Response.json(data);
  }
  