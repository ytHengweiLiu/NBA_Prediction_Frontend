const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()

// Proxy endpoints
app.use(
  '/default',
  createProxyMiddleware({
    target: 'https://1pka1875p6.execute-api.us-east-1.amazonaws.com/default',
    changeOrigin: true,
    logLevel: 'debug',
  })
)

// app.use((_req: any, res: { header: (arg0: string, arg1: string) => void }, next: () => void) => {
//   res.header('Access-Control-Allow-Origin', '*') // or restrict this
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
//   next()
// })

app.listen(3000, () => {
  console.log('Proxy listening on port 3000')
})