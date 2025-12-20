# Environment Setup for Frontend

To fix the `allowedHosts` error, create a `.env` file in the `frontend` directory with the following content:

```env
# React App Environment Variables
SKIP_PREFLIGHT_CHECK=true
ESLINT_NO_DEV_ERRORS=true

# Webpack Dev Server Configuration
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=3000
WDS_SOCKET_PATH=/ws

# React App Port
PORT=3000

# Browser (set to 'none' to prevent auto-opening)
BROWSER=none
```

## Quick Fix

Run this command in the `frontend` directory:

```bash
cat > .env << 'EOF'
SKIP_PREFLIGHT_CHECK=true
ESLINT_NO_DEV_ERRORS=true
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=3000
WDS_SOCKET_PATH=/ws
PORT=3000
BROWSER=none
EOF
```

This will create the `.env` file and should resolve the `allowedHosts` error.



