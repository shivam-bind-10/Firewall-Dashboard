import { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  Globe,
  Home,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  Radio,
  Server,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";


export function WindowsProfilesCards({ profiles, isAdmin, onToggleProfile, onShowAdminHelp, loading }) {
  if (!profiles || profiles.length === 0) return null;

  const getProfileIcon = (name) => {
    switch (name.toLowerCase()) {
      case "domain":
        return <Server size={18} />;
      case "private":
        return <Home size={18} />;
      case "public":
        return <Globe size={18} />;
      default:
        return <Shield size={18} />;
    }
  };

  return (
    <div className="wf-profiles-grid">
      {profiles.map((p) => (
        <div key={p.name} className="wf-profile-card">
          <div className="wf-profile-header">
            <div className="wf-profile-title">
              {getProfileIcon(p.name)}
              <div>
                <h4>{p.name} Network</h4>
                <small style={{ color: "var(--muted)", fontSize: "10px" }}>
                  Windows Profile {p.profileType}
                </small>
              </div>
            </div>
            <span
              className={`status-badge ${p.enabled ? "enabled" : "disabled"}`}
            >
              <span /> {p.enabled ? "ACTIVE" : "OFF"}
            </span>
          </div>

          <div className="wf-profile-details">
            <div className="wf-profile-stat">
              <span>Inbound Default</span>
              <strong
                style={{
                  color: p.inboundAction === "Block" ? "var(--red)" : "var(--green)",
                }}
              >
                {p.inboundAction.toUpperCase()}
              </strong>
            </div>
            <div className="wf-profile-stat">
              <span>Outbound Default</span>
              <strong
                style={{
                  color: p.outboundAction === "Block" ? "var(--red)" : "var(--green)",
                }}
              >
                {p.outboundAction.toUpperCase()}
              </strong>
            </div>
          </div>

          <div className="wf-profile-toggle">
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
              Firewall State
            </span>
            <label
              className="wf-switch"
              title={isAdmin ? "Toggle Profile State" : "Administrator required to change"}
            >
              <input
                type="checkbox"
                checked={p.enabled}
                disabled={loading}
                onChange={() => {
                  if (!isAdmin) {
                    onShowAdminHelp();
                  } else {
                    onToggleProfile(p.name, !p.enabled);
                  }
                }}
              />
              <span className="wf-slider" />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WindowsRulesManager({
  rules,
  loading,
  isAdmin,
  onRefresh,
  onToggleRule,
  onDeleteRule,
  onOpenCreateModal,
  onShowAdminHelp,
}) {
  const [query, setQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [protoFilter, setProtoFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedRule, setSelectedRule] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const pageSize = 50;

  // Filter rules
  const filtered = rules.filter((r) => {
    if (directionFilter !== "ALL" && r.direction !== directionFilter) return false;
    if (actionFilter !== "ALL" && r.action !== actionFilter) return false;
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (protoFilter !== "ALL" && r.protocol !== protoFilter) return false;

    if (query.trim()) {
      const q = query.toLowerCase();
      const matchName = r.name && r.name.toLowerCase().includes(q);
      const matchApp = r.application && r.application.toLowerCase().includes(q);
      const matchPort = r.localPorts && r.localPorts.toLowerCase().includes(q);
      const matchService = r.serviceName && r.serviceName.toLowerCase().includes(q);
      if (!matchName && !matchApp && !matchPort && !matchService) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentRules = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, directionFilter, actionFilter, statusFilter, protoFilter]);

  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">WINDOWS DEFENDER FIREWALL (LIVE)</p>
          <h1>Windows Firewall Rules</h1>
          <p>
            Browsing {filtered.length} of {rules.length} active OS rules on this machine.
          </p>
        </div>
        <div className="rule-header-actions">
          <button
            className="secondary-button"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            {loading ? "Refreshing..." : "Refresh OS Rules"}
          </button>
          <button className="primary-button" onClick={onOpenCreateModal}>
            <Plus size={16} />
            Add Firewall Rule
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rule-toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            placeholder="Search rules by name, port, executable (.exe), or service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="icon-button"
              onClick={() => setQuery("")}
              style={{ padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ flexWrap: "wrap", gap: "6px" }}>
        <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center", marginRight: "4px" }}>
          Direction:
        </span>
        {["ALL", "INBOUND", "OUTBOUND"].map((d) => (
          <button
            key={d}
            className={directionFilter === d ? "selected" : ""}
            onClick={() => setDirectionFilter(d)}
          >
            {d}
          </button>
        ))}

        <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center", margin: "0 4px 0 12px" }}>
          Action:
        </span>
        {["ALL", "ALLOW", "BLOCK"].map((a) => (
          <button
            key={a}
            className={actionFilter === a ? "selected" : ""}
            onClick={() => setActionFilter(a)}
          >
            {a}
          </button>
        ))}

        <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center", margin: "0 4px 0 12px" }}>
          Status:
        </span>
        {["ALL", "ENABLED", "DISABLED"].map((s) => (
          <button
            key={s}
            className={statusFilter === s ? "selected" : ""}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}

        <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center", margin: "0 4px 0 12px" }}>
          Protocol:
        </span>
        {["ALL", "TCP", "UDP", "ANY"].map((p) => (
          <button
            key={p}
            className={protoFilter === p ? "selected" : ""}
            onClick={() => setProtoFilter(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Rules Table */}
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>STATE</th>
                <th style={{ width: "85px" }}>DIR</th>
                <th style={{ width: "75px" }}>ACTION</th>
                <th>RULE NAME & APPLICATION</th>
                <th style={{ width: "80px" }}>PROTO</th>
                <th style={{ width: "90px" }}>PORT</th>
                <th style={{ width: "90px" }}>PROFILES</th>
                <th style={{ width: "70px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentRules.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state">
                      <Shield size={28} />
                      <strong>No matching Windows Firewall rules found</strong>
                      <p>Try adjusting your search query or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRules.map((rule, idx) => (
                  <tr key={`${rule.name}-${idx}`}>
                    <td>
                      <label
                        className="wf-switch"
                        title={
                          isAdmin
                            ? `Click to ${rule.status === "ENABLED" ? "disable" : "enable"}`
                            : "Administrator required to toggle rules"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={rule.status === "ENABLED"}
                          onChange={() => {
                            if (!isAdmin) {
                              onShowAdminHelp();
                            } else {
                              onToggleRule(rule.name, rule.status !== "ENABLED");
                            }
                          }}
                        />
                        <span className="wf-slider" />
                      </label>
                    </td>
                    <td>
                      <span
                        className={`dir-badge ${
                          rule.direction === "INBOUND" ? "inbound" : "outbound"
                        }`}
                      >
                        {rule.direction === "INBOUND" ? (
                          <ArrowDownLeft size={11} />
                        ) : (
                          <ArrowUpRight size={11} />
                        )}
                        {rule.direction}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`action-badge ${
                          rule.action === "ALLOW" ? "allow" : "deny"
                        }`}
                      >
                        {rule.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>
                        {rule.name}
                      </div>
                      {rule.application && (
                        <div
                          className="wf-app-badge"
                          title={rule.application}
                        >
                          {rule.application.split("\\").pop()}
                        </div>
                      )}
                      {rule.serviceName && (
                        <span
                          style={{
                            fontSize: "9px",
                            color: "var(--cyan)",
                            marginLeft: "6px",
                            fontFamily: "DM Mono",
                          }}
                        >
                          [svc: {rule.serviceName}]
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="protocol">{rule.protocol}</span>
                    </td>
                    <td className="mono">
                      {rule.localPorts && rule.localPorts !== "*"
                        ? rule.localPorts
                        : "Any"}
                    </td>
                    <td style={{ fontSize: "10px", color: "var(--muted)" }}>
                      {rule.profiles === 2147483647 || rule.profiles === 7
                        ? "All"
                        : rule.profiles === 1
                        ? "Domain"
                        : rule.profiles === 2
                        ? "Private"
                        : rule.profiles === 4
                        ? "Public"
                        : `${rule.profiles}`}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setSelectedRule(rule)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (!isAdmin) {
                              onShowAdminHelp();
                            } else {
                              setRuleToDelete(rule);
                            }
                          }}
                          title="Delete Rule"
                          style={{ color: "var(--red)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="wf-pagination">
            <span>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length} rules
            </span>
            <div className="wf-page-buttons">
              <button
                className="wf-page-btn"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span
                style={{
                  alignSelf: "center",
                  fontFamily: "DM Mono",
                  padding: "0 8px",
                }}
              >
                Page {page} of {totalPages}
              </span>
              <button
                className="wf-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Rule Details Drawer */}
      {selectedRule && (
        <div
          className="wf-drawer-backdrop"
          onClick={() => setSelectedRule(null)}
        >
          <div className="wf-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="wf-drawer-head">
              <h3>Firewall Rule Details</h3>
              <button
                className="icon-button"
                onClick={() => setSelectedRule(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="wf-detail-row">
              <label>Rule Name</label>
              <strong style={{ fontSize: "14px", color: "var(--text)" }}>
                {selectedRule.name}
              </strong>
            </div>

            <div className="wf-detail-row">
              <label>Status</label>
              <span
                className={`status-badge ${
                  selectedRule.status === "ENABLED" ? "enabled" : "disabled"
                }`}
              >
                <span /> {selectedRule.status}
              </span>
            </div>

            <div className="wf-detail-row">
              <label>Direction & Action</label>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <span
                  className={`dir-badge ${
                    selectedRule.direction === "INBOUND" ? "inbound" : "outbound"
                  }`}
                >
                  {selectedRule.direction}
                </span>
                <span
                  className={`action-badge ${
                    selectedRule.action === "ALLOW" ? "allow" : "deny"
                  }`}
                >
                  {selectedRule.action}
                </span>
              </div>
            </div>

            {selectedRule.description && (
              <div className="wf-detail-row">
                <label>Description</label>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {selectedRule.description}
                </span>
              </div>
            )}

            <div className="wf-detail-row">
              <label>Application (.exe)</label>
              <span>{selectedRule.application || "All applications (*)"}</span>
            </div>

            {selectedRule.serviceName && (
              <div className="wf-detail-row">
                <label>Windows Service</label>
                <span className="mono">{selectedRule.serviceName}</span>
              </div>
            )}

            <div className="wf-detail-row">
              <label>Protocol & Local Ports</label>
              <span className="mono">
                {selectedRule.protocol} : {selectedRule.localPorts || "Any"}
              </span>
            </div>

            <div className="wf-detail-row">
              <label>Remote Ports</label>
              <span className="mono">{selectedRule.remotePorts || "Any"}</span>
            </div>

            <div className="wf-detail-row">
              <label>Local Addresses</label>
              <span className="mono">
                {selectedRule.localAddresses || "Any (*)"}
              </span>
            </div>

            <div className="wf-detail-row">
              <label>Remote Addresses</label>
              <span className="mono">
                {selectedRule.remoteAddresses || "Any (*)"}
              </span>
            </div>

            <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
              <button
                className="secondary-button"
                style={{ flex: 1 }}
                onClick={() => setSelectedRule(null)}
              >
                Close
              </button>
              <button
                className="primary-button"
                style={{ flex: 1 }}
                onClick={() => {
                  if (!isAdmin) {
                    onShowAdminHelp();
                  } else {
                    onToggleRule(
                      selectedRule.name,
                      selectedRule.status !== "ENABLED"
                    );
                    setSelectedRule({
                      ...selectedRule,
                      status:
                        selectedRule.status === "ENABLED"
                          ? "DISABLED"
                          : "ENABLED",
                    });
                  }
                }}
              >
                {selectedRule.status === "ENABLED" ? "Disable Rule" : "Enable Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {ruleToDelete && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <div className="modal-icon">
              <Trash2 size={22} />
            </div>
            <h2>Delete Firewall Rule?</h2>
            <p>
              Are you sure you want to permanently delete rule:
              <br />
              <strong style={{ color: "var(--text)" }}>
                {ruleToDelete.name}
              </strong>
            </p>
            <div>
              <button
                className="secondary-button"
                onClick={() => setRuleToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="danger-button"
                onClick={() => {
                  onDeleteRule(ruleToDelete.name);
                  setRuleToDelete(null);
                }}
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function WindowsListeningPorts({
  listening,
  loading,
  onRefresh,
  onCreateForPort,
}) {
  const [query, setQuery] = useState("");

  const filtered = listening.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.port.toString().includes(q) ||
      (item.processName && item.processName.toLowerCase().includes(q)) ||
      (item.address && item.address.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">ACTIVE NETWORK CONNECTIONS</p>
          <h1>Listening Ports & Apps</h1>
          <p>
            Real-time inspection of applications currently listening on network ports on this computer.
          </p>
        </div>
        <div className="rule-header-actions">
          <button
            className="secondary-button"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            {loading ? "Scanning..." : "Rescan Ports"}
          </button>
        </div>
      </div>

      <div className="rule-toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            placeholder="Search by port number, process name (e.g. Discord, node)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="panel table-panel">
        <div className="table-scroll">
          <table className="wf-listening-table">
            <thead>
              <tr>
                <th style={{ width: "90px" }}>PORT</th>
                <th style={{ width: "80px" }}>PROTO</th>
                <th style={{ width: "120px" }}>LOCAL ADDRESS</th>
                <th style={{ width: "80px" }}>PID</th>
                <th>PROCESS & PATH</th>
                <th style={{ width: "140px", textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state">
                      <Radio size={28} />
                      <strong>No listening ports found matching criteria</strong>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={`${item.port}-${item.pid}-${idx}`}>
                    <td>
                      <strong
                        style={{
                          fontSize: "14px",
                          fontFamily: "DM Mono",
                          color: "var(--cyan)",
                        }}
                      >
                        {item.port}
                      </strong>
                    </td>
                    <td>
                      <span className="protocol">{item.protocol}</span>
                    </td>
                    <td className="mono">{item.address}</td>
                    <td className="mono" style={{ color: "var(--muted)" }}>
                      {item.pid}
                    </td>
                    <td>
                      <div className="wf-proc-name">
                        {item.processName || "System / Protected"}
                      </div>
                      {item.processPath && (
                        <div className="wf-proc-path" title={item.processPath}>
                          {item.processPath}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="primary-button"
                        style={{ padding: "6px 10px", fontSize: "10px" }}
                        onClick={() => onCreateForPort(item)}
                      >
                        <Plus size={12} /> Create Rule
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export function QuickRuleModal({ isOpen, onClose, onSubmit, initialData }) {
  const [name, setName] = useState("");
  const [direction, setDirection] = useState("in");
  const [action, setAction] = useState("allow");
  const [ruleType, setRuleType] = useState("port"); // 'port' or 'program'
  const [protocol, setProtocol] = useState("TCP");
  const [port, setPort] = useState("");
  const [program, setProgram] = useState("");
  const [profile, setProfile] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      if (initialData.port) {
        setName(`Allow Port ${initialData.port} (${initialData.processName || "App"})`);
        setPort(String(initialData.port));
        setRuleType("port");
      }
      if (initialData.processPath) {
        setProgram(initialData.processPath);
      }
    } else {
      setName("");
      setPort("");
      setProgram("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Rule name is required.");
    if (ruleType === "port" && !port.trim()) return setError("Port number is required.");
    if (ruleType === "program" && !program.trim()) return setError("Program (.exe) path is required.");

    setError("");
    onSubmit({
      name: name.trim(),
      direction,
      action,
      protocol: ruleType === "port" ? protocol : "ANY",
      port: ruleType === "port" ? port.trim() : "",
      program: ruleType === "program" ? program.trim() : "",
      profile,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="wf-admin-modal"
        style={{ maxWidth: "560px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "17px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={20} style={{ color: "var(--cyan)" }} />
            Add Windows Firewall Rule
          </h3>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: "16px" }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label>Rule Name</label>
            <input
              placeholder="e.g. Allow Web Server Port 8080"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label>Direction</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value)}>
                <option value="in">Inbound (Incoming Traffic)</option>
                <option value="out">Outbound (Outgoing Traffic)</option>
              </select>
            </div>
            <div>
              <label>Action</label>
              <select value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="allow">Allow Connection</option>
                <option value="block">Block Connection</option>
              </select>
            </div>
          </div>

          <div>
            <label>Rule Target Type</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                className={`secondary-button ${ruleType === "port" ? "primary-button" : ""}`}
                style={{ flex: 1 }}
                onClick={() => setRuleType("port")}
              >
                Specific Port
              </button>
              <button
                type="button"
                className={`secondary-button ${ruleType === "program" ? "primary-button" : ""}`}
                style={{ flex: 1 }}
                onClick={() => setRuleType("program")}
              >
                Application Executable (.exe)
              </button>
            </div>
          </div>

          {ruleType === "port" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
              <div>
                <label>Protocol</label>
                <select value={protocol} onChange={(e) => setProtocol(e.target.value)}>
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                </select>
              </div>
              <div>
                <label>Port Number</label>
                <input
                  placeholder="e.g. 8080 or 3000-3005"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div>
              <label>Program Executable Path</label>
              <input
                placeholder="e.g. C:\Program Files\App\app.exe"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
            </div>
          )}

          <div>
            <label>Apply to Network Profiles</label>
            <select value={profile} onChange={(e) => setProfile(e.target.value)}>
              <option value="ALL">All Network Profiles</option>
              <option value="Private">Private Network Only</option>
              <option value="Public">Public Network Only</option>
              <option value="Domain">Domain Network Only</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Create Rule in Windows Firewall
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ElevationHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="wf-admin-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--amber)" }}>
            <ShieldAlert size={22} />
            Administrator Rights Required
          </h3>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ color: "var(--muted)", fontSize: "12px", lineHeight: "1.6", marginTop: "14px" }}>
          Windows Defender Firewall requires Administrator permissions to <strong>create, modify, toggle, or delete</strong> rules.
          Currently, the backend server is running in <strong>read-only monitoring mode</strong>.
        </p>

        <h4 style={{ margin: "16px 0 6px", fontSize: "12px", color: "var(--text)" }}>
          How to enable full write access:
        </h4>
        <ol style={{ fontSize: "11px", color: "#a8bbc0", lineHeight: "1.8", paddingLeft: "20px", margin: 0 }}>
          <li>
            Go to the project folder:
            <br />
            <code style={{ color: "var(--cyan)", fontSize: "10px" }}>
              c:\Users\manuc\Desktop\FDS_shivam\Firewall-Dashboard-shivam
            </code>
          </li>
          <li>
            Right-click <strong>run-as-admin.bat</strong> and select <strong>"Run as administrator"</strong>.
          </li>
          <li>
            That's it! Refresh this dashboard to enjoy full 1-click rule control.
          </li>
        </ol>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button className="primary-button" onClick={onClose}>
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
