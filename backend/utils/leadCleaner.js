export const cleanLeadRow = (row) => {
  const phoneRaw = row["phone"] || row.phone;
  if (!phoneRaw) return null;

  const phone = String(phoneRaw).replace(/\D/g, "").slice(-10);
  if (phone.length !== 10) return null;

  return {
    created_date: row["created_time"]
      ? row["created_time"].split("T")[0]
      : new Date().toISOString().split("T")[0],

    full_name: row["full name"] || "Unknown",
    email: row["email"] || null,
    phone,

    platform: row["platform"] || "other",
    ad_name: row["ad_name"] || null,
    campaign_name: row["campaign_name"] || null,

    business_type: row["what_type_of_business_do_you_run?"] || null,
    role: row["what_is_your_role_within_the_company?"] || null,

    lead_status: row["lead_status"] || "CREATED",
    source: "DAILY_LEAD",
    isActive: true,

    meta_data: row._rawData
  };
};
