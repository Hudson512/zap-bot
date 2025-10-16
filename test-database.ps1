# ZapNode Database Testing Script
# Tests all database endpoints

$baseUrl = "http://localhost:3000"

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "🗄️  ZapNode Database API Tests" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# Test 1: Database Stats
Write-Host "📊 Test 1: Database Statistics" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/database/stats"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Total Sessions: $($stats.data.totalSessions)" -ForegroundColor White
    Write-Host "Active Sessions: $($stats.data.activeSessions)" -ForegroundColor White
    Write-Host "Total Messages: $($stats.data.totalMessages)" -ForegroundColor White
    Write-Host "Total Contacts: $($stats.data.totalContacts)" -ForegroundColor White
    Write-Host "Total Commands: $($stats.data.totalCommands)" -ForegroundColor White
    Write-Host "Messages Today: $($stats.data.messagesToday)" -ForegroundColor White
    Write-Host "Database Size: $($stats.data.databaseSize)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get All Sessions
Write-Host "`n📱 Test 2: Get All Sessions" -ForegroundColor Yellow
try {
    $sessions = Invoke-RestMethod -Uri "$baseUrl/database/sessions"
    Write-Host "✅ Success! Found $($sessions.count) session(s)" -ForegroundColor Green
    foreach ($session in $sessions.data) {
        Write-Host "  - ID: $($session.id)" -ForegroundColor White
        Write-Host "    Phone: $($session.phone_number)" -ForegroundColor Gray
        Write-Host "    Status: $($session.status)" -ForegroundColor Gray
        Write-Host "    Version: $($session.whatsapp_version)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Specific Session
Write-Host "`n🔍 Test 3: Get Default Session" -ForegroundColor Yellow
try {
    $session = Invoke-RestMethod -Uri "$baseUrl/database/sessions/default"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Phone: $($session.data.phone_number)" -ForegroundColor White
    Write-Host "Status: $($session.data.status)" -ForegroundColor White
    Write-Host "Created: $($session.data.created_at)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Messages (if any)
Write-Host "`n💬 Test 4: Get Recent Messages" -ForegroundColor Yellow
try {
    $messages = Invoke-RestMethod -Uri "$baseUrl/database/messages?sessionId=default&limit=10"
    Write-Host "✅ Success! Found $($messages.count) message(s)" -ForegroundColor Green
    if ($messages.count -gt 0) {
        foreach ($msg in $messages.data | Select-Object -First 3) {
            Write-Host "  - From: $($msg.from_number)" -ForegroundColor White
            Write-Host "    Body: $($msg.body)" -ForegroundColor Gray
            Write-Host "    Time: $($msg.timestamp)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Contacts
Write-Host "`n👥 Test 5: Get Contacts" -ForegroundColor Yellow
try {
    $contacts = Invoke-RestMethod -Uri "$baseUrl/database/contacts?sessionId=default&limit=10"
    Write-Host "✅ Success! Found $($contacts.count) contact(s)" -ForegroundColor Green
    if ($contacts.count -gt 0) {
        foreach ($contact in $contacts.data | Select-Object -First 5) {
            Write-Host "  - Phone: $($contact.phone_number)" -ForegroundColor White
            Write-Host "    Name: $($contact.name)" -ForegroundColor Gray
            Write-Host "    Messages: $($contact.message_count)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get Command Stats
Write-Host "`n📈 Test 6: Command Statistics" -ForegroundColor Yellow
try {
    $cmdStats = Invoke-RestMethod -Uri "$baseUrl/database/commands/stats?sessionId=default&limit=5"
    Write-Host "✅ Success! Found $($cmdStats.count) command(s)" -ForegroundColor Green
    if ($cmdStats.count -gt 0) {
        foreach ($cmd in $cmdStats.data) {
            Write-Host "  - Command: !$($cmd.command_name)" -ForegroundColor White
            Write-Host "    Usage: $($cmd.usage_count)" -ForegroundColor Gray
            Write-Host "    Success: $($cmd.success_count)" -ForegroundColor Gray
            Write-Host "    Errors: $($cmd.error_count)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Search Messages
Write-Host "`n🔎 Test 7: Search Messages (query: 'hello')" -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/database/messages/search?query=hello&sessionId=default&limit=5"
    Write-Host "✅ Success! Found $($searchResults.count) result(s)" -ForegroundColor Green
    if ($searchResults.count -gt 0) {
        foreach ($msg in $searchResults.data) {
            Write-Host "  - Body: $($msg.body)" -ForegroundColor White
            Write-Host "    From: $($msg.from_number)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "✅ Database Tests Complete!" -ForegroundColor Green
Write-Host "=====================================`n" -ForegroundColor Cyan

# Interactive menu
Write-Host "Would you like to:" -ForegroundColor Cyan
Write-Host "1. View database stats again" -ForegroundColor White
Write-Host "2. Search messages by keyword" -ForegroundColor White
Write-Host "3. View top contacts" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n📊 Database Statistics:" -ForegroundColor Yellow
        $stats = Invoke-RestMethod -Uri "$baseUrl/database/stats"
        $stats.data | Format-List
    }
    "2" {
        $query = Read-Host "Enter search keyword"
        Write-Host "`n🔎 Searching for: '$query'" -ForegroundColor Yellow
        $results = Invoke-RestMethod -Uri "$baseUrl/database/messages/search?query=$query&sessionId=default"
        Write-Host "Found $($results.count) results" -ForegroundColor Green
        $results.data | Select-Object body, from_number, timestamp | Format-Table -AutoSize
    }
    "3" {
        Write-Host "`n👥 Top Contacts:" -ForegroundColor Yellow
        $topContacts = Invoke-RestMethod -Uri "$baseUrl/database/contacts/top?sessionId=default&limit=10"
        $topContacts.data | Select-Object phone_number, name, message_count, last_seen | Format-Table -AutoSize
    }
    "4" {
        Write-Host "Goodbye! 👋" -ForegroundColor Cyan
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}
