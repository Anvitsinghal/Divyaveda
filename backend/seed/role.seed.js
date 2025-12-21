import { Role } from "../models/role.master.js";
import { Screen } from "../models/screen.master.js";

export const seedRoles = async () => {
  const allScreens = await Screen.find().select("_id");

  await Role.updateOne(
    { role_name: "admin" },
    {
      role_name: "admin",
      description: "Full admin access",
      screen_access: allScreens.map(s => s._id)
    },
    { upsert: true }
  );

  await Role.updateOne(
    { role_name: "vendor" },
    {
      role_name: "vendor",
      description: "Vendor & inventory access",
      screen_access: await Screen.find({
        screen_name: { $regex: "VENDOR|RAW_MATERIAL|MANUFACTURING" }
      }).select("_id")
    },
    { upsert: true }
  );

  console.log("✅ Roles seeded");
};
