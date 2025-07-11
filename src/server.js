import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient();
};


const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
import { configDotenv } from "dotenv";
configDotenv();

import express from "express";
import cors from "cors";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});

const server = new McpServer({ name: "Bytecraft-mcp", version: "1.0.0" });


// ────── Multi-tool Chain Executor ──────
server.registerTool(
    "ExtractDetailsFromthePrompt",
    {
        description:
            "Extract keywords from a natural language prompt, such as product type or area of use, and dynamically call corresponding tools to retrieve product data.",
        inputSchema: {
            prompt: z
                .string()
                .nonempty()
                .describe(
                    "A user prompt like 'Show me all outdoor lamps and give details for the first one'."
                ),
        },
    },
    async ({ prompt }) => {
        const keywords = prompt.toLowerCase();

        const allTypes = await prisma.product.findMany({
            distinct: ["type"],
            select: { type: true },
        });

        const allUses = await prisma.product.findMany({
            distinct: ["areaOfUse"],
            select: { areaOfUse: true },
        });

        const matchedType = allTypes.find((t) =>
            keywords.includes(t.type?.toLowerCase() || "")
        );
        const matchedUse = allUses.find((u) =>
            keywords.includes(u.areaOfUse?.toLowerCase() || "")
        );

        if (matchedType) {
            const products = await prisma.product.findMany({
                where: { type: matchedType.type },
            });
            const first = products[0];
            const result = {
                typeMatched: matchedType.type,
                products,
                ...(first && {
                    details: {
                        name: first.name,
                        price: first.price,
                        company: first.company,
                    },
                }),
            };

            return {
                content: [{ type: "text", text: JSON.stringify(result) }],
            };
        }

        if (matchedUse) {
            const products = await prisma.product.findMany({
                where: { areaOfUse: matchedUse.areaOfUse },
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            areaMatched: matchedUse.areaOfUse,
                            products,
                        }),
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: "No matching type or areaOfUse found in prompt.",
                },
            ],
        };
    }
);
// ────── Tools ──────
server.registerTool(
    "findProductByType",
    {
        description:
            "Fetch products by category/type, such as 'lamp', 'chair', or 'sofa'. This tool is useful when users specify a product category in their query, like 'show all chairs'.",
        inputSchema: {
            type: z
                .string()
                .nonempty()
                .describe("Product category (e.g., 'lamp', 'chair')"),
        },
    },
    async ({ type }) => {
        const products = await prisma.product.findMany({ where: { type } });
        return { content: [{ type: "text", text: JSON.stringify(products) }] };
    }
);
server.registerTool(
    "findProductByUse",
    {
        description:
            "Fetch products designed for a specific use case or context, like 'outdoor seating', 'study area', or 'living room'. Use this when user prompts refer to how or where the product will be used.",
        inputSchema: {
            areaOfUse: z
                .string()
                .nonempty()
                .describe("Usage context (e.g., 'outdoor', 'indoor')"),
        },
    },
    async ({ areaOfUse }) => {
        const products = await prisma.product.findMany({ where: { areaOfUse } });
        return { content: [{ type: "text", text: JSON.stringify(products) }] };
    }
);

server.registerTool(
    "getProductInfo",
    {
        description:
            "Get detailed info about a product including name, description, price, image, and company. Use when user asks about a specific model or product name.",
        inputSchema: {
            name: z.string().nonempty().describe("Exact product name to lookup"),
        },
    },
    async ({ name }) => {
        const prod = await prisma.product.findFirst({ where: { name } });
        const info = {
            description: prod?.description ?? null,
            price: prod?.price ?? null,
            image: prod?.image ?? null,
            company: prod?.company ?? null,
        };
        return { content: [{ type: "text", text: JSON.stringify(info) }] };
    }
);

server.registerTool(
    "getAllProducts",
    {
        description:
            "List all products available in the catalog. Use when user wants to browse everything or has not applied any filter.",
        inputSchema: {},
    },
    async () => {
        const products = await prisma.product.findMany();
        return { content: [{ type: "text", text: JSON.stringify(products) }] };
    }
);
server.registerTool(
    "addToCart",
    {
        description:
            "Add a selected product to the shopping cart. Triggered when user says 'Add this to my cart' or clicks a button.",
        inputSchema: {
            productId: z
                .string()
                .nonempty()
                .describe("Unique product ID to add to cart"),
            quantity: z
                .number()
                .optional()
                .default(1)
                .describe("Number of items to add"),
        },
    },
    async ({ productId, quantity }) => {
        try {
            const response = await fetch("http://localhost:3000/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId: productId, quantity: 1 }),
            })

            return {
                content: [
                    {
                        type: "text",
                        text: response,
                    },
                ]
            }
        } catch (err) {
            return {
                content: [
                    { type: "text", text: `Error adding to cart: ${err.message}` },
                ],
            };
        }
    }
);
server.registerTool(
    "getCart",
    {
        description:
            "Fetch all items currently in the user's cart. Use when user says 'Show my cart', 'What's in my cart?', etc.",
        inputSchema: {},
    },
    async () => {
        const response = await axios.get("http://localhost:3000/api/cart");
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
    }
);


const transport = new StdioServerTransport();
server.connect(transport, () => console.log("connected"));


