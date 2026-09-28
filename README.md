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

- Overview of policy counts, protocol mix, audit activity, and security signals.
- Create, edit, enable, disable, search, filter, and delete firewall rules.
- Analyze duplicate definitions, opposing actions, broad allow rules, and invalid rule data.
- Search and filter audit events, then export the visible results as CSV.
- Responsive table and card views for policy review.

Rules and audit events are stored in the browser's `localStorage` and remain on that browser. Clearing site data resets the sample data. No information is sent to a server.

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