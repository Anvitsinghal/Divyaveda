import { Screen } from "../models/screen.master.js";

export const seedScreens = async () => {
  const screens = [
    // CATEGORY
    { screen_name: "CATEGORY_CREATE" },
    { screen_name: "CATEGORY_VIEW" },
    { screen_name: "CATEGORY_UPDATE" },
    { screen_name: "CATEGORY_DELETE" },

    // SUBCATEGORY
    { screen_name: "SUBCATEGORY_CREATE" },
    { screen_name: "SUBCATEGORY_VIEW" },
    { screen_name: "SUBCATEGORY_UPDATE" },
    { screen_name: "SUBCATEGORY_DELETE" },

    // PRODUCT
    { screen_name: "PRODUCT_CREATE" },
    { screen_name: "PRODUCT_VIEW" },
    { screen_name: "PRODUCT_UPDATE" },
    { screen_name: "PRODUCT_DELETE" },

    // VENDOR & INVENTORY
    { screen_name: "VENDOR_CREATE" },
    { screen_name: "VENDOR_VIEW" },
    { screen_name: "RAW_MATERIAL_CREATE" },
    { screen_name: "RAW_MATERIAL_VIEW" },
    { screen_name: "VENDOR_PURCHASE_CREATE" },

    // MANUFACTURING
    { screen_name: "MANUFACTURING_CREATE" },
    { screen_name: "MANUFACTURING_VIEW" },

    // RBAC
    { screen_name: "ROLE_CREATE" },
    { screen_name: "ROLE_VIEW" },
    { screen_name: "SCREEN_CREATE" },
    { screen_name: "SCREEN_VIEW" },
    { screen_name: "USER_ROLE_ASSIGN" },

    // ANALYTICS
    { screen_name: "ANALYTICS_USER_VIEW" },
    { screen_name: "ANALYTICS_DAU_VIEW" }
  ];

  for (const s of screens) {
    await Screen.updateOne(
      { screen_name: s.screen_name },
      { $setOnInsert: s },
      { upsert: true }
    );
  }

  console.log("✅ Screens seeded");
};
