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
  console.log("🔄 Creating WhatsApp client with fresh session...");
  
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "zapnode-session"
    }),
    puppeteer: { 
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: false,
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox"
      ]
    }
  });

  // QR Code event
  client.on("qr", (qr) => {
    console.log("\n🔐 QR Code received! Scan with your phone:\n");
    qrcode.generate(qr, { small: true });
  });

  // Client ready event
  client.on("ready", async () => {
    console.log("\n✅✅✅ WhatsApp Client is READY! ✅✅✅\n");
    
    // Get client info
    const info = client.info;
    console.log("📱 Connected as:", info.pushname);
    console.log("📞 Phone:", info.wid.user);
    
    // Send test message
    try {
      const testNumber = "244929782402@c.us";
      await client.sendMessage(testNumber, "🤖 Bot WhatsApp conectado com sucesso!\n\nEnvie *!ping* para testar.");
      console.log("✅ Test message sent successfully!");
    } catch (error) {
      console.error("❌ Error sending test message:", error.message);
    }
  });

  // Authentication event
  client.on("authenticated", () => {
    console.log("✅ Client authenticated!");
    console.log("⏳ Waiting for ready event...");
  });

  // Loading screen
  client.on("loading_screen", (percent, message) => {
    console.log(`⏳ Loading: ${percent}% - ${message}`);
  });

  // Auth failure event
  client.on("auth_failure", (msg) => {
    console.error("❌ Authentication failure:", msg);
  });

  // Disconnected event
  client.on("disconnected", (reason) => {
    console.log("❌ Client disconnected:", reason);
  });

  // Remote session saved (for LocalAuth)
  client.on("remote_session_saved", () => {
    console.log("💾 Session saved!");
  });

  // Message event - only receives messages from others
  client.on("message", async (message) => {
    console.log("\n� NEW MESSAGE RECEIVED!");
    console.log("From:", message.from);
    console.log("Body:", message.body);
    console.log("---");
    
    // Respond to !ping
    if (message.body.toLowerCase() === '!ping') {
      try {
        await message.reply('🏓 pong!');
        console.log("✅ Pong sent!");
      } catch (error) {
        console.error("❌ Error:", error.message);
      }
    }
  });

  // Initialize client
  console.log("� Initializing WhatsApp client...");
  client.initialize();
}

// Export functions and WhatsApp client instance
module.exports = {
  startWhatsApp,
  getClient: () => client,
};
