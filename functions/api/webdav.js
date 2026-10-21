export async function onRequestPost({ request }) {
  try {
    const { url, username, password, method, body } = await request.json();
    const target = new URL(url);

    if (
      target.protocol !== 'https:' ||
      !['app.koofr.net', 'koofr.eu'].includes(target.hostname)
    ) {
      return new Response('Invalid Koofr URL', { status: 400 });
    }

    if (!username || !password || !['GET', 'PUT'].includes(method)) {
      return new Response('Invalid WebDAV request', { status: 400 });
    }

    const response = await fetch(target, {
      method,
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        ...(body ? { 'Content-Type': 'application/json; charset=utf-8' } : {})
      },
      body: body || undefined
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json'
      }
    });
  } catch (error) {
    return new Response(error.message || 'WebDAV proxy error', { status: 500 });
  }
}
