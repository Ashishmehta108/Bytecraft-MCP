// import { Router } from "express";
// import { getAllproducts } from "../controllers/database.controller.js";
// import { client } from "../supabase/client.js";

// const toolRouter = Router();

// // toolRouter.route("/all").get(getproducts);

// // GET /cart - get all cart items
// // POST /cart - add item to cart
// // PUT /cart - update item quantity
// // DELETE /cart - remove item from cart

// toolRouter.get("/cart", async (req, res) => {
//   try {
//     const { data, error } = await client.from("cart").select("*");
//     if (error) throw error;
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: (err as Error).message });
//   }
// });

// toolRouter.post("/cart", async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;
//     if (!productId) return res.status(400).json({ error: "productId required" });
//     const { data, error } = await client.from("cart").insert({ productId, quantity });
//     if (error) throw error;
//     res.status(201).json(data);
//   } catch (err) {
//     res.status(500).json({ error: (err as Error).message });
//   }
// });

// toolRouter.put("/cart", async (req, res) => {
//   try {
//     const { productId, quantity } = req.body;
//     if (!productId || typeof quantity !== "number") return res.status(400).json({ error: "productId and quantity required" });
//     const { data, error } = await client.from("cart").update({ quantity }).eq("productId", productId);
//     if (error) throw error;
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: (err as Error).message });
//   }
// });

// toolRouter.delete("/cart", async (req, res) => {
//   try {
//     const { productId } = req.body;
//     if (!productId) return res.status(400).json({ error: "productId required" });
//     const { data, error } = await client.from("cart").delete().eq("productId", productId);
//     if (error) throw error;
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: (err as Error).message });
//   }
// });

// export default toolRouter;
