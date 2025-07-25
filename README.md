# Bytecraft MCP Server Documentation

=====================================

## Overview

---

This is a documentation of the Bytecraft MCP server, a Node.js application built using Express.js and Model Context Protocol (MCP) SDK. The server provides a set of tools and APIs for managing products and orders.

## Directory Structure

---

- `backend`: Contains the server-side code
  - `index.ts`: Entry point of the application
  - `prisma`: Contains the Prisma models
  - `supabase`: Contains the Supabase client configuration
- `README.md`: This documentation file

## Index.ts

---

The `index.ts` file is the entry point of the application. It sets up the Express.js server, configures the MCP server, and defines the routes for the APIs.

### Server

const server = new McpServer({ name: "Bytecraft-mcp", version: "1.0.0" });

### MCP Server Configuration

The MCP server is configured with the following settings:

- `name`: "Bytecraft-mcp"
- `version`: "1.0.0"
- `connection`:using streamable Http requests as a transport

## Code

```javascript
const transports: Record<string, StreamableHTTPServerTransport> = {};
```

## Tool Usage

```javascript
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
    console.log("[Tool Called] findProductByUse with areaOfUse:", areaOfUse);

    const products = await prisma.product.findMany({ where: { areaOfUse } });
    return { content: [{ type: "text", text: JSON.stringify(products) }] };
  }
);
```

```javascript
app.post("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports[sid] = transport;
      },
    });
    transport.onclose = () => {
      if (transport.sessionId) delete transports[transport.sessionId];
    };
    await server.connect(transport);
  } else if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Invalid session ID" },
      id: null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});
```

```javascript
const transports: Record<string, StreamableHTTPServerTransport> = {};
```

### Routes

The following routes are defined:

- `/mcp`: Handles MCP requests
- `/mcp/session`: Handles MCP session requests
- `/cart`: Handles cart-related requests

## Prisma Models

---

The Prisma models are defined in the `prisma` directory. The models are used to interact with the database.

### Product Model

The `Product` model represents a product in the database. It has the following fields:

- `id`: Unique identifier for the product
- `name`: Name of the product
- `description`: Description of the product
- `price`: Price of the product
- `type`: Type of the product
- `areaOfUse`: Area of use of the product

### Order Model

The `Order` model represents an order in the database. It has the following fields:

- `id`: Unique identifier for the order
- `customerId`: Customer ID associated with the order
- `productId`: Product ID associated with the order
- `quantity`: Quantity of the product ordered
- `total`: Total cost of the order

## Prisma

# 📃️ Prisma Data Models

This project uses **PostgreSQL** with Prisma as the ORM. Below are the data models defined in `schema.prisma`.

---

## 🧑‍💼 User

Represents a registered user.

```javascript
model User {
  id        String     @id @default(cuid())
  clerkId   String     @unique
  orders    Order[]
  reviews   Review[]
  Favorite  Favorite[]
  Cart      Cart?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

---

## 🛍️ Product

Stores product catalog entries.

```javascript
model Product {
  id          String      @id @default(cuid())
  name        String
  company     String
  type        String
  areaOfUse   String
  description String
  featured    Boolean
  image       String
  price       Int
  reviews     Review[]
  OrderItem   OrderItem[]
  Favorite    Favorite[]
  CartItem    CartItem[]
}
```

---

## 🛒 Cart

Each user has one cart.

```javascript
model Cart {
  id     String     @id @default(cuid())
  userId String     @unique
  user   User       @relation(fields: [userId], references: [id])
  items  CartItem[]
}
```

---

## 🧲 CartItem

Items inside a user's cart.

```javascript
model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id])
  productId String   @unique
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Int
}
```

---

## 📦 Order

A record of a completed purchase.

```javascript
model Order {
  id         String      @id @default(cuid())
  userId     String
  user       User        @relation(fields: [userId], references: [id])
  orderItems OrderItem[]
  total      Int
  status     String
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

---

## 📦 OrderItem

Individual product in an order.

```javascript
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  price     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## ✍️ Review

Customer reviews for products.

```javascript
model Review {
  reviewId  String   @id @default(cuid())
  content   String
  stars     Int
  productId String
  userId    String
  product   Product  @relation(fields: [productId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## ❤️ Favorite

User’s favorite (wishlist) products.

```javascript
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  productId String
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Product data

```json
{
"id": "cmcracmy40000ovpgm0avuzf6",
"name": "avant-garde lamp",
"company": "Modenza",
"type": "lamp",
"areaOfUse": "lighting",
"description": "Crafted from hand-blown smoked glass and brushed brass, this avant-garde lamp casts sculptural pools of warm light. Its asymmetrical design and integrated dimmer make it both a centerpiece and a functional reading light in modern interiors.",
"featured": true,
"image": "https://images.pexels.com/photos/943150/pexels-photo-943150.jpeg?auto=compress&cs=tinysrgb&w=1600",
"price": 100
}
```


## Supabase Client

---

The Supabase client is used to interact with the Supabase database. The client is configured with the following settings:

- `SUPABASE_URL`: URL of the Supabase database
- `SUPABASE_ANON_KEY`: Anonymous key for the Supabase database

## MCP Server Tools

The following tools are available:

- `getCart`: Fetches the cart contents for a user
- `productInfoViaType`: Fetches product information by type
- `productInfoViaUse`: Fetches product information by area of use
- `getPriceofProduct`: Fetches the price of a product
- `initializeMcpSession`: Initializes a new MCP session
- `addProductToCart`: Adds a product to the cart
- `removeProductFromCart`: Removes a product from the cart
- `checkout`: Checks out the cart

## Frontend APIs which are used to query data of the user

The following MCP APIs are available:

- `initialize`: Initializes a new MCP session
- `getCart`: Fetches the cart contents for a user
- `addProductToCart`: Adds a product to the cart
- `removeProductFromCart`: Removes a product from the cart
- `checkout`: Checks out the cart

Note: This documentation is a summary of the code and may not be exhaustive.

MCP Server Tools:

- `getCart`
- `productInfoViaType`
- `productInfoViaUse`
- `getPriceofProduct`
- `initializeMcpSession`
- `addProductToCart`
- `removeProductFromCart`
- `checkout`
````
