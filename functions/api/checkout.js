export async function onRequestPost() {
  return new Response(JSON.stringify({ 
    url: 'https://evento.uniko.co/bodadeloschicos/' 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
