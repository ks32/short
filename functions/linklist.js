export async function onRequestGet(context) {
    const { request, env } = context;
    
    const { results } = await env.DB.prepare(
      `SELECT * FROM links;`
    ).all();
  const data = results;
    return Response.json(data);
  }
  