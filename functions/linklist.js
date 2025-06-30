// export async function onRequestGet(context) {
//     const { request, env } = context;
//     const url = new URL(request.url);
//     const origin = `${url.protocol}//${url.hostname}`;
//     const { results } = await env.DB.prepare(
//       `SELECT * FROM links;`
//     ).all();
//   const data = results;
//     return Response.json(data);
//   }
  
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get("page") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search")?.trim().toLowerCase() || '';
  const offset = page * limit;

  let query = `SELECT * FROM links`;
  let where = '';
  let bindings = [];

  if (search) {
    where = ` WHERE LOWER(slug) LIKE ? OR LOWER(url) LIKE ?`;
    bindings.push(`%${search}%`, `%${search}%`);
  }

  query += where + ` ORDER BY create_time DESC LIMIT ? OFFSET ?`;
  bindings.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...bindings).all();
  return Response.json(results);
}