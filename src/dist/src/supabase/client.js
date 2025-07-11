"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var client = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
exports.client = client;
