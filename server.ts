import http from "node:http";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import path from "node:path";
import { WS_PORT } from "./common.js";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const PORT = 6969;

const handleGetRequest: http.RequestListener = (req, res) => {
    switch(true) {
        case req.url?.includes("js"): {
            const pth = (() => {
                if (req.url?.includes("common")) {
                    return `./dist/common.js`;
                } else {
                    let basicurl = "";
                    if (req.url?.includes("?")) {
                        basicurl = req.url?.split("?")[0];
                        return `./dist/app/${basicurl}`;

                    } else {
                        return `./dist/app/${req.url}`
                    }
                }
            })();
            fs.readFile(pth, (err, data) => {
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
        } break;
        default: {
            console.log("\x1b[35m", `[ERROR]: not found ${req.url}`, "\x1b[00m");
            res.writeHead(404);
            res.end("not found");
        } break;
    }
}

console.log("starting server at http://localhost:" + PORT);

(async () => {
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
})().then(() => {
    const wss = new WebSocketServer({
        port: WS_PORT
    });

    let clientId = 0;

    const sockets: WebSocket[] = []

    wss.on("connection", (s) => {
        sockets.push(s);
        s.send(`hey you connected! ${clientId++}`);

        s.on("close", () => {
            sockets.splice(sockets.indexOf(s), 1);
        });
    });

    const HOT_FILES = fs.readdirSync(path.join(__dirname, "./app")).filter(f => f.includes(".js"));
    console.log("hot files", HOT_FILES);
    HOT_FILES.forEach(f => {
        fs.watchFile(path.join(__dirname, f), { interval: 50 }, () => {
            sockets.forEach(s => s.send("hot_" + f));
        });
    });


    process.on("exit", () => {
        wss.close((err) => console.error("[ERROR]: socket server could not close", err));
    });
    
})
