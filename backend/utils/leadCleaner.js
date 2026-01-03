export const cleanLeadRow = (row) => {
  const headers = row._worksheet._headerValues;
  const data = row._rawData;

  if (!data || data.length === 0) return null;

  const get = (name) => {
    const idx = headers.indexOf(name);
    return idx !== -1 ? data[idx] : "";
  };

  // PHONE (MANDATORY)
  const phone = String(get("phone"))
    .replace("p:+91", "")
    .replace("p:", "")
    .trim();

  if (!phone) return null;

  return {
    created_date: get("created_time")
      ? String(get("created_time")).split("T")[0]
      : "",

    full_name: get("full name") || "Unknown",
    phone,
    email: get("email") || null,

    platform: get("platform") || "other",
    ad_name: get("ad_name") || null,
    campaign_name: get("campaign_name") || null,

    business_type: get("what_type_of_business_do_you_run?") || null,
    role: get("what_is_your_role_within_the_company?") || null,

    lead_status: get("lead_status") || "NEW",
    source: "DAILY_LEAD",

    meta_data: Object.fromEntries(headers.map((h, i) => [h, data[i]]))
  };
};
