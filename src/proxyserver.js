import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
const app = express();

app.use(cors())
app.options('*', cors())

app.use(
  "/default",
  createProxyMiddleware({
    target: "https://1pka1875p6.execute-api.us-east-1.amazonaws.com/default",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(3001, () => {
  console.log("Local proxy running at http://localhost:3001");
});
