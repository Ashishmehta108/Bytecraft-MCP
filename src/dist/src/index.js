"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// mcp-multitool-server.ts
var dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
var express_1 = require("express");
var cors_1 = require("cors");
var axios_1 = require("axios");
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var zod_1 = require("zod");
var db_js_1 = require("../utils/db.js");
var client_js_1 = require("./supabase/client.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: "*", credentials: true }));
process.on("uncaughtException", function (err) {
    console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", function (reason) {
    console.error("Unhandled Rejection:", reason);
});
var server = new mcp_js_1.McpServer({ name: "Bytecraft-mcp", version: "1.0.0" });
// ────── Multi-tool Chain Executor ──────
server.registerTool("ExtractDetailsFromthePrompt", {
    description: "Extract keywords from a natural language prompt, such as product type or area of use, and dynamically call corresponding tools to retrieve product data.",
    inputSchema: {
        prompt: zod_1.z
            .string()
            .nonempty()
            .describe("A user prompt like 'Show me all outdoor lamps and give details for the first one'."),
    },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var keywords, allTypes, allUses, matchedType, matchedUse, products, first, result, products;
    var prompt = _b.prompt;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                keywords = prompt.toLowerCase();
                return [4 /*yield*/, db_js_1.default.product.findMany({
                        distinct: ["type"],
                        select: { type: true },
                    })];
            case 1:
                allTypes = _c.sent();
                return [4 /*yield*/, db_js_1.default.product.findMany({
                        distinct: ["areaOfUse"],
                        select: { areaOfUse: true },
                    })];
            case 2:
                allUses = _c.sent();
                matchedType = allTypes.find(function (t) { var _a; return keywords.includes(((_a = t.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ""); });
                matchedUse = allUses.find(function (u) { var _a; return keywords.includes(((_a = u.areaOfUse) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ""); });
                if (!matchedType) return [3 /*break*/, 4];
                return [4 /*yield*/, db_js_1.default.product.findMany({
                        where: { type: matchedType.type },
                    })];
            case 3:
                products = _c.sent();
                first = products[0];
                result = __assign({ typeMatched: matchedType.type, products: products }, (first && {
                    details: {
                        name: first.name,
                        price: first.price,
                        company: first.company,
                    },
                }));
                return [2 /*return*/, {
                        content: [{ type: "text", text: JSON.stringify(result) }],
                    }];
            case 4:
                if (!matchedUse) return [3 /*break*/, 6];
                return [4 /*yield*/, db_js_1.default.product.findMany({
                        where: { areaOfUse: matchedUse.areaOfUse },
                    })];
            case 5:
                products = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    areaMatched: matchedUse.areaOfUse,
                                    products: products,
                                }),
                            },
                        ],
                    }];
            case 6: return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: "No matching type or areaOfUse found in prompt.",
                        },
                    ],
                }];
        }
    });
}); });
// ────── Tools ──────
server.registerTool("findProductByType", {
    description: "Fetch products by category/type, such as 'lamp', 'chair', or 'sofa'. This tool is useful when users specify a product category in their query, like 'show all chairs'.",
    inputSchema: {
        type: zod_1.z
            .string()
            .nonempty()
            .describe("Product category (e.g., 'lamp', 'chair')"),
    },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var products;
    var type = _b.type;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, db_js_1.default.product.findMany({ where: { type: type } })];
            case 1:
                products = _c.sent();
                return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(products) }] }];
        }
    });
}); });
server.registerTool("findProductByUse", {
    description: "Fetch products designed for a specific use case or context, like 'outdoor seating', 'study area', or 'living room'. Use this when user prompts refer to how or where the product will be used.",
    inputSchema: {
        areaOfUse: zod_1.z
            .string()
            .nonempty()
            .describe("Usage context (e.g., 'outdoor', 'indoor')"),
    },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var products;
    var areaOfUse = _b.areaOfUse;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, db_js_1.default.product.findMany({ where: { areaOfUse: areaOfUse } })];
            case 1:
                products = _c.sent();
                return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(products) }] }];
        }
    });
}); });
server.registerTool("getProductInfo", {
    description: "Get detailed info about a product including name, description, price, image, and company. Use when user asks about a specific model or product name.",
    inputSchema: {
        name: zod_1.z.string().nonempty().describe("Exact product name to lookup"),
    },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var prod, info;
    var _c, _d, _e, _f;
    var name = _b.name;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0: return [4 /*yield*/, db_js_1.default.product.findFirst({ where: { name: name } })];
            case 1:
                prod = _g.sent();
                info = {
                    description: (_c = prod === null || prod === void 0 ? void 0 : prod.description) !== null && _c !== void 0 ? _c : null,
                    price: (_d = prod === null || prod === void 0 ? void 0 : prod.price) !== null && _d !== void 0 ? _d : null,
                    image: (_e = prod === null || prod === void 0 ? void 0 : prod.image) !== null && _e !== void 0 ? _e : null,
                    company: (_f = prod === null || prod === void 0 ? void 0 : prod.company) !== null && _f !== void 0 ? _f : null,
                };
                return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(info) }] }];
        }
    });
}); });
server.registerTool("getAllProducts", {
    description: "List all products available in the catalog. Use when user wants to browse everything or has not applied any filter.",
    inputSchema: {},
}, function () { return __awaiter(void 0, void 0, void 0, function () {
    var products;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_js_1.default.product.findMany()];
            case 1:
                products = _a.sent();
                return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(products) }] }];
        }
    });
}); });
server.registerTool("addToCart", {
    description: "Add a selected product to the shopping cart. Triggered when user says 'Add this to my cart' or clicks a button.",
    inputSchema: {
        productId: zod_1.z
            .string()
            .nonempty()
            .describe("Unique product ID to add to cart"),
        quantity: zod_1.z
            .number()
            .optional()
            .default(1)
            .describe("Number of items to add"),
    },
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var error, err_1;
    var productId = _b.productId, quantity = _b.quantity;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client_js_1.client
                        .from("cart")
                        .insert({ productId: productId, quantity: quantity })];
            case 1:
                error = (_c.sent()).error;
                if (error)
                    throw error;
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Added product ".concat(productId, " (qty: ").concat(quantity, ") to cart."),
                            },
                        ],
                    }];
            case 2:
                err_1 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            { type: "text", text: "Error adding to cart: ".concat(err_1.message) },
                        ],
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
server.registerTool("getCart", {
    description: "Fetch all items currently in the user's cart. Use when user says 'Show my cart', 'What's in my cart?', etc.",
    inputSchema: {},
}, function () { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get("http://localhost:3001/cart")];
            case 1:
                response = _a.sent();
                return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(response.data) }] }];
        }
    });
}); });
var transport = new stdio_js_1.StdioServerTransport();
server.connect(transport);
// ────── MCP Routes ──────
// app.post("/mcp", async (req: Request, res: Response) => {
//   const sessionId = req.headers["mcp-session-id"] as string | undefined;
//   let transport: StreamableHTTPServerTransport;
//   if (!sessionId && isInitializeRequest(req.body)) {
//     transport = new StreamableHTTPServerTransport({
//       sessionIdGenerator: () => randomUUID(),
//       onsessioninitialized: (sid) => {
//         transports[sid] = transport;
//       },
//     });
//     transport.onclose = () => {
//       if (transport.sessionId) delete transports[transport.sessionId];
//     };
//     await server.connect(transport);
//   } else if (sessionId && transports[sessionId]) {
//     transport = transports[sessionId];
//   } else {
//     res.status(400).json({
//       jsonrpc: "2.0",
//       error: { code: -32000, message: "Invalid session ID" },
//       id: null,
//     });
//     return;
//   }
//   await transport.handleRequest(req, res, req.body);
// });
// app.get("/mcp", async (req: Request, res: Response) => {
//   const sessionId = req.headers["mcp-session-id"] as string | undefined;
//   if (!sessionId || !transports[sessionId]) {
//     res.status(400).send("Invalid or missing session ID");
//     return;
//   }
//   await transports[sessionId].handleRequest(req, res);
// });
// app.delete("/mcp", async (req: Request, res: Response) => {
//   const sessionId = req.headers["mcp-session-id"] as string | undefined;
//   if (!sessionId || !transports[sessionId]) {
//     res.status(400).send("Invalid or missing session ID");
//     return;
//   }
//   await transports[sessionId].handleRequest(req, res);
// });
// ────── Start ──────
// const PORT = process.env.PORT ?? 3001;
// app.listen(PORT, () => {
//   console.log(`✅ Bytecraft-mcp server running on port ${PORT}`);
// });
