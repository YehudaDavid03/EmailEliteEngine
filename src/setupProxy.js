const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = function(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://3.23.81.35", // Your server"s address
      changeOrigin: true,
    })
  )
}
