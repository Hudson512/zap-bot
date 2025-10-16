# API Documentation with Swagger

## 🚀 Quick Start

ZapNode includes **interactive API documentation** powered by Swagger/OpenAPI 3.0.

### Access the Documentation

Once the server is running, open your browser:

```
http://localhost:3000/api-docs
```

## 📋 What's Included

### Interactive UI Features

- **Try it Out** - Test API endpoints directly from the browser
- **Request Examples** - See example requests with all parameters
- **Response Schemas** - View response structures and data types
- **Authentication** - (Future: API key support)
- **Search & Filter** - Filter endpoints by tags

### Organized by Tags

1. **Health** - Application health and status endpoints
2. **Sessions** - WhatsApp multi-session management
3. **Database** - Data persistence and queries
4. **Webhook** - External message integration

## 🔍 How to Use Swagger UI

### 1. **Browse Endpoints**
Click on any endpoint to expand its documentation:
- Method (GET, POST, DELETE, etc.)
- Path (`/sessions`, `/database/stats`, etc.)
- Description
- Parameters
- Request body (for POST/PUT)
- Response examples

### 2. **Try an Endpoint**

**Example: Get Database Stats**

1. Find `GET /database/stats` in the **Database** section
2. Click **"Try it out"**
3. Click **"Execute"**
4. See the **Response** with actual data

**Example: Create a Session**

1. Find `POST /sessions` in the **Sessions** section
2. Click **"Try it out"**
3. Edit the request body:
   ```json
   {
     "sessionId": "test-session",
     "headless": false
   }
   ```
4. Click **"Execute"**
5. See the response (QR code will appear in server console)

### 3. **View Response Schemas**

Each endpoint shows:
- **200** - Success response schema
- **400** - Bad request (validation errors)
- **404** - Not found
- **500** - Server error

## 📦 Export OpenAPI Spec

Get the raw OpenAPI 3.0 JSON specification:

```
http://localhost:3000/api-docs.json
```

Use this to:
- Generate client SDKs (using openapi-generator)
- Import into Postman
- Create API tests
- Generate documentation in other formats

## 🧪 Testing Workflows

### Example 1: Complete Session Lifecycle

```bash
# 1. Create a new session
POST /sessions
Body: { "sessionId": "customer-abc" }
Response: { "success": true, "session": {...} }

# 2. Check session status
GET /sessions/customer-abc/status
Response: { "isReady": true, "qrCode": null }

# 3. Send a message
POST /sessions/customer-abc/send
Body: { "phoneNumber": "244929782402", "message": "Hello!" }
Response: { "success": true }

# 4. Check messages in database
GET /database/messages?sessionId=customer-abc&limit=10
Response: { "success": true, "data": [...] }

# 5. Delete session
DELETE /sessions/customer-abc
Response: { "success": true }
```

### Example 2: Database Analytics

```bash
# 1. Get overall stats
GET /database/stats
Response: { totalSessions: 3, totalMessages: 1523, ... }

# 2. Get top contacts
GET /database/contacts/top?sessionId=default&limit=5
Response: { "data": [{ "phone_number": "...", "message_count": 45 }] }

# 3. Search messages
GET /database/messages/search?query=hello&sessionId=default
Response: { "count": 12, "data": [...] }

# 4. Get command stats
GET /database/commands/stats?sessionId=default
Response: { "data": [{ "command_name": "ping", "usage_count": 45 }] }
```

## 🎨 Customization

The Swagger configuration is located at:
```
app/config/swagger.js
```

### Add Documentation to New Endpoints

Use JSDoc comments with Swagger annotations:

```javascript
/**
 * @swagger
 * /my-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags: [TagName]
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
router.get("/my-endpoint", (req, res) => {
  // Your code here
});
```

### Add New Schema

Edit `app/config/swagger.js` to add reusable schemas:

```javascript
components: {
  schemas: {
    MySchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        // ... more properties
      }
    }
  }
}
```

Then reference it in endpoints:
```javascript
/**
 * @swagger
 * responses:
 *   200:
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/MySchema'
 */
```

## 📱 Mobile/External Access

If you want to access Swagger from another device on your network:

1. Find your local IP:
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Update `app/config/swagger.js`:
   ```javascript
   servers: [
     {
       url: "http://192.168.1.100:3000",
       description: "Local network",
     },
   ],
   ```

3. Access from mobile browser:
   ```
   http://192.168.1.100:3000/api-docs
   ```

## 🔐 Future: API Authentication

To add API key authentication to Swagger:

```javascript
// In swagger.js
components: {
  securitySchemes: {
    ApiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "X-API-Key"
    }
  }
},
security: [
  {
    ApiKeyAuth: []
  }
]
```

## 📊 Integration with Other Tools

### Postman
1. Go to `http://localhost:3000/api-docs.json`
2. Copy the JSON
3. In Postman: Import → Raw Text → Paste JSON
4. All endpoints imported with examples!

### Insomnia
1. Download `http://localhost:3000/api-docs.json`
2. In Insomnia: Import/Export → Import Data → From File
3. Select the JSON file

### Client SDK Generation
```bash
# Install openapi-generator
npm install -g @openapitools/openapi-generator-cli

# Generate JavaScript/TypeScript client
openapi-generator-cli generate \
  -i http://localhost:3000/api-docs.json \
  -g javascript \
  -o ./client-sdk
```

## 🎯 Best Practices

1. **Keep Documentation Updated** - Update Swagger comments when changing endpoints
2. **Use Examples** - Add example values in parameters and schemas
3. **Describe Errors** - Document all possible error responses
4. **Group by Tags** - Organize endpoints logically
5. **Version Your API** - Include version in URL or headers

## 🐛 Troubleshooting

### Swagger UI not loading
- Check if server is running on port 3000
- Clear browser cache
- Check console for JavaScript errors

### Documentation not updating
- Restart the server (Swagger spec is cached)
- Check for syntax errors in JSDoc comments

### Missing endpoints
- Ensure route files are included in `swagger.js` `apis` array:
  ```javascript
  apis: ["./app/routes/*.js", "./app/server.js"]
  ```

---

**Swagger UI URL:** http://localhost:3000/api-docs  
**OpenAPI JSON:** http://localhost:3000/api-docs.json  
**Status:** ✅ Fully Functional
