// import {
//   ContentEmbedding,
//   createUserContent,
//   GoogleGenAI,
// } from "@google/genai";
// import { client } from "../supabase/client.js";
// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
// type Document = {
//   id: string;
//   title: string;
//   body: string;
//   embedding?: number[]; // Only if returned
// };

// const embeddata =
//   "Climate change refers to long-term alterations in temperature, precipitation, wind patterns, and other elements of the Earth's climate system. It has become a defining issue of our time, with rising global temperatures, melting polar ice caps, sea-level rise, and increasingly frequent and severe weather events such as hurricanes, droughts, wildfires, and floods. These changes are largely driven by human activities — most notably the burning of fossil fuels such as coal, oil, and gas, which releases vast amounts of carbon dioxide and other greenhouse gases into the atmosphere. These gases trap heat, leading to a warming effect commonly known as the greenhouse effect. Industrial processes, deforestation, agriculture, and transportation also contribute significantly to emissions. The impact of climate change is far-reaching: ecosystems are being disrupted, biodiversity is declining, and food and water security is under threat in many parts of the world. Coral reefs are bleaching, Arctic permafrost is melting, and entire communities are being displaced due to extreme climate conditions. Furthermore, climate change disproportionately affects vulnerable populations, often in developing countries, who contribute the least to global emissions but face the greatest risks. Mitigating climate change requires a global effort to transition away from fossil fuels toward renewable energy sources such as solar, wind, hydro, and geothermal power. It also involves adopting sustainable practices, improving energy efficiency, protecting and restoring forests, and investing in climate-resilient infrastructure. International agreements like the Paris Agreement aim to unite nations in keeping global temperature rise well below 2°C above pre-industrial levels, with efforts to limit the increase to 1.5°C. However, this goal requires rapid and transformative changes in every sector of society, including energy, transportation, agriculture, and finance. Public awareness, policy change, technological innovation, and grassroots activism all play crucial roles in shaping a sustainable future. Without significant action, the consequences of climate change will intensify, posing existential threats to life on Earth.";

// const response = await ai.models.embedContent({
//   model: "text-embedding-004",
//   contents: [embeddata],
//   config: {
//     outputDimensionality: 384,
//   },
// });
// const embedding = Array.from(response.embeddings as ContentEmbedding[]);

// // const { data, error } = await client.from("documents").insert({
// //   title: "emebedded",
// //   body: "vector",
// //   embedding: embedding[0].values,
// // });
// // console.log(data, error);
// const query =
//   "How does climate change affect poor countries and what can be done to reduce its impact?";
// const { data: matchdocs } = await client.rpc<"match_documents", Document>(
//   "match_documents",
//   {
//     query_embedding: embedding[0].values,
//     match_threshold: 0.78,
//     match_count: 10,
//   }
// );
// //@ts-ignore
// console.log(matchdocs[0].id, matchdocs[0].title, matchdocs[0].similarity);
// export default matchdocs;
