import http from "node:http";
import fs from "fs";

const PORT = 6969;

const handleGetRequest: http.RequestListener = (req, res) => {
    switch(true) {
        case req.url?.includes("js"): {
            fs.readFile(`./dist/app/${req.url}`, (err, data) => {
                if (err?.code === "ENOENT") {
                    console.log("\x1b[35m", "file not found\n", err.message, "\n", "\x1b[00m");
                    res.writeHead(404, "not found");
                    res.end("not found");
                }

                const headers = { "Content-Type": "text/javascript" };

                res.writeHead(200, headers);
                res.end(data, "utf-8");
            });

        } break;

        case req.url === "/": {
            fs.readFile("./dist/app/index.html", (err, data) => {
                if (err?.code === "ENOENT") {
                    console.log("\x1b[35m", "file not found\n", err.message, "\n", "\x1b[00m");
                    res.writeHead(404, "not found");
                    res.end("not found");
                }

                const headers = { "Content-Type": "text/html" };

                res.writeHead(200, headers);
                res.end(data, "utf-8");
            });
        }
    }
}

console.log("starting server at http://localhost:" + PORT)

http.createServer((req, res) => {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)

    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    console.log("request incoming!!!\n", req.url);
    
    if (req.method === "GET") {
        handleGetRequest(req, res);
    }
}).listen(PORT);