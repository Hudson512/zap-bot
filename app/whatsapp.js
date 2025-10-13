require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const path = require("path");

// Exported client for integration with other modules
let client = null;



// Start WhatsApp client
function startWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
       args: ["--no-sandbox"]
      },
  });

  client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

  client.on("ready", () => {
    console.log("Connected to WhatsApp!");
  });

  client.on("message", async (msg) => {
    const rawNumber = msg.from;
    const messageText = msg.body;
    const numberE164 = `+${rawNumber.replace("@c.us", "")}`;
    console.log(`Received message from ${numberE164}: ${messageText}`);
  });

  client.initialize();
}

// Export functions and WhatsApp client instance
module.exports = {
  startWhatsApp,
  getClient: () => client,
};
