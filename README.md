# Bhoonidhi Proxy API

This project provides a drop-in replacement for the Bhoonidhi Satellite Data API. It is useful when the original Bhoonidhi service is down, but your application depends on its REST API format.

## Usage
```bash
curl -X POST https://your-proxy-host/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo", "password": "demo@123", "grant_type": "password"}'
```