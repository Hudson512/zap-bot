# Database Persistence - SQLite

## 📋 Overview

ZapNode now includes **SQLite database persistence** for storing:
- 💬 All messages received
- 👥 Contact information
- 📊 Command usage statistics
- 🔗 Session information

## 🗄️ Database Structure

### Tables

#### 1. **sessions**
Stores WhatsApp session information:
```sql
- id (TEXT PRIMARY KEY)
- phone_number (TEXT)
- status (TEXT) - 'connected' | 'disconnected'
- created_at (DATETIME)
- connected_at (DATETIME)
- disconnected_at (DATETIME)
- last_seen (DATETIME)
- whatsapp_version (TEXT)
- options (TEXT/JSON)
```

#### 2. **messages**
Stores all received messages:
```sql
- id (TEXT PRIMARY KEY) - WhatsApp message ID
- session_id (TEXT FOREIGN KEY)
- from_number (TEXT)
- to_number (TEXT)
- chat_id (TEXT)
- chat_type (TEXT) - 'private' | 'group' | 'broadcast' | 'newsletter'
- body (TEXT) - Message content
- message_type (TEXT) - 'chat' | 'image' | 'video' | etc.
- has_media (BOOLEAN)
- timestamp (DATETIME)
- is_forwarded (BOOLEAN)
- is_status (BOOLEAN)
- created_at (DATETIME)
```

#### 3. **contacts**
Stores contact information:
```sql
- id (TEXT PRIMARY KEY)
- session_id (TEXT FOREIGN KEY)
- phone_number (TEXT)
- name (TEXT)
- push_name (TEXT)
- is_business (BOOLEAN)
- is_group (BOOLEAN)
- first_seen (DATETIME)
- last_seen (DATETIME)
- message_count (INTEGER) - Total messages from this contact
```

#### 4. **command_usage**
Logs all command executions:
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- session_id (TEXT FOREIGN KEY)
- command_name (TEXT)
- from_number (TEXT)
- chat_id (TEXT)
- arguments (TEXT/JSON)
- executed_at (DATETIME)
- success (BOOLEAN)
- error_message (TEXT)
```

## 🚀 API Endpoints

### Base URL: `http://localhost:3000/database`

#### **GET /database/stats**
Get overall database statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 5,
    "activeSessions": 2,
    "totalMessages": 1523,
    "totalContacts": 145,
    "totalCommands": 78,
    "messagesToday": 34,
    "databaseSize": "2.45 MB"
  }
}
```

---

#### **GET /database/sessions**
Get all sessions from database.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "default",
      "phone_number": "244929782402",
      "status": "connected",
      "created_at": "2025-10-15T10:30:00.000Z",
      "connected_at": "2025-10-15T10:31:00.000Z",
      "whatsapp_version": "2.2412.54"
    }
  ]
}
```

---

#### **GET /database/sessions/:id**
Get specific session by ID.

**Example:** `GET /database/sessions/default`

---

#### **GET /database/messages**
Get messages with filters.

**Query Parameters:**
- `sessionId` (optional) - Filter by session
- `chatId` (optional) - Filter by chat
- `limit` (default: 50) - Max results
- `offset` (default: 0) - Pagination offset

**Example:**
```bash
GET /database/messages?sessionId=default&limit=100
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "limit": 100,
  "offset": 0,
  "data": [
    {
      "id": "msg_123456",
      "session_id": "default",
      "from_number": "244929782402@c.us",
      "chat_id": "244929782402@c.us",
      "chat_type": "private",
      "body": "!ping",
      "message_type": "chat",
      "timestamp": "2025-10-15T14:20:00.000Z"
    }
  ]
}
```

---

#### **GET /database/messages/search**
Search messages by content.

**Query Parameters:**
- `query` (required) - Search term
- `sessionId` (optional) - Filter by session
- `limit` (default: 50) - Max results

**Example:**
```bash
GET /database/messages/search?query=hello&sessionId=default
```

---

#### **GET /database/contacts**
Get contacts for a session.

**Query Parameters:**
- `sessionId` (required) - Session ID
- `limit` (default: 100) - Max results

**Example:**
```bash
GET /database/contacts?sessionId=default&limit=50
```

**Response:**
```json
{
  "success": true,
  "sessionId": "default",
  "count": 25,
  "data": [
    {
      "id": "default-244929782402@c.us",
      "session_id": "default",
      "phone_number": "244929782402@c.us",
      "name": "John Doe",
      "message_count": 45,
      "first_seen": "2025-10-10T10:00:00.000Z",
      "last_seen": "2025-10-15T14:20:00.000Z"
    }
  ]
}
```

---

#### **GET /database/contacts/top**
Get top contacts by message count.

**Query Parameters:**
- `sessionId` (required) - Session ID
- `limit` (default: 10) - Max results

**Example:**
```bash
GET /database/contacts/top?sessionId=default&limit=5
```

---

#### **GET /database/commands/stats**
Get command usage statistics.

**Query Parameters:**
- `sessionId` (optional) - Filter by session
- `limit` (default: 10) - Max results

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "command_name": "ping",
      "usage_count": 45,
      "success_count": 45,
      "error_count": 0
    },
    {
      "command_name": "help",
      "usage_count": 23,
      "success_count": 23,
      "error_count": 0
    }
  ]
}
```

---

#### **POST /database/cleanup**
Cleanup old data.

**Body:**
```json
{
  "daysToKeep": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up data older than 30 days",
  "data": {
    "messagesDeleted": 523,
    "commandsDeleted": 145
  }
}
```

## 💬 WhatsApp Commands

### **!stats**
Show database statistics directly in WhatsApp.

**Example:**
```
User: !stats

Bot: 📊 *ZapNode Statistics*

*Database:*
• Total Sessions: 3
• Active Sessions: 2
• Database Size: 2.45 MB

*Messages:*
• Total Messages: 1523
• Messages Today: 34

*Contacts:*
• Total Contacts: 145

*Commands:*
• Total Executed: 78
```

## 🔧 PowerShell Commands

### Get Database Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/database/stats"
```

### Get All Messages for a Session
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/database/messages?sessionId=default&limit=100"
```

### Search Messages
```powershell
$query = "hello"
Invoke-RestMethod -Uri "http://localhost:3000/database/messages/search?query=$query&sessionId=default"
```

### Get Top Contacts
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/database/contacts/top?sessionId=default&limit=10"
```

### Get Command Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/database/commands/stats?sessionId=default"
```

### Cleanup Old Data (30+ days)
```powershell
$body = @{ daysToKeep = 30 } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/database/cleanup" `
  -ContentType "application/json" -Body $body
```

## 📁 Database Location

The SQLite database file is stored at:
```
/data/zapnode.db
```

## 🔒 Automatic Persistence

All data is saved **automatically**:

1. **Messages:** Saved immediately when received (before processing)
2. **Sessions:** Created when session starts, updated on connect/disconnect
3. **Contacts:** Updated automatically when messages are received
4. **Commands:** Logged after every command execution (success or failure)

## 🧹 Maintenance

### Manual Cleanup
Run cleanup via API to delete old data:
```powershell
# Delete messages older than 30 days
$body = @{ daysToKeep = 30 } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/database/cleanup" `
  -ContentType "application/json" -Body $body
```

### Database Optimization
After cleanup, the database is automatically **VACUUMed** to reclaim space.

### Backup
To backup your database, simply copy the file:
```powershell
Copy-Item -Path "data\zapnode.db" -Destination "backups\zapnode_backup_$(Get-Date -Format 'yyyy-MM-dd').db"
```

## 📊 Performance

- **Indexed columns:** Session ID, chat ID, timestamp, phone number, command name
- **Foreign keys:** Enabled for data integrity
- **Cascade deletes:** Deleting a session removes all related data

## 🚀 Next Steps

1. **Start the server** - Database initializes automatically
2. **Send messages** - They're saved to database immediately
3. **Use `!stats` command** - See statistics in WhatsApp
4. **Query via API** - Use PowerShell/curl to analyze data
5. **Setup backups** - Copy `data/zapnode.db` regularly

---

**Database Features:**
✅ Automatic persistence  
✅ Full message history  
✅ Contact tracking  
✅ Command analytics  
✅ Session management  
✅ Search functionality  
✅ Automatic cleanup  
✅ RESTful API access  

**Status:** Production Ready 🚀
