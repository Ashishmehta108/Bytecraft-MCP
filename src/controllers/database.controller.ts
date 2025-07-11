// import server from "../index.js";
// import prisma from "../../utils/db.js";
// import { Request, Response } from "express";

// const getAllproducts = async () => {
//   const getAllProduct = await prisma.product.findMany();
//   return getAllProduct;
// };

// const productInfoViaType = async (type: string) => {
//   const product = await prisma.product.findMany({
//     where: {
//       type: type,
//     },
//   });
//   return product;
// };

// const productInfoViaUse = async (areaofUser: string) => {
//   const product = await prisma.product.findMany({
//     where: {
//       areaOfUse: areaofUser,
//     },
//   });
//   return product;
// };

// const getPriceofProduct = async (productId: string) => {
//   const product = await prisma.product.findUnique({
//     where: {
//       id: productId,
//     },
//   });
//   return product?.price;
// };

// export {
//   getAllproducts,
//   productInfoViaType,
//   productInfoViaUse,
//   getPriceofProduct,
// };
