import { useRef, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  Database,
  Download,
  Edit3,
  Eye,
  FileWarning,
  Filter,
  Gauge,
  Grid2X2,
  List,
  LockKeyhole,
  LogOut,
  Menu,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  X,
  Zap,
} from "lucide-react";
import "./App.css";
import "./ui-polish.css";
import "./dashboard-design.css";

const seedRules = [
  {
    id: "FW-1042",
    source: "10.24.8.0/24",
    destination: "172.16.4.12",
    protocol: "TCP",
    sourcePort: "ANY",
    destinationPort: "443",
    action: "ALLOW",
    priority: 10,
    status: "ENABLED",
    description: "Production HTTPS ingress",
    created: "2026-09-14T08:22:00",
  },
  {
    id: "FW-1041",
    source: "192.168.10.44",
    destination: "10.0.0.22",
    protocol: "TCP",
    sourcePort: "ANY",
    destinationPort: "22",
    action: "DENY",
    priority: 20,
    status: "ENABLED",
    description: "Block external SSH access",
    created: "2026-09-13T15:04:00",
  },
  {
    id: "FW-1040",
    source: "ANY",
    destination: "172.16.4.0/24",
    protocol: "UDP",
    sourcePort: "ANY",
    destinationPort: "53",
    action: "ALLOW",
    priority: 30,
    status: "ENABLED",
    description: "Internal DNS resolution",
    created: "2026-09-12T11:40:00",
  },
  {
    id: "FW-1039",
    source: "10.24.12.8",
    destination: "10.0.0.18",
    protocol: "TCP",
    sourcePort: "443",
    destinationPort: "5432",
    action: "ALLOW",
    priority: 40,
    status: "DISABLED",
    description: "Analytics database access",
    created: "2026-09-11T09:18:00",
  },
  {
    id: "FW-1038",
    source: "ANY",
    destination: "ANY",
    protocol: "ANY",
    sourcePort: "ANY",
    destinationPort: "ANY",
    action: "ALLOW",
    priority: 90,
    status: "ENABLED",
    description: "Temporary broad access (review)",
    created: "2026-09-10T16:31:00",
  },
  {
    id: "FW-1037",
    source: "172.16.2.50",
    destination: "10.0.0.80",
    protocol: "ICMP",
    sourcePort: "ANY",
    destinationPort: "ANY",
    action: "ALLOW",
    priority: 50,
    status: "ENABLED",
    description: "Monitoring health checks",
    created: "2026-09-09T13:15:00",
  },
];
const initialLogs = [
  {
    time: "2026-09-14T09:24:00",
    action: "ANALYZE_RULE",
    rule: "SYSTEM",
    details: "Completed policy analysis. 3 findings require review.",
    status: "COMPLETED",
  },
  {
    time: "2026-09-14T08:22:00",
    action: "CREATE_RULE",
    rule: "FW-1042",
    details: "Created production HTTPS ingress policy.",
    status: "SUCCESS",
  },
  {
    time: "2026-09-13T15:04:00",
    action: "UPDATE_RULE",
    rule: "FW-1041",
    details: "Changed destination port to 22.",
    status: "SUCCESS",
  },
  {
    time: "2026-09-13T10:12:00",
    action: "LOGIN",
    rule: "-",
    details: "Administrator session started.",
    status: "SUCCESS",
  },
];
const navItems = [
  { to: "/dashboard", label: "Overview", icon: Gauge },
  { to: "/rules", label: "Firewall Rules", icon: Shield },
  { to: "/analysis", label: "Rule Analysis", icon: Activity },
  { to: "/audit-logs", label: "Audit Logs", icon: BookOpen },
];
const ruleFilters = [
  "ALL",
  "ENABLED",
  "DISABLED",
  "ALLOW",
  "DENY",
  "TCP",
  "UDP",
  "ICMP",
  "ANY",
];

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem("firewall-auth") === "true",
  );
  const [profile, setProfile] = useState(() => ({
    name: localStorage.getItem("firewall-profile-name") || "Shivam Bind",
    email:
      localStorage.getItem("firewall-profile-email") || "admin@sentinel.local",
  }));
  const [rules, setRules] = useState(() =>
    JSON.parse(
      localStorage.getItem("firewall-rules") || JSON.stringify(seedRules),
    ),
  );
  const [logs, setLogs] = useState(() =>
    JSON.parse(
      localStorage.getItem("firewall-logs") || JSON.stringify(initialLogs),
    ),
  );
  const [toast, setToast] = useState(null);
  const persistRules = (next) => {
    setRules(next);
    localStorage.setItem("firewall-rules", JSON.stringify(next));
  };
  const addLog = (action, rule, details) => {
    const next = [
      {
        time: new Date().toISOString(),
        action,
        rule,
        details,
        status: "SUCCESS",
      },
      ...logs,
    ];
    setLogs(next);
    localStorage.setItem("firewall-logs", JSON.stringify(next));
  };
  const saveProfile = (nextProfile) => {
    setProfile(nextProfile);
    localStorage.setItem("firewall-profile-name", nextProfile.name);
    localStorage.setItem("firewall-profile-email", nextProfile.email);
    addLog("UPDATE_PROFILE", "-", "Updated administrator profile.");
  };
  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };
  const login = () => {
    localStorage.setItem("firewall-auth", "true");
    setAuthenticated(true);
    addLog("LOGIN", "-", "Administrator session started.");
  };
  const logout = () => {
    localStorage.removeItem("firewall-auth");
    setAuthenticated(false);
  };
  return (
    <BrowserRouter>
      {!authenticated ? (
        <Routes>
          <Route path="*" element={<Login onLogin={login} />} />
        </Routes>
      ) : (
        <DashboardShell
          onLogout={logout}
          rules={rules}
          setRules={persistRules}
          logs={logs}
          addLog={addLog}
          notify={notify}
          profile={profile}
          saveProfile={saveProfile}
        />
      )}{" "}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </BrowserRouter>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@sentinel.local");
  const [password, setPassword] = useState("password");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (!email || !password)
      return setError("Enter your administrator credentials.");
    onLogin();
  };
  return (
    <main className="login-page">
      <div className="login-grid" />
      <div className="login-panel">
        <Brand large />
        <div className="login-copy">
          <p className="eyebrow">SECURE ACCESS / SIMULATION</p>
          <h1>
            Policy control,
            <br />
            <em>made visible.</em>
          </h1>
          <p>
            Manage simulated network policies with clarity, confidence, and a
            complete audit trail.
          </p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <label>
            Email address
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </label>
          <label>
            Password
            <div className="password-wrap">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
              />
              <button type="button" onClick={() => setShow(!show)}>
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {error && (
            <div className="form-error">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}
          <button className="primary-button login-button" type="submit">
            Sign in to console <ArrowUp size={16} />
          </button>
          <p className="demo-note">
            Demo only: any non-empty email address and password will work.
          </p>
        </form>
        <div className="login-footer">
          <span>
            <LockKeyhole size={14} /> Browser-only demo session
          </span>
          <span>v1.0.0 / SIMULATION</span>
        </div>
      </div>
      <div className="login-aside">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="aside-content">
          <span className="live-dot" /> SYSTEM OPERATIONAL
          <h2>
            See every rule.
            <br />
            Understand every risk.
          </h2>
          <div className="aside-metric">
            <span>LOCAL SIMULATION</span>
            <strong>Explore safely</strong>
            <small>Changes stay in this browser</small>
          </div>
        </div>
      </div>
    </main>
  );
}

function DashboardShell({
  onLogout,
  rules,
  setRules,
  logs,
  addLog,
  notify,
  profile,
  saveProfile,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = location.pathname.startsWith("/rules")
    ? "Firewall Rules"
    : location.pathname === "/analysis"
      ? "Rule Analysis"
      : location.pathname === "/audit-logs"
        ? "Audit Logs"
        : location.pathname === "/settings"
          ? "Settings"
          : "Overview";
  const result = analyze(rules);
  const analysisFindingCount =
    result.duplicates.length +
    result.risky.length +
    result.conflicts.length +
    result.invalid.length;
  const stats = {
    total: rules.length,
    active: rules.filter((r) => r.status === "ENABLED").length,
    allow: rules.filter((r) => r.action === "ALLOW").length,
    deny: rules.filter((r) => r.action === "DENY").length,
    risky: result.risky.length,
  };
  const shared = { rules, setRules, logs, addLog, notify, profile };
  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${mobileOpen ? "open" : ""}`}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        <div className="sidebar-top">
          <Brand />
          <button
            className="icon-button mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mode-chip">
          <span className="live-dot" />
          SIMULATION MODE <CircleHelp size={14} />
        </div>
        <nav>
          <p className="nav-label">CONTROL CENTER</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Rule Analysis" && analysisFindingCount > 0 && (
                <b>{analysisFindingCount}</b>
              )}
            </NavLink>
          ))}
          <p className="nav-label nav-label-spaced">SYSTEM</p>
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="status-line">
            <span className="live-dot" />
            <div>
              <strong>Simulation ready</strong>
              <small>Browser storage only</small>
            </div>
          </div>
          <div className="profile">
            <div className="avatar">
              {profile.name
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <strong>{profile.name}</strong>
              <small>Administrator</small>
            </div>
            <button className="icon-button" onClick={onLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="main-area">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="breadcrumb">
              CONSOLE <span>/</span> {title.toUpperCase()}
            </p>
            <h2>{title}</h2>
          </div>
          <div className="topbar-actions">
            <div className="connection">
              <span className="live-dot" />
              Local simulation
            </div>
            <button
              className="icon-button notification"
              onClick={() => navigate("/analysis")}
              aria-label="Review security signals"
              title="Review security signals"
            >
              <Bell size={18} />
              {analysisFindingCount > 0 && <i />}
            </button>
            <button
              className="top-profile"
              onClick={() => navigate("/settings")}
              aria-label={`Open ${profile.name} profile settings`}
              title="Open profile settings"
            >
              <div className="avatar">
                {profile.name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <span>{profile.name}</span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={<Dashboard stats={stats} rules={rules} logs={logs} />}
            />
            <Route path="/rules" element={<Rules {...shared} />} />
            <Route path="/rules/create" element={<RuleEditor {...shared} />} />
            <Route
              path="/rules/:id/edit"
              element={<RuleEditor {...shared} />}
            />
            <Route
              path="/analysis"
              element={<Analysis rules={rules} notify={notify} addLog={addLog} />}
            />
            <Route path="/audit-logs" element={<AuditLogs logs={logs} />} />
            <Route
              path="/settings"
              element={
                <Settings
                  profile={profile}
                  saveProfile={(nextProfile) => {
                    saveProfile(nextProfile);
                    notify("Profile updated.");
                  }}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Dashboard({ stats, rules, logs }) {
  const alerts = analyze(rules);
  const activityDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const dayLogs = logs.filter((log) => {
      const logDate = new Date(log.time);
      return logDate.toDateString() === date.toDateString();
    });
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      events: dayLogs.length,
      changes: dayLogs.filter((log) => /RULE/.test(log.action)).length,
    };
  });
  const maxActivity = Math.max(1, ...activityDays.map((day) => day.events));
  const protocols = ["TCP", "UDP", "ICMP"];
  const protocolCounts = protocols.map((protocol) =>
    rules.filter((rule) => rule.protocol === protocol).length,
  );
  const otherCount = rules.length - protocolCounts.reduce((sum, count) => sum + count, 0);
  const protocolPercentages = [...protocolCounts, otherCount].map((count) =>
    rules.length ? (count / rules.length) * 100 : 0,
  );
  const totalEvents = activityDays.reduce((sum, day) => sum + day.events, 0);
  return (
    <>
      <PageIntro
        eyebrow="SYSTEM OVERVIEW"
        title="Good morning, Shivam"
        subtitle="Here's what is happening across your simulated network policy."
        action={
          <NavLink className="primary-button" to="/rules/create">
            <Plus size={17} />
            Create rule
          </NavLink>
        }
      />
      <div className="stat-grid">
        <Stat
          label="Total rules"
          value={stats.total}
          detail="Across all policies"
          icon={Shield}
          tone="blue"
          to="/rules?filter=ALL"
        />
        <Stat
          label="Active rules"
          value={stats.active}
          detail="Enabled in simulation"
          icon={Zap}
          tone="green"
          to="/rules?filter=ENABLED"
        />
        <Stat
          label="Allow rules"
          value={stats.allow}
          detail="Marked to allow"
          icon={Check}
          tone="cyan"
          to="/rules?filter=ALLOW"
        />
        <Stat
          label="Deny rules"
          value={stats.deny}
          detail="Marked to deny"
          icon={ShieldAlert}
          tone="red"
          to="/rules?filter=DENY"
        />
        <Stat
          label="Risk signals"
          value={stats.risky}
          detail="Need attention"
          icon={AlertTriangle}
          tone="amber"
          to="/analysis"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel activity-panel">
          <PanelHead title="Policy activity" meta="Last 7 days" />
          <div className="chart-area">
            <div className="chart-y">
              <span>{maxActivity}</span>
              <span>{Math.round(maxActivity * 0.75)}</span>
              <span>{Math.round(maxActivity * 0.5)}</span>
              <span>{Math.round(maxActivity * 0.25)}</span>
              <span>0</span>
            </div>
            <div className="chart">
              <div className="chart-grid-lines" />
              {activityDays.map((day) => (
                <div className="bar-group" key={day.label}>
                  <div className="bar" style={{ height: `${day.events / maxActivity * 100}%` }} />
                  <div
                    className="bar-light"
                    style={{ height: `${day.changes / maxActivity * 100}%` }}
                  />
                  <small>{day.label}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-blue" />
              Audit events
            </span>
            <span>
              <i className="legend-muted" />
              Rule changes
            </span>
            <strong>
              {totalEvents} <small>events this week</small>
            </strong>
          </div>
        </section>
        <section className="panel distribution-panel">
          <PanelHead title="Protocol distribution" meta={`${rules.length} total`} />
          <div className="donut-wrap">
            <div className="donut">
              <div>
                <strong>{rules.length}</strong>
                <small>RULES</small>
              </div>
            </div>
            <div className="distribution-list">
              <Legend label="TCP" value={`${protocolCounts[0]} (${Math.round(protocolPercentages[0])}%)`} color="blue" />
              <Legend label="UDP" value={`${protocolCounts[1]} (${Math.round(protocolPercentages[1])}%)`} color="cyan" />
              <Legend label="ICMP" value={`${protocolCounts[2]} (${Math.round(protocolPercentages[2])}%)`} color="purple" />
              <Legend label="ANY / Other" value={`${otherCount} (${Math.round(protocolPercentages[3])}%)`} color="muted" />
            </div>
          </div>
        </section>
      </div>
      <section className="panel table-panel">
        <PanelHead
          title="Recent rules"
          meta={
            <NavLink to="/rules" className="text-link">
              View all rules <ArrowUp size={14} />
            </NavLink>
          }
        />
        <RuleTable rules={rules.slice(0, 4)} compact />
      </section>
      <section className="panel alerts-panel">
        <PanelHead
          title="Security signals"
          meta={
            <NavLink to="/analysis" className="text-link">
              Open analysis <ArrowUp size={14} />
            </NavLink>
          }
        />
        <div className="alert-list">
          <AlertRow
            icon={Copy}
            title={alerts.duplicates.length ? "Duplicate rule detected" : "No duplicate rules"}
            text={alerts.duplicates.length ? `${alerts.duplicates[0].id} duplicates a traffic definition` : "All traffic definitions are unique"}
            tone="amber"
            count={alerts.duplicates.length}
          />
          <AlertRow
            icon={FileWarning}
            title={alerts.risky.length ? "Broad policy requires review" : "No broad allow policies"}
            text={alerts.risky.length ? `${alerts.risky[0].rule.id} allows a broad traffic scope` : "No permissive broad-scope rules found"}
            tone="red"
            count={alerts.risky.length}
          />
          <AlertRow
            icon={Network}
            title={alerts.conflicts.length ? "Conflicting actions detected" : "No conflicts detected"}
            text={alerts.conflicts.length ? `${alerts.conflicts.length} overlapping traffic definitions have different actions` : "No matching traffic definitions have opposing actions"}
            tone={alerts.conflicts.length ? "red" : "green"}
            count={alerts.conflicts.length || "OK"}
          />
        </div>
      </section>
    </>
  );
}

function Rules({ rules, setRules, addLog, notify }) {
  const navigate = useNavigate();
  const location = useLocation();
  const importInput = useRef(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(() => {
    const requestedFilter = new URLSearchParams(location.search).get("filter");
    return ruleFilters.includes(requestedFilter) ? requestedFilter : "ALL";
  });
  const [view, setView] = useState("table");
  const [sort, setSort] = useState("priority-asc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const activeFilterCount = Number(filter !== "ALL") + Number(Boolean(query));
  const filtered = rules.filter(
    (rule) =>
      Object.values(rule)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "ALL" ||
        rule.status === filter ||
        rule.action === filter ||
        rule.protocol === filter),
  );
  const sorted = [...filtered].sort((first, second) => {
    if (sort === "priority-desc")
      return Number(second.priority) - Number(first.priority);
    if (sort === "newest")
      return new Date(second.created).getTime() - new Date(first.created).getTime();
    return Number(first.priority) - Number(second.priority);
  });
  const visibleIds = sorted.map((rule) => rule.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const toggleRuleSelection = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };
  const toggleVisibleSelection = () => {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };
  const changeStatus = (rule, status) => {
    setRules(
      rules.map((item) => (item.id === rule.id ? { ...item, status } : item)),
    );
    addLog(
      status === "ENABLED" ? "ENABLE_RULE" : "DISABLE_RULE",
      rule.id,
      `${status === "ENABLED" ? "Enabled" : "Disabled"} policy.`,
    );
    notify(`Rule ${status === "ENABLED" ? "enabled" : "disabled"}.`);
  };
  const duplicateRule = (rule) => {
    const duplicate = {
      ...rule,
      id: nextRuleId(rules),
      description: `${rule.description} (copy)`,
      created: new Date().toISOString(),
    };
    setRules([duplicate, ...rules]);
    addLog("DUPLICATE_RULE", duplicate.id, `Duplicated policy ${rule.id}.`);
    notify(`Created a copy of ${rule.id}.`);
  };
  const changeSelectedStatus = (status) => {
    const selected = new Set(selectedIds);
    const changedCount = rules.filter(
      (rule) => selected.has(rule.id) && rule.status !== status,
    ).length;
    if (!changedCount) {
      notify(`Selected rules are already ${status.toLowerCase()}.`);
      return;
    }
    setRules(
      rules.map((rule) =>
        selected.has(rule.id) ? { ...rule, status } : rule,
      ),
    );
    addLog(
      status === "ENABLED" ? "BULK_ENABLE_RULES" : "BULK_DISABLE_RULES",
      `${changedCount} rules`,
      `${status === "ENABLED" ? "Enabled" : "Disabled"} ${changedCount} selected policies.`,
    );
    notify(`${changedCount} rules ${status === "ENABLED" ? "enabled" : "disabled"}.`);
  };
  const deleteRule = () => {
    if (confirm.scope === "selected") {
      const selected = new Set(confirm.ids);
      setRules(rules.filter((rule) => !selected.has(rule.id)));
      setSelectedIds((current) =>
        current.filter((id) => !selected.has(id)),
      );
      addLog(
        "BULK_DELETE_RULES",
        `${confirm.ids.length} rules`,
        `Deleted ${confirm.ids.length} selected policies.`,
      );
      notify(`${confirm.ids.length} rules deleted.`);
    } else {
      setRules(rules.filter((rule) => rule.id !== confirm.rule.id));
      setSelectedIds((current) =>
        current.filter((id) => id !== confirm.rule.id),
      );
      addLog("DELETE_RULE", confirm.rule.id, "Deleted firewall policy.");
      notify("Firewall rule deleted successfully.");
    }
    setConfirm(null);
  };
  const exportRules = () => {
    const content = JSON.stringify(
      { exportedAt: new Date().toISOString(), rules },
      null,
      2,
    );
    downloadFile(content, "application/json", "firewall-rules.json");
    addLog("EXPORT_RULES", `${rules.length} rules`, "Exported firewall policies as JSON.");
    notify(`Exported ${rules.length} firewall rules.`);
  };
  const importRules = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const incoming = Array.isArray(data) ? data : data?.rules;
      if (!Array.isArray(incoming) || incoming.length === 0)
        throw new Error("The file must contain a non-empty rules array.");
      const invalidIndex = incoming.findIndex((rule) => !isValidImportedRule(rule));
      if (invalidIndex !== -1)
        throw new Error(`Rule ${invalidIndex + 1} has invalid or missing fields.`);
      const imported = [];
      for (const rule of incoming) {
        const id = nextRuleId([...rules, ...imported]);
        imported.push({
          ...rule,
          id,
          created:
            typeof rule.created === "string" && !Number.isNaN(Date.parse(rule.created))
              ? rule.created
              : new Date().toISOString(),
        });
      }
      setRules([...imported, ...rules]);
      addLog("IMPORT_RULES", `${imported.length} rules`, "Imported firewall policies from JSON.");
      notify(`Imported ${imported.length} firewall rules.`);
    } catch (error) {
      notify(
        `Import failed: ${error instanceof Error ? error.message : "Unable to read this file."}`,
        "error",
      );
    } finally {
      event.target.value = "";
    }
  };
  return (
    <>
      <PageIntro
        eyebrow="POLICY MANAGEMENT"
        title="Firewall Rules"
        subtitle="Review, organize, and update your browser-based policy set."
        action={
          <div className="rule-header-actions">
            <button className="secondary-button" onClick={exportRules}>
              <Download size={16} />
              Export JSON
            </button>
            <button
              className="secondary-button"
              onClick={() => importInput.current?.click()}
            >
              <Upload size={16} />
              Import JSON
            </button>
            <input
              ref={importInput}
              className="visually-hidden"
              type="file"
              accept=".json,application/json"
              onChange={importRules}
              aria-label="Import firewall rules from JSON"
            />
            <button
              className="primary-button"
              onClick={() => navigate("/rules/create")}
            >
              <Plus size={17} />
              Create rule
            </button>
          </div>
        }
      />
      <div className="rule-toolbar">
        <div className="search-input">
          <Search size={17} />
          <input
            placeholder="Search by IP, protocol, port, rule ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          className="secondary-button"
          onClick={() => {
            setQuery("");
            setFilter("ALL");
          }}
        >
          <Filter size={16} />
          Clear filters <span className="filter-count">{activeFilterCount}</span>
        </button>
        <label className="sort-control">
          <ArrowUpDown size={16} />
          <span className="visually-hidden">Sort rules</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort firewall rules"
          >
            <option value="priority-asc">Priority: low to high</option>
            <option value="priority-desc">Priority: high to low</option>
            <option value="newest">Recently created</option>
          </select>
        </label>
        <div className="view-toggle">
          <button
            className={view === "table" ? "selected" : ""}
            aria-label="Table view"
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            <List size={17} />
          </button>
          <button
            className={view === "grid" ? "selected" : ""}
            aria-label="Card view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Grid2X2 size={17} />
          </button>
        </div>
      </div>
      <div className="filter-tabs">
        {ruleFilters.map((item) => (
          <button
            className={filter === item ? "selected" : ""}
            onClick={() => setFilter(item)}
            key={item}
          >
            {item === "ALL"
              ? "All rules"
              : item[0] + item.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {selectedIds.length > 0 && (
        <div className="bulk-toolbar" role="region" aria-label="Bulk rule actions">
          <strong>{selectedIds.length} selected</strong>
          <button
            className="secondary-button"
            onClick={() => changeSelectedStatus("ENABLED")}
          >
            <Zap size={15} /> Enable
          </button>
          <button
            className="secondary-button"
            onClick={() => changeSelectedStatus("DISABLED")}
          >
            <Zap size={15} /> Disable
          </button>
          <button
            className="danger-button"
            onClick={() => setConfirm({ scope: "selected", ids: selectedIds })}
          >
            <X size={15} /> Delete
          </button>
          <button
            className="ghost-button"
            onClick={() => setSelectedIds([])}
          >
            Clear selection
          </button>
        </div>
      )}
      {view === "table" ? (
        <section className="panel table-panel full-table">
          <PanelHead
            title={`${sorted.length} polic${sorted.length === 1 ? "y" : "ies"}`}
            meta={
              <span className="muted-label">
                {rules.length} total policies
              </span>
            }
          />
          <RuleTable
            rules={sorted}
            selectedIds={selectedIds}
            allVisibleSelected={allVisibleSelected}
            onToggleAll={toggleVisibleSelection}
            onToggleSelection={toggleRuleSelection}
            onEdit={(rule) => navigate(`/rules/${rule.id}/edit`)}
            onDelete={(rule) => setConfirm({ scope: "single", rule })}
            onDuplicate={duplicateRule}
            onStatus={changeStatus}
          />
        </section>
      ) : (
        <div className="rule-cards">
          {sorted.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              selected={selectedIds.includes(rule.id)}
              onSelect={() => toggleRuleSelection(rule.id)}
              onEdit={() => navigate(`/rules/${rule.id}/edit`)}
              onDuplicate={() => duplicateRule(rule)}
              onDelete={() => setConfirm({ scope: "single", rule })}
              onStatus={(status) => changeStatus(rule, status)}
            />
          ))}
          {!sorted.length && (
            <EmptyState
              icon={Search}
              title="No matching rules"
              text="Try another search or clear the active filter."
            />
          )}
        </div>
      )}
      {confirm && (
        <ConfirmModal
          title={
            confirm.scope === "selected"
              ? `Delete ${confirm.ids.length} firewall rules?`
              : "Delete firewall rule?"
          }
          text={
            confirm.scope === "selected"
              ? "This permanently removes the selected policies from this browser."
              : `Are you sure you want to delete ${confirm.rule.id}? This action cannot be undone.`
          }
          onCancel={() => setConfirm(null)}
          onConfirm={deleteRule}
          confirmLabel={
            confirm.scope === "selected" ? "Delete selected" : "Delete rule"
          }
        />
      )}
    </>
  );
}

function RuleEditor({ rules, setRules, addLog, notify }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = rules.find((rule) => rule.id === id);
  const [form, setForm] = useState(
    editing || {
      source: "",
      destination: "",
      protocol: "TCP",
      sourcePort: "ANY",
      destinationPort: "",
      action: "ALLOW",
      priority: 10,
      status: "ENABLED",
      description: "",
    },
  );
  const [error, setError] = useState("");
  if (id && !editing) return <Navigate to="/rules" replace />;
  const update = (key, value) => setForm({ ...form, [key]: value });
  const submit = (e) => {
    e.preventDefault();
    if (
      !form.source.trim() ||
      !form.destination.trim() ||
      !form.destinationPort.trim() ||
      !form.description.trim()
    )
      return setError(
        "Complete all required fields before saving this policy.",
      );
    if (!isValidNetworkAddress(form.source) || !isValidNetworkAddress(form.destination))
      return setError("Enter a valid IPv4 or IPv6 address, CIDR range, or ANY.");
    if (!isValidPort(form.sourcePort) || !isValidPort(form.destinationPort))
      return setError("Ports must be ANY, a port from 0 to 65535, or a valid range.");
    if (!Number.isInteger(Number(form.priority)) || Number(form.priority) < 1)
      return setError("Priority must be a whole number greater than zero.");
    if (editing) {
      setRules(
        rules.map((rule) =>
          rule.id === id
            ? { ...form, id, updated: new Date().toISOString() }
            : rule,
        ),
      );
      addLog("UPDATE_RULE", id, "Updated firewall policy.");
      notify("Rule updated successfully.");
    } else {
      const newRule = {
        ...form,
        id: nextRuleId(rules),
        created: new Date().toISOString(),
      };
      setRules([newRule, ...rules]);
      addLog("CREATE_RULE", newRule.id, "Created firewall policy.");
      notify("Rule created successfully.");
    }
    navigate("/rules");
  };
  return (
    <>
      <PageIntro
        eyebrow={editing ? "EDIT POLICY" : "NEW POLICY"}
        title={editing ? `Edit ${id}` : "Create firewall rule"}
        subtitle="Define a simulated network policy for your environment"
      />
      <form className="editor-layout" onSubmit={submit}>
        <section className="panel form-panel">
          <div className="form-section-title">
            <span className="step-number">01</span>
            <div>
              <h3>Traffic scope</h3>
              <p>Define where this policy applies.</p>
            </div>
          </div>
          <div className="field-grid">
            <Field
              label="Source IP address"
              required
              value={form.source}
              onChange={(v) => update("source", v)}
              placeholder="192.168.1.10, CIDR, IPv6, or ANY"
            />
            <Field
              label="Destination IP address"
              required
              value={form.destination}
              onChange={(v) => update("destination", v)}
              placeholder="10.0.0.20, CIDR, IPv6, or ANY"
            />
            <SelectField
              label="Protocol"
              value={form.protocol}
              onChange={(v) => update("protocol", v)}
              options={["TCP", "UDP", "ICMP", "ANY"]}
            />
            <Field
              label="Source port"
              value={form.sourcePort}
              onChange={(v) => update("sourcePort", v)}
              placeholder="ANY or 8000-8100"
            />
            <Field
              label="Destination port"
              required
              value={form.destinationPort}
              onChange={(v) => update("destinationPort", v)}
              placeholder="443 or 8000-8100"
            />
          </div>
          <div className="form-section-title section-two">
            <span className="step-number">02</span>
            <div>
              <h3>Policy behavior</h3>
              <p>Choose how the traffic should be handled.</p>
            </div>
          </div>
          <div className="field-grid">
            <SelectField
              label="Action"
              value={form.action}
              onChange={(v) => update("action", v)}
              options={["ALLOW", "DENY"]}
            />
            <Field
              label="Priority"
              type="number"
              value={form.priority}
              onChange={(v) => update("priority", v)}
            />
            <SelectField
              label="Status"
              value={form.status}
              onChange={(v) => update("status", v)}
              options={["ENABLED", "DISABLED"]}
            />
            <div className="field full-field">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Explain the purpose of this policy..."
              />
            </div>
          </div>
          {error && (
            <div className="form-error">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}
          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/rules")}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                setForm({
                  source: "",
                  destination: "",
                  protocol: "TCP",
                  sourcePort: "ANY",
                  destinationPort: "",
                  action: "ALLOW",
                  priority: 10,
                  status: "ENABLED",
                  description: "",
                })
              }
            >
              Reset
            </button>
            <button className="primary-button" type="submit">
              {editing ? "Save changes" : "Create rule"} <ArrowUp size={16} />
            </button>
          </div>
        </section>
        <aside className="panel preview-panel">
          <div className="panel-kicker">
            <Eye size={15} /> LIVE PREVIEW
          </div>
          <h3>{form.action || "ALLOW"} traffic</h3>
          <p>
            {form.description || "Your policy description will appear here."}
          </p>
          <div className="preview-rule">
            <div>
              <small>FROM</small>
              <strong>{form.source || "Source IP"}</strong>
            </div>
            <ArrowUp size={16} />
            <div>
              <small>TO</small>
              <strong>{form.destination || "Destination IP"}</strong>
            </div>
          </div>
          <div className="preview-details">
            <span>
              Protocol <b>{form.protocol}</b>
            </span>
            <span>
              Port <b>{form.destinationPort || "ANY"}</b>
            </span>
            <span>
              Priority <b>{form.priority}</b>
            </span>
          </div>
          <div className="simulation-note">
            <Shield size={15} />
            <span>
              <strong>Simulation only</strong>This rule will be stored as
              application data and will not modify your system firewall.
            </span>
          </div>
        </aside>
      </form>
    </>
  );
}

function Analysis({ rules, notify, addLog }) {
  const result = analyze(rules);
  const [lastRun, setLastRun] = useState(new Date());
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const findings = [
    ...result.risky.map(({ rule, reasons, recommendation, level }, index) => ({
      key: `risky-${rule.id}-${index}`,
      icon: AlertTriangle,
      title: "Overly broad allow policy",
      text: `${rule.id} ${rule.status === "DISABLED" ? "is currently disabled but" : ""} allows traffic with broad scope: ${reasons.join(", ")}.`,
      recommendation,
      relatedRules: [rule],
      tone: "amber",
      level,
    })),
    ...result.duplicates.map(({ rule, original }, index) => ({
      key: `duplicate-${rule.id}-${original.id}-${index}`,
      icon: Copy,
      title: "Duplicate rule detected",
      text: `${rule.id} repeats ${original.id}'s traffic match and ${rule.action} action: ${describeRuleMatch(rule)}.`,
      recommendation: "Keep one definition or change the traffic match so each rule has a distinct purpose.",
      relatedRules: [original, rule],
      tone: "amber",
      level: "MEDIUM",
    })),
    ...result.conflicts.map(({ first, second }, index) => ({
      key: `conflict-${first.id}-${second.id}-${index}`,
      icon: Network,
      title: "Conflicting actions",
      text: `${first.id} (${first.action}, priority ${first.priority}) and ${second.id} (${second.action}, priority ${second.priority}) match the same traffic: ${describeRuleMatch(first)}.`,
      recommendation: "Review the intended action and priority, then remove or update the policy that should not apply.",
      relatedRules: [first, second],
      tone: "red",
      level: "HIGH",
    })),
    ...result.invalid.map(({ rule, errors }, index) => ({
      key: `invalid-${rule.id}-${index}`,
      icon: FileWarning,
      title: "Invalid rule data",
      text: `${rule.id}: ${errors.join("; ")}.`,
      recommendation: "Edit this rule and correct the listed fields before relying on the policy.",
      relatedRules: [rule],
      tone: "red",
      level: "HIGH",
    })),
  ].sort((first, second) =>
    first.level === second.level ? 0 : first.level === "HIGH" ? -1 : 1,
  );
  const visibleFindings =
    severityFilter === "ALL"
      ? findings
      : findings.filter((finding) => finding.level === severityFilter);
  const flaggedRules = new Set([
    ...result.risky.map(({ rule }) => rule),
    ...result.duplicates.map(({ rule }) => rule),
    ...result.invalid.map(({ rule }) => rule),
    ...result.conflicts.flatMap(({ first, second }) => [first, second]),
  ]);
  const healthScore = Math.round(
    100 * (1 - flaggedRules.size / Math.max(1, rules.length)),
  );
  return (
    <>
      <PageIntro
        eyebrow="SECURITY INTELLIGENCE"
        title="Rule Analysis"
        subtitle="Checks rule validity, duplicate traffic definitions, conflicting actions, and broad allow scopes."
        action={
          <button
            className="secondary-button"
            onClick={() => {
              const completedAt = new Date();
              setLastRun(completedAt);
              addLog(
                "ANALYZE_RULE",
                "SYSTEM",
                `Analyzed ${rules.length} policies and found ${findings.length} findings.`,
              );
              notify(
                `Analysis complete: ${findings.length} ${
                  findings.length === 1 ? "finding" : "findings"
                }.`,
              );
            }}
          >
            <RefreshCw size={16} />
            Run analysis
          </button>
        }
      />
      <div className="analysis-score panel">
        <div className="score-ring">
          <strong>{healthScore}</strong>
          <span>
            HEALTH
            <br />
            SCORE
          </span>
        </div>
        <div>
          <p className="eyebrow">POLICY HEALTH</p>
          <h3>
            {flaggedRules.size
              ? "Review recommended"
              : "Policy set looks healthy"}
          </h3>
          <p>
            Analysis completed {lastRun.toLocaleTimeString()} across {rules.length} simulated rules.
            Findings are guidance, not a full enterprise firewall engine.
          </p>
        </div>
        <div className="analysis-meta">
          <span>
            <Check size={15} />
            {rules.length - flaggedRules.size} rules passed
          </span>
          <span>
            <Clock3 size={15} />
            Last run {lastRun.toLocaleTimeString()}
          </span>
        </div>
      </div>
      <div className="analysis-cards">
        <AnalysisCard
          icon={Copy}
          label="Duplicate rules"
          value={result.duplicates.length}
          detail="Identical traffic definitions"
          tone="amber"
        />
        <AnalysisCard
          icon={Network}
          label="Conflicting rules"
          value={result.conflicts.length}
          detail="Same traffic, different action"
          tone="red"
        />
        <AnalysisCard
          icon={AlertTriangle}
          label="Risky rules"
          value={result.risky.length}
          detail="Broad or permissive scope"
          tone="amber"
        />
        <AnalysisCard
          icon={FileWarning}
          label="Invalid rules"
          value={result.invalid.length}
          detail={
            result.invalid.length === 0
              ? "No validation errors"
              : result.invalid.length === 1
                ? "Rule needs correction"
                : "Rules needing correction"
          }
          tone={result.invalid.length ? "red" : "green"}
        />
      </div>
      <section className="panel findings-panel">
        <PanelHead
          title="Findings & recommendations"
          meta={`${findings.length} ${findings.length === 1 ? "finding" : "findings"} · prioritized by severity`}
        />
        <div className="filter-tabs analysis-filters" aria-label="Filter findings by severity">
          {["ALL", "HIGH", "MEDIUM"].map((level) => (
            <button
              key={level}
              type="button"
              className={severityFilter === level ? "selected" : ""}
              aria-pressed={severityFilter === level}
              onClick={() => setSeverityFilter(level)}
            >
              {level === "ALL"
                ? `All (${findings.length})`
                : `${level} (${findings.filter((finding) => finding.level === level).length})`}
            </button>
          ))}
        </div>
        {visibleFindings.length ? (
          visibleFindings.map(({ key, icon: Icon, title, text, recommendation, relatedRules, tone, level }) => (
            <div className="finding" key={key}>
              <div className={`finding-icon ${tone}`}>
                <Icon size={18} />
              </div>
              <div className="finding-copy">
                <strong>{title}</strong>
                <p>{text}</p>
                <p className="finding-recommendation">
                  <strong>Recommended action:</strong> {recommendation}
                </p>
                <div className="finding-rules">
                  <span>Affected rules:</span>
                  {relatedRules.map((rule) => (
                    <NavLink
                      className="text-link"
                      to={`/rules/${encodeURIComponent(rule.id)}/edit`}
                      key={rule.id}
                    >
                      {rule.id}
                    </NavLink>
                  ))}
                </div>
              </div>
              <span className="risk-pill">{level}</span>
            </div>
          ))
        ) : (
          <EmptyState
            icon={severityFilter === "ALL" ? Check : Search}
            title={severityFilter === "ALL" ? "No findings" : `No ${severityFilter.toLowerCase()} severity findings`}
            text={
              severityFilter === "ALL"
                ? "Your simulated policy set has no current recommendations."
                : "Choose another severity filter to review the remaining findings."
            }
          />
        )}
      </section>
    </>
  );
}

function AuditLogs({ logs }) {
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const now = new Date();
  const monthLogs = logs.filter((log) => {
    const time = new Date(log.time);
    return (
      time.getFullYear() === now.getFullYear() &&
      time.getMonth() === now.getMonth()
    );
  });
  const successfulLogs = logs.filter(
    (log) => log.status === "SUCCESS" || log.status === "COMPLETED",
  ).length;
  const successRate = logs.length
    ? Math.round((successfulLogs / logs.length) * 100)
    : 0;
  const visible = logs.filter(
    (log) =>
      Object.values(log).join(" ").toLowerCase().includes(query.toLowerCase()) &&
      (actionFilter === "ALL" || log.action === actionFilter),
  );
  const exportLogs = () => {
    const columns = ["time", "action", "rule", "details", "status"];
    const escapeCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [
      columns.join(","),
      ...visible.map((log) => columns.map((column) => escapeCsv(log[column])).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "firewall-audit-log.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <PageIntro
        eyebrow="ACCOUNTABILITY"
        title="Audit Logs"
        subtitle="A transparent record of administrator activity across the console."
        action={
          <button className="secondary-button" onClick={exportLogs}>
            <Download size={16} />
            Export {visible.length} events
          </button>
        }
      />
      <div className="audit-summary">
        <Stat
          label="Events this month"
          value={monthLogs.length}
          detail="Recorded in this browser"
          icon={Activity}
          tone="blue"
        />
        <Stat
          label="Successful actions"
          value={`${successRate}%`}
          detail={`${successfulLogs} of ${logs.length} recorded events`}
          icon={Check}
          tone="green"
        />
        <Stat
          label="Active session"
          value="DEMO"
          detail="Browser-only session"
          icon={Clock3}
          tone="cyan"
        />
      </div>
      <section className="panel table-panel logs-panel">
        <div className="logs-toolbar">
          <div className="search-input">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, users, or rule IDs..."
            />
          </div>
          <label className="secondary-button">
            <SlidersHorizontal size={16} />
            <select
              aria-label="Filter audit log by action"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
            >
              <option value="ALL">All actions</option>
              {[...new Set(logs.map((log) => log.action))].sort().map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        </div>
        <div className="log-list">
          {visible.map((log, index) => (
            <div className="log-row" key={`${log.time}-${index}`}>
              <div className="log-icon">
                <Activity size={16} />
              </div>
              <div className="log-main">
                <div>
                  <strong>{log.action}</strong>
                  <span className="log-rule">{log.rule}</span>
                </div>
                <p>{log.details}</p>
              </div>
              <div className="log-user">
                <div className="avatar small">SB</div>
                <span>Shivam Bind</span>
              </div>
              <div className="log-time">
                {formatDate(log.time)}
                <small>
                  <span className="live-dot" />
                  {log.status}
                </small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Settings({ profile, saveProfile }) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [profileError, setProfileError] = useState("");
  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const submitProfile = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      setProfileError("Enter both a name and a valid email address.");
      return;
    }
    saveProfile({ name: trimmedName, email: trimmedEmail });
    setEditingProfile(false);
    setProfileError("");
  };
  const cancelProfileEdit = () => {
    setName(profile.name);
    setEmail(profile.email);
    setProfileError("");
    setEditingProfile(false);
  };
  return (
    <>
      <PageIntro
        eyebrow="SYSTEM PREFERENCES"
        title="Settings"
        subtitle="Manage your profile and understand the current application environment."
      />
      <div className="settings-layout">
        <section className="panel settings-panel">
          <PanelHead
            title="Profile"
            meta={
              <button
                className="text-link"
                onClick={() => setEditingProfile((current) => !current)}
                aria-expanded={editingProfile}
              >
                {editingProfile ? "Cancel editing" : "Edit profile"}
                <Edit3 size={14} />
              </button>
            }
          />
          <div className="settings-profile">
            <div className="avatar large">{initials}</div>
            <div>
              <h3>{profile.name}</h3>
              <p>{profile.email}</p>
              <span className="role-tag">ADMINISTRATOR</span>
            </div>
          </div>
          {editingProfile && (
            <form className="profile-edit-form" onSubmit={submitProfile}>
              <label>
                Display name
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
              <label>
                Email address
                <input
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              {profileError && (
                <div className="form-error" role="alert">
                  <AlertTriangle size={15} />
                  {profileError}
                </div>
              )}
              <div className="profile-edit-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={cancelProfileEdit}
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Save profile
                </button>
              </div>
            </form>
          )}
          <div className="setting-list">
            <div>
              <span>Role</span>
              <strong>Administrator</strong>
            </div>
            <div>
              <span>Last sign in</span>
              <strong>Demo session</strong>
            </div>
            <div>
              <span>Session security</span>
              <strong className="green-text">
                <LockKeyhole size={14} />
                Protected
              </strong>
            </div>
          </div>
        </section>
        <section className="panel settings-panel">
          <PanelHead title="Application status" />
          <div className="setting-list status-list">
            <div>
              <span>
                <Zap size={15} />
                Simulation mode
              </span>
              <strong className="green-text">
                <span className="live-dot" />
                ON
              </strong>
            </div>
            <div>
              <span>
                <Server size={15} />
                API status
              </span>
              <strong>
                No API connection
              </strong>
            </div>
            <div>
              <span>
                <Database size={15} />
                Database
              </span>
              <strong className="green-text">
                <span className="live-dot" />
                Local storage
              </strong>
            </div>
          </div>
          <div className="simulation-note">
            <Shield size={15} />
            <span>
              <strong>Academic simulation</strong>This dashboard manages
              application data only. It never runs iptables, netsh, ufw, or
              operating-system firewall commands.
            </span>
          </div>
        </section>
        <section className="panel settings-panel system-panel">
          <PanelHead title="System information" />
          <div className="system-grid">
            <span>
              Frontend<strong>React + Vite</strong>
            </span>
            <span>
              Backend<strong>Not connected (simulation)</strong>
            </span>
            <span>
              Database<strong>Browser localStorage</strong>
            </span>
            <span>
              Environment<strong>Local browser simulation</strong>
            </span>
          </div>
        </section>
      </div>
    </>
  );
}

function Brand({ large = false }) {
  return (
    <div className={`brand ${large ? "brand-large" : ""}`}>
      <div className="brand-mark">
        <ShieldCheck size={large ? 25 : 20} />
      </div>
      <div>
        <strong>SENTINEL</strong>
        <span>Firewall Control</span>
      </div>
    </div>
  );
}
function PageIntro({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}
function PanelHead({ title, meta }) {
  return (
    <div className="panel-head">
      <h3>{title}</h3>
      <div>{meta}</div>
    </div>
  );
}
function Stat({ label, value, detail, icon: Icon, tone, to }) {
  const content = (
    <>
      <div className={`stat-icon ${tone}`}>
        <Icon size={17} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </>
  );
  return to ? (
    <NavLink
      className="stat-card stat-card-link"
      to={to}
      aria-label={`${label}: ${value}. ${detail}`}
    >
      {content}
    </NavLink>
  ) : (
    <div className="stat-card">{content}</div>
  );
}
function Legend({ label, value, color }) {
  return (
    <div className="legend-row">
      <span>
        <i className={`legend-${color}`} />
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}
function AlertRow({ icon: Icon, title, text, tone, count }) {
  return (
    <div className="alert-row">
      <div className={`alert-icon ${tone}`}>
        <Icon size={16} />
      </div>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <b className={tone}>{count}</b>
    </div>
  );
}
function StatusBadge({ value }) {
  return (
    <span className={`status-badge ${value.toLowerCase()}`}>
      <span />
      {value}
    </span>
  );
}
function RuleTable({
  rules,
  compact = false,
  selectedIds = [],
  allVisibleSelected = false,
  onToggleAll,
  onToggleSelection,
  onEdit,
  onDelete,
  onDuplicate,
  onStatus,
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {!compact && (
              <th>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={onToggleAll}
                  aria-label="Select all visible firewall rules"
                />
              </th>
            )}
            <th>Rule ID</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Protocol</th>
            {!compact && <th>Source port</th>}
            <th>Destination port</th>
            <th>Action</th>
            <th>Priority</th>
            <th>Status</th>
            {!compact && <th>Description</th>}
            <th>Created</th>
            {!compact && <th />}
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              {!compact && (
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(rule.id)}
                    onChange={() => onToggleSelection(rule.id)}
                    aria-label={`Select ${rule.id}`}
                  />
                </td>
              )}
              <td>
                <strong className="rule-id">{rule.id}</strong>
              </td>
              <td className="mono">{rule.source}</td>
              <td className="mono">{rule.destination}</td>
              <td>
                <span className="protocol">{rule.protocol}</span>
              </td>
              {!compact && <td className="mono">{rule.sourcePort}</td>}
              <td className="mono">{rule.destinationPort}</td>
              <td>
                <span className={`action-badge ${rule.action.toLowerCase()}`}>
                  {rule.action}
                </span>
              </td>
              <td>
                <span className="priority">P{rule.priority}</span>
              </td>
              <td>
                <StatusBadge value={rule.status} />
              </td>
              {!compact && (
                <td className="description-cell">{rule.description}</td>
              )}
              <td className="date-cell">{formatDate(rule.created)}</td>
              {!compact && (
                <td>
                  <div className="row-actions">
                    <button
                      onClick={() => onEdit(rule)}
                      aria-label={`Edit ${rule.id}`}
                      title="Edit rule"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() =>
                        onStatus(
                          rule,
                          rule.status === "ENABLED" ? "DISABLED" : "ENABLED",
                        )
                      }
                      aria-label={`${rule.status === "ENABLED" ? "Disable" : "Enable"} ${rule.id}`}
                      title={rule.status === "ENABLED" ? "Disable rule" : "Enable rule"}
                    >
                      <Zap size={15} />
                    </button>
                    <button
                      onClick={() => onDuplicate(rule)}
                      aria-label={`Duplicate ${rule.id}`}
                      title="Duplicate rule"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(rule)}
                      aria-label={`Delete ${rule.id}`}
                      title="Delete rule"
                    >
                      <span className="danger-icon">×</span>
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!rules.length && (
        <EmptyState
          icon={Search}
          title="No matching rules"
          text="Try another search or clear the active filter."
        />
      )}
    </div>
  );
}
function RuleCard({
  rule,
  selected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onStatus,
}) {
  return (
    <div className="rule-card">
      <div className="rule-card-head">
        <strong>{rule.id}</strong>
        <StatusBadge value={rule.status} />
      </div>
      <h3>
        {rule.source} <ArrowUp size={15} /> {rule.destination}
      </h3>
      <p>{rule.description}</p>
      <div className="rule-card-meta">
        <span>{rule.protocol}</span>
        <span>{rule.sourcePort} → {rule.destinationPort}</span>
        <span className={`action-badge ${rule.action.toLowerCase()}`}>
          {rule.action}
        </span>
      </div>
      <label className="rule-card-select">
        <input type="checkbox" checked={selected} onChange={onSelect} />
        Select rule
      </label>
      <div className="rule-card-actions">
        <button className="secondary-button" onClick={onEdit}>
          <Edit3 size={14} /> Edit
        </button>
        <button
          className="secondary-button"
          onClick={() => onStatus(rule.status === "ENABLED" ? "DISABLED" : "ENABLED")}
        >
          <Zap size={14} /> {rule.status === "ENABLED" ? "Disable" : "Enable"}
        </button>
        <button className="icon-button" onClick={onDuplicate} aria-label={`Duplicate ${rule.id}`}>
          <Copy size={15} />
        </button>
        <button className="icon-button" onClick={onDelete} aria-label={`Delete ${rule.id}`}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div className="field">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
function SelectField({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
function AnalysisCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className="analysis-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={17} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      <Icon size={22} />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
function ConfirmModal({
  title,
  text,
  onCancel,
  onConfirm,
  confirmLabel = "Delete rule",
}) {
  return (
    <div className="modal-backdrop">
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="modal-icon">
          <AlertTriangle size={22} />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p>{text}</p>
        <div>
          <button className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="danger-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
function Toast({ message, type = "success", onClose }) {
  return (
    <div className={`toast ${type}`} role="status" aria-live="polite">
      {type === "error" ? <AlertTriangle size={16} /> : <Check size={16} />}
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}
function downloadFile(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function analyze(rules) {
  const firstBySignature = new Map();
  const duplicates = [];
  rules.forEach((rule) => {
    const signature = ruleSignature(rule, true);
    const original = firstBySignature.get(signature);
    if (original) duplicates.push({ rule, original });
    else firstBySignature.set(signature, rule);
  });
  const risky = rules
    .filter((rule) => rule.action === "ALLOW")
    .map((rule) => {
      const reasons = [];
      if (isBroadNetwork(rule.source))
        reasons.push(`source ${rule.source} is broad`);
      if (isBroadNetwork(rule.destination))
        reasons.push(`destination ${rule.destination} is broad`);
      if (rule.protocol === "ANY") reasons.push("any protocol is allowed");
      if (
        ["TCP", "UDP", "ANY"].includes(rule.protocol) &&
        String(rule.destinationPort).toUpperCase() === "ANY"
      )
        reasons.push("any destination port is allowed");
      if (!reasons.length) return null;
      return {
        rule,
        reasons,
        recommendation:
          "Limit source and destination networks, choose only required protocols, and specify the narrowest destination port range.",
        level: rule.status === "ENABLED" ? "HIGH" : "MEDIUM",
      };
    })
    .filter(Boolean);
  const conflicts = [];
  rules.forEach((rule, index) =>
    rules.slice(index + 1).forEach((other) => {
      if (
        ruleSignature(rule) === ruleSignature(other) &&
        rule.action !== other.action
      )
        conflicts.push({ first: rule, second: other });
    }),
  );
  const seenIds = new Set();
  const invalid = rules
    .map((rule) => {
      const errors = [];
      if (!isValidNetworkAddress(rule.source))
        errors.push(`source address or CIDR '${String(rule.source)}' is invalid`);
      if (!isValidNetworkAddress(rule.destination))
        errors.push(`destination address or CIDR '${String(rule.destination)}' is invalid`);
      if (!isValidPort(rule.sourcePort))
        errors.push(`source port or range '${String(rule.sourcePort)}' is invalid`);
      if (!isValidPort(rule.destinationPort))
        errors.push(`destination port or range '${String(rule.destinationPort)}' is invalid`);
      if (!["TCP", "UDP", "ICMP", "ANY"].includes(rule.protocol))
        errors.push(`protocol '${String(rule.protocol)}' is missing or unsupported`);
      if (!["ALLOW", "DENY"].includes(rule.action))
        errors.push(`action '${String(rule.action)}' must be ALLOW or DENY`);
      if (!["ENABLED", "DISABLED"].includes(rule.status))
        errors.push(`status '${String(rule.status)}' must be ENABLED or DISABLED`);
      if (!Number.isInteger(Number(rule.priority)) || Number(rule.priority) < 1)
        errors.push(`priority '${String(rule.priority)}' must be a positive whole number`);
      if (typeof rule.description !== "string" || !rule.description.trim())
        errors.push("description is required");
      if (typeof rule.id !== "string" || !rule.id.trim()) {
        errors.push("rule ID is missing");
      } else if (seenIds.has(rule.id)) {
        errors.push(`rule ID ${rule.id} is duplicated`);
      } else {
        seenIds.add(rule.id);
      }
      return errors.length ? { rule, errors } : null;
    })
    .filter(Boolean);
  return { duplicates, risky, conflicts, invalid };
}
function ruleSignature(rule, includeAction = false) {
  const fields = [
    rule.source,
    rule.destination,
    rule.protocol,
    rule.sourcePort,
    rule.destinationPort,
  ];
  if (includeAction) fields.push(rule.action);
  return fields
    .map((value) => String(value ?? "").trim().toUpperCase())
    .join("|");
}
function describeRuleMatch(rule) {
  return `source ${rule.source} -> destination ${rule.destination}; ${rule.protocol}; source port ${rule.sourcePort}; destination port ${rule.destinationPort}`;
}
function isBroadNetwork(value) {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "ANY") return true;
  if (!isValidNetworkAddress(normalized) || !normalized.includes("/"))
    return false;
  const [address, prefix] = normalized.split("/");
  const prefixLength = Number(prefix);
  return address.includes(":") ? prefixLength <= 32 : prefixLength <= 8;
}
function isValidPort(value) {
  if (String(value).toUpperCase() === "ANY") return true;
  const match = /^(\d+)(?:-(\d+))?$/.exec(String(value));
  if (!match) return false;
  const start = Number(match[1]);
  const end = match[2] === undefined ? start : Number(match[2]);
  return start >= 0 && end <= 65535 && start <= end;
}
function isValidNetworkAddress(value) {
  if (String(value).toUpperCase() === "ANY") return true;
  const [address, prefix, ...extra] = String(value).split("/");
  if (extra.length) return false;
  if (address.includes(":")) {
    if (
      prefix !== undefined &&
      (!/^\d{1,3}$/.test(prefix) || Number(prefix) > 128)
    )
      return false;
    try {
      return new URL(`http://[${address}]/`).hostname.startsWith("[");
    } catch {
      return false;
    }
  }
  const octets = address.split(".");
  if (
    octets.length !== 4 ||
    octets.some((octet) => !/^\d{1,3}$/.test(octet) || Number(octet) > 255)
  ) return false;
  return prefix === undefined || (/^\d{1,2}$/.test(prefix) && Number(prefix) <= 32);
}
function isValidImportedRule(rule) {
  return (
    rule !== null &&
    typeof rule === "object" &&
    typeof rule.source === "string" &&
    isValidNetworkAddress(rule.source) &&
    typeof rule.destination === "string" &&
    isValidNetworkAddress(rule.destination) &&
    ["TCP", "UDP", "ICMP", "ANY"].includes(rule.protocol) &&
    typeof rule.sourcePort === "string" &&
    isValidPort(rule.sourcePort) &&
    typeof rule.destinationPort === "string" &&
    isValidPort(rule.destinationPort) &&
    ["ALLOW", "DENY"].includes(rule.action) &&
    Number.isInteger(Number(rule.priority)) &&
    Number(rule.priority) > 0 &&
    ["ENABLED", "DISABLED"].includes(rule.status) &&
    typeof rule.description === "string" &&
    Boolean(rule.description.trim())
  );
}
function nextRuleId(rules) {
  const highestId = rules.reduce((highest, rule) => {
    const match = /^FW-(\d+)$/.exec(rule.id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `FW-${highestId + 1}`;
}
function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default App;
