import { GoogleSpreadsheet } from "google-spreadsheet";
import fs from "fs";
import { JWT } from "google-auth-library";

const creds = JSON.parse(fs.readFileSync("./credentials.json", "utf8"));

const auth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

const doc = new GoogleSpreadsheet(
  "1vbh33lRzYuMLuDohmtmLqPfEKODcy8FmryPB-IkCp9g",
  auth
);

await doc.loadInfo();
console.log("✅ Sheet title:", doc.title);
