/**
 * Cloudflare Worker for R2 Storage
 * 作为前端和 R2 之间的中间层
 */

export default {
  async fetch(request, env) {
    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 验证 API Key
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== env.API_KEY) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 上传文件
      if (path === '/upload' && request.method === 'POST') {
        const { fileName, data } = await request.json();
        
        // 上传到 R2
        await env.KGKB_BUCKET.put(fileName, data, {
          httpMetadata: {
            contentType: 'application/octet-stream',
          },
        });

        return new Response(JSON.stringify({ success: true, fileName }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 下载文件
      if (path.startsWith('/download/') && request.method === 'GET') {
        const fileName = path.replace('/download/', '');
        
        // 从 R2 获取
        const object = await env.KGKB_BUCKET.get(fileName);
        
        if (!object) {
          return new Response('File not found', { 
            status: 404,
            headers: corsHeaders 
          });
        }

        const data = await object.text();
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 列出文件
      if (path === '/list' && request.method === 'GET') {
        const list = await env.KGKB_BUCKET.list();
        const files = list.objects.map(obj => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
        }));

        return new Response(JSON.stringify({ files }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
