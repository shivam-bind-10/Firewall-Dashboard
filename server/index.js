import express from "express";
import cors from "cors";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PS_SCRIPT = path.join(__dirname, "firewall.ps1");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory cache for fast responses
let cachedRules = null;
let lastRulesFetch = 0;
const CACHE_TTL = 15000; // 15 seconds

function runPowerShell(args) {
  return new Promise((resolve, reject) => {
    const psArgs = [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      PS_SCRIPT,
      ...args,
    ];

    execFile(
      "powershell.exe",
      psArgs,
      { maxBuffer: 1024 * 1024 * 32, encoding: "utf8" },
      (error, stdout, stderr) => {
        if (error) {
          console.error("PowerShell Error:", stderr || error.message);
          return reject(error);
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch {
          resolve({ raw: stdout.trim(), stderr: stderr.trim() });
        }
      }
    );
  });
}

// 1. Get status & profiles
app.get("/api/status", async (req, res) => {
  try {
    const data = await runPowerShell(["-Action", "status"]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get profiles
app.get("/api/profiles", async (req, res) => {
  try {
    const data = await runPowerShell(["-Action", "profiles"]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get all rules
app.get("/api/rules", async (req, res) => {
  try {
    const force = req.query.force === "true";
    const now = Date.now();
    if (!force && cachedRules && now - lastRulesFetch < CACHE_TTL) {
      return res.json(cachedRules);
    }

    const data = await runPowerShell(["-Action", "rules"]);
    cachedRules = data;
    lastRulesFetch = now;
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get active listening ports & processes
app.get("/api/listening", async (req, res) => {
  try {
    const data = await runPowerShell(["-Action", "listening"]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Toggle rule state
app.post("/api/rules/toggle", async (req, res) => {
  try {
    const { name, enabled } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Rule name is required" });

    cachedRules = null; // Invalidate cache
    const result = await runPowerShell([
      "-Action",
      "toggle-rule",
      "-RuleName",
      name,
      "-Enabled",
      String(enabled),
    ]);

    if (result && result.error) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Create new rule
app.post("/api/rules/create", async (req, res) => {
  try {
    const { name, direction, action, protocol, port, program, profile } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Rule name is required" });

    cachedRules = null; // Invalidate cache
    const args = [
      "-Action",
      "create-rule",
      "-RuleName",
      name,
      "-Direction",
      direction || "in",
      "-RuleAction",
      action || "allow",
      "-Protocol",
      protocol || "TCP",
    ];

    if (port) args.push("-Port", String(port));
    if (program) args.push("-Program", program);
    if (profile) args.push("-ProfileName", profile);

    const result = await runPowerShell(args);
    if (result && result.error) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Delete rule
app.post("/api/rules/delete", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Rule name is required" });

    cachedRules = null; // Invalidate cache
    const result = await runPowerShell([
      "-Action",
      "delete-rule",
      "-RuleName",
      name,
    ]);

    if (result && result.error) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Toggle profile
app.post("/api/profiles/toggle", async (req, res) => {
  try {
    const { profileName, enabled } = req.body;
    if (!profileName) return res.status(400).json({ success: false, error: "Profile name required" });

    const result = await runPowerShell([
      "-Action",
      "toggle-profile",
      "-ProfileName",
      profileName,
      "-Enabled",
      String(enabled),
    ]);

    if (result && result.error) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Windows Firewall REST API bridge listening on http://localhost:${PORT}`);
});
