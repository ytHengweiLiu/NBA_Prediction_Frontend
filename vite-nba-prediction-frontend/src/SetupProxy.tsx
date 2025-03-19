const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()

// Proxy endpoints
app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://j25ls96ohb.execute-api.us-east-1.amazonaws.com',
    changeOrigin: true,
    pathRewrite: { '^/dev': '' }
  })
)

app.listen(3000, () => {
  console.log('Proxy listening on port 3000')
})
