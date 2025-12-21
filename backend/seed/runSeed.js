import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { seedScreens } from "./screen.seed.js";
import { seedRoles } from "./role.seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGOURL);

console.log("🔌 DB connected for seeding");

await seedScreens();
await seedRoles();

console.log("🌱 SEEDING COMPLETE");
process.exit(0);
