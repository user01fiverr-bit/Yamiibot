module.exports = {
  name: "destroy",
  category: "hacker",
  description: "Trigger system failure simulation",
  usage: ".destroy",
  permission: "user",
  async run(ctx) {
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    
    const payloads = [
      "⚠️ [SYSTEM_CRITICAL] KERNEL PANIC. Unhandled exception at 0x00000000.",
      "💀 [RANSOMWARE] Encrypting local storage... AES-256 GCM active.",
      "📡 [EXFILTRATION] Uploading /sdcard/DCIM/ to remote server...",
      "🔓 [ROOTKIT] Bypassing SELinux. Injecting malicious payload.",
      "🗄️ [DATABASE] Dropping tables: users, messages, contacts.",
      "🦠 [WORM] Spreading to linked devices. Bluetooth PAN compromised.",
      "🔋 [HARDWARE] Overclocking CPU to 4.5GHz. Thermal throttling disabled.",
      "🛑 [FIREWALL] Disabling iptables. Opening all ports.",
      "📸 [SPYWARE] Accessing camera and microphone. Streaming live feed.",
      "☠️ [FATAL] System integrity compromised. Bootloader unlocked.",
      "📡 [NET] Target IP acquired. Bypassing firewall...",
      "🔓 [PAY] Root access granted. Injecting zero-day payload...",
      "🗄️ [DATA] Cloning encrypted database tables... 100%",
      "📂 [DATA] Extracting media vault: [GALLERY] [CHATS] [AUDIO]...",
      "📡 [NET] Exfiltrating 4.2 GB to secure offshore server...",
      "⚠️ [SYS] Data secured. Trace wiped. Connection terminated.",
      "💻 [PROC] Spawning 5000 zombie threads. CPU usage at 99%.",
      "🌐 [DNS] Poisoning local DNS cache. Redirecting traffic...",
      "🔐 [CRYPTO] Generating RSA-4096 keys. Brute-forcing password...",
      "🛰️ [SAT] Uplink established. Routing through 7 proxy nodes.",
      "🔋 [POWER] Draining battery. Fast charge disabled.",
      "📱 [SIM] Cloning IMEI and IMSI. Spoofing identity...",
      "📶 [NET] Hijacking mobile data. Intercepting packets...",
      "🕵️ [SPY] Keylogger active. Capturing keystrokes...",
      "🚨 [ALERT] Intrusion detected. Countermeasures initiated.",
      "🔒 [LOCK] Remote device lock initiated. Bypassing encryption...",
      "📂 [SYS] Deleting system32... (simulation).",
      "💥 [CRASH] Memory overflow. Stack smashing detected.",
      "🖥️ [SHELL] Reverse shell established on port 4444.",
      "📡 [WIFI] Deauthenticating all devices on network...",
      "🔓 [PASS] Cracking WPA2 handshake... Success.",
      "📁 [FILE] Compressing entire storage into .zip...",
      "📤 [UP] Uploading to dark web server...",
      "🛑 [STOP] Stopping all running processes...",
      "💀 [DEAD] System unresponsive. Preparing for reboot...",
      "🔌 [USB] Injecting payload via USB OTG...",
      "📲 [APP] Sideloading malware.apk...",
      "🕸️ [BOT] Adding device to botnet...",
      "🧬 [DNA] Hashing biometric data...",
      "👁️ [CAM] Accessing front camera...",
      "🎤 [MIC] Accessing microphone...",
      "📍 [GPS] Tracking location...",
      "📞 [CALL] Recording call log...",
      "📩 [SMS] Reading all SMS messages...",
      "🔑 [AUTH] Bypassing 2FA...",
      "🛡️ [AV] Disabling antivirus...",
      "🧹 [LOG] Wiping event logs...",
      "🌍 [IP] Changing IP address...",
      "🔥 [BURN] Destroying device...",
      "✅ [DONE] Operation complete."
    ];

    for (let i = 0; i < 50; i++) {
      await ctx.sock.sendMessage(ctx.jid, { text: payloads[i] });
      await delay(50); 
    }
  }
};
