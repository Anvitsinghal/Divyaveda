import { Lead } from "../../models/lead.master.js";
import xlsx from "xlsx";
import fs from "fs";

// Helper: Clean Phone
const cleanPhone = (raw) => {
  if (!raw) return null;
  const str = String(raw).replace(/[^0-9]/g, ""); 
  return str.slice(-10); 
};

export const importLeads = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // 1. READ FILE WITH SMART DATE PARSING
    // { cellDates: true } fixes the "1970" error by converting Excel Numbers to Real Dates
    const workbook = xlsx.readFile(req.file.path, { cellDates: true });
    
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let added = 0;
    let skipped = 0;

    for (const row of rawData) {
      
      const keys = Object.keys(row);
      
      // A. Find Phone Column
      const phoneKey = keys.find(k => /phone|mobile|contact/i.test(k));
      const phoneClean = cleanPhone(row[phoneKey]);

      if (!phoneClean) continue; 

      // B. Duplicate Check
      const exists = await Lead.findOne({ phone: phoneClean });
      if (exists) {
        skipped++;
        continue; 
      }

      // C. DATE LOGIC (The Fix)
      // Find a column that looks like 'date', 'time', or 'created'
      const dateKey = keys.find(k => /date|time|created/i.test(k));
      let dateString = new Date().toISOString().substring(0, 10); // Default to Today
      
      if (dateKey && row[dateKey]) {
          const val = row[dateKey];
          
          if (val instanceof Date) {
              // It is a Real Date (Fixed by cellDates: true)
              // We adjust for timezone offset to avoid "Yesterday" bug
              const offset = val.getTimezoneOffset() * 60000;
              const localDate = new Date(val.getTime() - offset);
              dateString = localDate.toISOString().substring(0, 10);
          } 
          else if (typeof val === 'string') {
              // It is a text string like "2025-10-09"
              dateString = val.substring(0, 10);
          }
      }

      // D. Find Name
      const nameKey = keys.find(k => /name|full/i.test(k) && !/campaign|ad|form|set/i.test(k));
      
      // E. Find Status (Smart Clean)
      let statusVal = "NEW";
      const statusKey = keys.find(k => /status/i.test(k));
      if (statusKey) {
         const val = String(row[statusKey]).toUpperCase();
         // If status is a staff name, ignore it
         if (["AANCHAL", "SHILPA", "HARVINDER"].includes(val)) {
            statusVal = "NEW"; 
         } else {
            statusVal = row[statusKey]; // Keep original casing (e.g. "complete")
         }
      }

      const newLead = {
        full_name: row[nameKey] || "Unknown",
        phone: phoneClean,
        email: row["email"] || row["Email"] || null,
        
        platform: (row["platform"] || "other").toLowerCase(),
        ad_name: row["ad_name"] || null,
        
        lead_status: statusVal, 
        
        meta_data: row, 
        source: req.body.source || "HISTORICAL",
        created_date: dateString, // <--- Correct format "YYYY-MM-DD"
        created_by: req.user.id
      };

      await Lead.create(newLead);
      added++;
    }

    fs.unlinkSync(req.file.path);
    
    res.json({ 
      success: true, 
      message: `Sync Complete! ✅ Added ${added} new leads.` 
    });

  } catch (error) {
    if(req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("Import Error:", error); 
    res.status(500).json({ message: error.message });
  }
};