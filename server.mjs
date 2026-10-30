import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { request as httpsRequest } from "node:https";
import { extname, join, normalize } from "node:path";
import { readFile } from "node:fs/promises";

const PORT = Number(process.env.PORT || 4173);
const API_URL = "https://openapi.jddj.com/djapi/pms/getSkuCateBrandBySkuName";
const ROOT = process.cwd();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

function nowTimestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    " ",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds())
  ].join("");
}

function signParams(params, appSecret) {
  const merged = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && key !== "sign")
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");
  return createHash("md5").update(`${appSecret}${merged}${appSecret}`, "utf8").digest("hex").toUpperCase();
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("请求体过大"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function postForm(url, params) {
  const target = new URL(url);
  const body = new URLSearchParams(params).toString();

  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      {
        method: "POST",
        hostname: target.hostname,
        path: target.pathname,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Content-Length": Buffer.byteLength(body),
          Connection: "close"
        },
        timeout: 10000
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, responseText: data });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("请求京东接口超时"));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function handleJdRequest(req, res) {
  try {
    const body = await readJsonBody(req);
    const fields = Array.isArray(body.fields) ? body.fields.filter(Boolean) : String(body.fields || "").split(",").map((item) => item.trim()).filter(Boolean);
    const timestamp = nowTimestamp();
    const jdParamJson = JSON.stringify({
      productName: body.productName,
      fields
    });
    const baseParams = {
      app_key: body.app_key,
      format: "json",
      jd_param_json: jdParamJson,
      timestamp,
      token: body.token,
      v: "1.0"
    };
    const sign = signParams(baseParams, body.app_secret);
    const requestParams = {
      token: body.token,
      app_key: body.app_key,
      app_secret: body.app_secret,
      timestamp,
      sign,
      format: "json",
      v: "1.0",
      jd_param_json: jdParamJson
    };
    const requestUrl = `${API_URL}?${new URLSearchParams(requestParams).toString()}`;
    const result = await postForm(API_URL, requestParams);

    sendJson(res, {
      ok: result.statusCode >= 200 && result.statusCode < 300,
      statusCode: result.statusCode,
      requestUrl,
      requestParams,
      responseText: result.responseText
    });
  } catch (error) {
    sendJson(
      res,
      {
        ok: false,
        message: error.message
      },
      500
    );
  }
}

function sendJson(res, data, statusCode = 200) {
  const text = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(text)
  });
  res.end(text);
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(ROOT, safePath);

  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream"
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/jd/getSkuCateBrandBySkuName") {
    handleJdRequest(req, res);
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
}).listen(PORT, "127.0.0.1", () => {
  console.log(`API prototype server: http://127.0.0.1:${PORT}`);
});
