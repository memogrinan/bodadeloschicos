const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Cambiar por tu dominio en prod
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ENDPOINT PARA OBTENER FOTOS (LISTAR)
    if (request.method === "GET" && url.pathname === "/api/fotos") {
      try {
        const listed = await env.FOTOS_BUCKET.list();
        // Filtramos solo los thumbnails
        const thumbs = listed.objects.filter(obj => obj.key.includes("-thumb."));
        
        // Devolvemos la lista
        return new Response(JSON.stringify(thumbs.map(t => t.key)), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(e.message, { status: 500, headers: corsHeaders });
      }
    }

    // ENDPOINT PARA SERVIR UNA FOTO ESPECÍFICA
    if (request.method === "GET" && url.pathname.startsWith("/api/fotos/")) {
      const key = decodeURIComponent(url.pathname.replace("/api/fotos/", ""));
      const object = await env.FOTOS_BUCKET.get(key);

      if (object === null) {
        return new Response("Not found", { status: 404, headers: corsHeaders });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      for (const [k, v] of Object.entries(corsHeaders)) {
        headers.set(k, v);
      }

      return new Response(object.body, { headers });
    }

    // ENDPOINT PARA SUBIR FOTOS
    if (request.method === "POST" && url.pathname === "/api/upload") {
      try {
        const formData = await request.formData();
        const guestNameRaw = formData.get("guestName") || "Anonimo";
        const guestName = guestNameRaw.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
        const timestamp = Date.now();

        const originalFile = formData.get("original");
        const thumbFile = formData.get("thumb");

        if (!originalFile || !thumbFile) {
          return new Response("Missing files", { status: 400, headers: corsHeaders });
        }

        const extOriginal = originalFile.name.split('.').pop() || "jpg";
        const extThumb = "webp"; // El compresor siempre enviará webp si lo configuramos así

        const originalKey = `${timestamp}-${guestName}-original.${extOriginal}`;
        const thumbKey = `${timestamp}-${guestName}-thumb.${extThumb}`;

        await env.FOTOS_BUCKET.put(originalKey, originalFile.stream());
        await env.FOTOS_BUCKET.put(thumbKey, thumbFile.stream());

        return new Response(JSON.stringify({ success: true, originalKey, thumbKey }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(e.message, { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  }
};
