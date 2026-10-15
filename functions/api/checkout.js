export async function onRequestPost() {
  return new Response(JSON.stringify({ 
    url: 'https://evento.uniko.co/bodadeloschicos/gift-table' 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
