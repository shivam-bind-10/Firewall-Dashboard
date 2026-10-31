# Sentinel Firewall Control

A responsive firewall policy dashboard built with React and Vite. Sentinel is an interactive **simulation** for creating, reviewing, and auditing example network rules; it does not configure an operating-system firewall or connect to a backend service.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Sign in with any non-empty email address and password. The sign-in screen is a demo gate, not real authentication.

## Features

- Overview of policy counts, protocol mix, recent audit activity, and rule-analysis signals.
- Create, edit, duplicate, enable, disable, and delete rules, individually or in bulk.
- Search and filter by status, action, protocol, and rule fields; sort by priority or creation date.
- Validate IPv4/IPv6 addresses, CIDR prefixes, ports, and port ranges.
- Import and export policy sets as JSON. Imports are validated and receive new rule IDs.
- Analyze duplicate definitions, opposing actions, broad allow rules, and invalid policy data.
- Search and filter audit events, then export the visible events as CSV.
- Responsive table and card views, including a mobile navigation drawer.

Rules and audit events are stored in this browser's `localStorage`. Clearing site data resets the sample data. Policy data is not sent to a backend.

## Simulation boundary

Sentinel is a frontend demonstration, not an operating-system firewall controller. Rule changes update only the browser's local data. The project does not authenticate real users, enforce traffic, connect to a firewall appliance, or provide a backend/API. Priorities and analysis findings are for demonstration and review only.

## Validation

```sh
npm run lint
npm run build
```

## Technology

- React 19
- React Router
- Vite
- Lucide icons