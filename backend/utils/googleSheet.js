import { GoogleSpreadsheet } from "google-spreadsheet";
import fs from "fs";
import path from "path";
import { JWT } from "google-auth-library";
console.log("🔥 googleSheet.js loaded");

const SHEET_ID = "1vbh33lRzYuMLuDohmtmLqPfEKODcy8FmryPB-IkCp9g";

export const fetchSheetRows = async () => {
  const credentialsPath = path.join(process.cwd(), "credentials.json");
  const creds = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
console.log("🔥 fetchSheetRows CALLED");

  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

  await doc.loadInfo(); // loads document properties
  const sheet = doc.sheetsByIndex[0]; // first sheet
  const rows = await sheet.getRows();
console.log("Sample row:", rows[0]);

  return rows;
};
