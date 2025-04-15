const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'  // No rewrite needed since the backend uses /api prefix already
      },
      onProxyReq: function(proxyReq, req, res) {
        // Log proxy requests during development
        console.log('Proxying:', req.method, req.path);
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          success: false,
          message: 'Error connecting to the backend server. Make sure it is running.'
        }));
      }
    })
  );
};
