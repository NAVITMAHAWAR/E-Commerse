const admin = require("firebase-admin");
const path = require("path");

let serviceAccount;
try {
  serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));
  console.log(
    "Firebase Admin SDK initialized with project:",
    serviceAccount.project_id,
  );
} catch (err) {
  console.error("Failed to load service account:", err);
  process.exit(1); // crash karo agar file nahi mili
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
