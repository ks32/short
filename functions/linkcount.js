export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim().toLowerCase() || '';
  
    let query = `SELECT COUNT(*) as count FROM links`;
    let bindings = [];
  
    if (search) {
      query += ` WHERE LOWER(slug) LIKE ? OR LOWER(url) LIKE ?`;
      bindings.push(`%${search}%`, `%${search}%`);
    }
  
    const { results } = await env.DB.prepare(query).bind(...bindings).all();
    return Response.json(results[0]);
  }