# AI Assistant UI Component

## Overview

The AI Assistant is a **full-featured CRUD interface** integrated into your Next.js attendance management application. It allows users to interact with the system using natural language queries to create, read, update, and delete records.

## Features

- 🤖 **Natural Language Processing** - Ask questions and give commands in plain language
- 💬 **Real-time Chat Interface** - Beautiful, responsive chat UI with animations
- 🔐 **Permission-Based Access** - Respects user roles (admin vs regular professor)
- ✅ **Full CRUD Operations** - Create lectures, mark attendance, delete records
- 📊 **Data Queries** - List students, professors, classes, lectures, etc.
- 📝 **Activity Logging** - All operations tracked in ActivityLog table
- ✨ **Smart Suggestions** - Quick action buttons for common tasks
- 🎨 **Modern UI** - Smooth animations with Framer Motion

## Access

Navigate to `/ai-assistant` in your application or click "AI Assistant" in the sidebar under "SISTEMI".

## Available Operations

### 📊 READ Operations (View Data)

#### View Lists
- **Students**: "List students in Infoek202" or "Me listo studentet e klasës INF206"
- **Professors**: "List all professors" or "Show professors"
- **Classes**: "List all classes" or "Show classes"
- **Subjects**: "List subjects"
- **Teaching Assignments**: "List my teaching assignments" or "Show teaching assignments"

#### View Lectures
- **Today's lectures**: "Show today's lectures" or "List today's lectures"
- **Tomorrow's lectures**: "Show tomorrow's lectures"
- **This week's lectures**: "Show lectures from this week"
- **All lectures**: "List all lectures"

#### System Information
- **Statistics**: "Show system statistics" or "Give me an overview"
- **Attendance statuses**: "List attendance statuses"

### ➕ CREATE Operations

#### Create Lecture (Name-Based)
```
"Create lecture for Web Development in Infoek202 tomorrow"
"Krijo leksion për CIS280 në klasën INF206 nesër"
"Add lecture for Database Systems in MSH1TI on 2025-12-15"
```

**New approach**: Use subject name/code + class name instead of teaching assignment IDs!

#### Mark Attendance (Name-Based)
```
"Mark john.doe@example.com present in Web Development lecture today"
"Shëno prezentë për maria.smith@example.com në leksionin e CIS280 sot"
"Mark Jane Doe absent in Database Systems lecture yesterday"
"Record attendance for john.doe@example.com in Web Development Infoek202 lecture today as late"
```

**New approach**: Use student email (recommended) or name + lecture identification (subject + class + date) instead of IDs!

Supported statuses: 
- English: `present`, `absent`, `late`, `excused`
- Albanian: `prezentë`, `mungesë`, `vonë`

### 🗑️ DELETE Operations

#### Delete Lecture (Name-Based)
```
"Delete Web Development lecture for Infoek202 from yesterday"
"Fshi leksionin e CIS280 në INF206 nga dje"
"Remove Database Systems lecture for MSH1TI from 2025-12-10"
```

**New approach**: Use subject name/code + class name + date instead of lecture IDs!

**Note**: You can only delete your own lectures (unless you're an admin)

## Permission System

### Admin Professors
- ✅ View all data (students, professors, classes, etc.)
- ✅ Create lectures for any teaching assignment
- ✅ Mark attendance for any lecture
- ✅ Delete any lecture
- ✅ Full system access

### Regular Professors
- ✅ View all data (read-only for students, professors, classes)
- ✅ Create lectures for their own teaching assignments
- ✅ Mark attendance for their own lectures
- ✅ Delete their own lectures
- ❌ Cannot manage students, professors, classes (admin-only)

## Examples

### Quick Start Examples
1. **"Show system statistics"** - Get overview of the system
2. **"List students in Infoek202"** - See students in a specific class
3. **"Create lecture for Web Development in Infoek202 tomorrow"** - Create a new lecture
4. **"Show today's lectures"** - View lectures scheduled for today
5. **"Mark john.doe@example.com present in Web Development lecture today"** - Record attendance
6. **"Delete Web Development lecture for Infoek202 from yesterday"** - Remove a lecture

### Common Workflows

#### Daily Attendance Workflow
```
1. "Show today's lectures"
   → Get list of today's lectures

2. "Mark john.doe@example.com present in Web Development lecture today"
   → Mark first student

3. "Mark jane.smith@example.com absent in Web Development lecture today"
   → Mark second student
   
... continue for all students (use student emails for accuracy)
```

#### Weekly Lecture Planning
```
1. "List my teaching assignments"
   → Get your subjects and classes

2. "Create lecture for Web Development in Infoek202 on 2025-12-10"
   → Schedule Monday lecture

3. "Create lecture for Web Development in Infoek202 on 2025-12-12"
   → Schedule Wednesday lecture
```

### Albanian Language Support

All operations work in Albanian too:
```
"Me listo studentet e klasës Infoek202"
"Krijo leksion për Web Development në klasën INF206 nesër"
"Shëno prezentë për john.doe@example.com në leksionin e CIS280 sot"
"Fshi leksionin e Database Systems në MSH1TI nga dje"
```

## Activity Logging

All AI operations are logged to the `ActivityLog` table with:
- **User information** - Who performed the action
- **Action type** - CREATE (for queries and creations), DELETE
- **Entity** - What was affected (ai-query, lectures, attendance)
- **Details** - Full context (query parameters, results, etc.)
- **Timestamp** - When it occurred
- **IP Address** - Source (marked as "WEB_UI")

You can view all AI activity in the Activity Logs page.

## Technical Details

### Architecture

```
┌─────────────────────────────────────┐
│   Frontend (AIAgentChat.tsx)        │
│   - Chat interface                  │
│   - Message history                 │
│   - Suggestions                     │
└──────────────┬──────────────────────┘
               │ HTTP POST /api/ai-agent
               ▼
┌─────────────────────────────────────┐
│   Backend (route.ts)                │
│   - Intent detection                │
│   - Permission checking             │
│   - Prisma operations               │
│   - Activity logging                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Database (MySQL via Prisma)       │
│   - Students, Professors            │
│   - Lectures, Attendance            │
│   - ActivityLog                     │
└─────────────────────────────────────┘
```

### Intent Detection

The system uses **pattern matching and natural language processing** to detect user intent:
- Keyword detection (create, delete, list, show, mark, krijo, fshi, listo, shëno)
- Entity recognition (student, lecture, attendance, class, subject)
- **Name-based matching** - No need to remember IDs!
- Regex extraction for emails, class names, subject names, dates
- Status matching for attendance (English and Albanian)
- Case-insensitive search for class names and subject codes

### Key Improvements (v2.0)

🎯 **Name-Based Queries** - The biggest change!
- ❌ OLD: "List students in class 5" (required class ID)
- ✅ NEW: "List students in Infoek202" (use memorable class name)

- ❌ OLD: "Create lecture for teaching assignment 5 tomorrow" (required assignment ID)
- ✅ NEW: "Create lecture for Web Development in Infoek202 tomorrow" (use subject + class names)

- ❌ OLD: "Mark student 10 lecture 15 as present" (required student ID + lecture ID)
- ✅ NEW: "Mark john.doe@example.com present in Web Development lecture today" (use email + natural description)

- ❌ OLD: "Delete lecture 15" (required lecture ID)
- ✅ NEW: "Delete Web Development lecture for Infoek202 from yesterday" (use subject + class + date)

**Why?** IDs aren't memorable - you naturally think "Infoek202" not "class 5"!

### Future Enhancements

Ready for integration with:

1. **OpenAI/Claude API** - Replace pattern matching with GPT/Claude for even better NLP
2. **Bulk Operations** - "Mark all students present in today's Web Development lecture"
3. **Advanced Queries** - "Show attendance rate for students in Infoek202"
4. **Fuzzy Matching** - Handle typos like "Infok202" → "Infoek202"
5. **Voice Input** - Speech-to-text integration
6. **Export** - "Export students from Infoek202 to CSV"
7. **Date Ranges** - "Show lectures from last week"
8. **Updates** - "Update Web Development lecture date to tomorrow"

## How It Differs from MCP Server

| Feature | Web AI Assistant | MCP Server |
|---------|-----------------|------------|
| **Access** | Web browser | Claude Desktop app |
| **Communication** | HTTP/REST | stdio protocol |
| **Authentication** | Session cookies | Environment variable |
| **Running** | Part of Next.js (npm run dev) | Standalone (npm start in mcp-server/) |
| **User** | Current logged-in professor | Set via CURRENT_PROFESSOR_ID |
| **CRUD Support** | ✅ Full (Create, Read, Delete) | ✅ Full (Create, Read, Update, Delete) |

**Both systems work independently** - you can use one, the other, or both simultaneously!

## Styling

The component uses:
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Dark mode** support
- **Responsive** design
- **Accessible** components

## Security

- ✅ Session-based authentication
- ✅ Permission checking on all operations  
- ✅ SQL injection protection via Prisma
- ✅ Activity logging for audit trail
- ✅ Input validation and sanitization

## Troubleshooting

### "Not authenticated" error
- You need to be logged in to use the AI Assistant
- Session may have expired - refresh and log in again

### "Permission denied" errors
- Check if you're trying to perform admin-only operations
- Regular professors can only manage their own lectures/attendance

### Operations not working
- **For student lists**: Use class name (e.g., "Infoek202") not class ID
- **For lectures**: Specify subject name/code + class name + date
- **For attendance**: Use student email (recommended) or full name
- Ensure student belongs to the lecture's class
- Check date format (YYYY-MM-DD) or use "today"/"tomorrow"/"yesterday" (or Albanian: "sot"/"nesër"/"dje")

### "Class/Subject not found" errors
- Check spelling of class name (e.g., "Infoek202" not "Infoek20")
- For subjects, try using the code (e.g., "CIS280") if the full name doesn't work
- Search is case-insensitive and uses partial matching

## Testing

Try these test queries:
1. ✅ "Show system statistics"
2. ✅ "List students in Infoek202" (use your actual class name)
3. ✅ "Show today's lectures"
4. ✅ "Create lecture for Web Development in Infoek202 tomorrow"
5. ✅ "Mark john.doe@example.com present in Web Development lecture today" (use actual email)
6. ✅ "Delete Web Development lecture for Infoek202 from yesterday"
7. ✅ "List all professors"

### Albanian Tests
1. ✅ "Me listo studentet e klasës Infoek202"
2. ✅ "Krijo leksion për CIS280 në klasën INF206 nesër"
3. ✅ "Shëno prezentë për student@example.com në leksionin e Web Development sot"
4. ✅ "Fshi leksionin e Database Systems në MSH1TI nga dje"
