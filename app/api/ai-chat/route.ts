import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { SECRET_KEY } from '@/constants';
import { attendanceFunctions } from '@/lib/openai/functions';
import * as handlers from '@/lib/openai/functionHandlers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface User {
  professorId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Authenticate user from JWT
async function authenticateUser(): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    throw new Error('Unauthorized: No authentication token');
  }

  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);

    return {
      professorId: payload.professorId as number,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      isAdmin: payload.isAdmin as boolean,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Unauthorized: Invalid token', { cause: error });
  }
}

// Execute function based on name
async function executeFunction(
  functionName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any,
) {
  console.log(`[AI Chat] Executing function: ${functionName}`, args);

  try {
    switch (functionName) {
      // Query operations
      case 'get_system_statistics':
        return await handlers.getSystemStatistics();
      case 'get_students':
        return await handlers.getStudents(args);
      case 'get_student_details':
        return await handlers.getStudentDetails(args);
      case 'get_classes':
        return await handlers.getClasses(args);
      case 'get_class_details':
        return await handlers.getClassDetails(args);
      case 'get_subjects':
        return await handlers.getSubjects(args);
      case 'get_professors':
        return await handlers.getProfessors(args);
      case 'get_lectures':
        return await handlers.getLectures(args);
      case 'get_lecture_attendance':
        return await handlers.getLectureAttendance(args);
      case 'get_attendance_statistics':
        return await handlers.getAttendanceStatistics(args);

      // Advanced query operations
      case 'get_student_attendance_records':
        return await handlers.getStudentAttendanceRecords(args);
      case 'get_class_report':
        return await handlers.getClassReport(args);

      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    console.error(`[AI Chat] Error executing ${functionName}:`, error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser();

    // Get messages from request
    const { messages } = (await req.json()) as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request: messages array required' }, { status: 400 });
    }

    console.log('[AI Chat] Processing request for user:', user.firstName, user.lastName);

    // Development mode - return mock response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-mock') {
      return NextResponse.json({
        response: `🔧 Development Mode: OpenAI API është i çaktivizuar. Ju pyetët: "${messages[messages.length - 1].content}"\n\nPër të aktivizuar AI-n e vërtetë:\n1. Shkoni te https://platform.openai.com/account/billing\n2. Shtoni metodë pagese\n3. Krijoni API key\n4. Vendoseni në .env.local`,
        functionCallsExecuted: 0,
      });
    }

    // System prompt with user context
    const systemPrompt = `You are an AI assistant for an attendance management system at a university in Albania (UET - Universiteti Europian i Tiranës).

Current user:
- Name: ${user.firstName} ${user.lastName}
- Role: ${user.isAdmin ? 'Administrator (Admin)' : 'Professor'}
- Permissions: ${user.isAdmin ? 'Full access to all operations' : 'Can manage lectures and attendance for assigned classes only'}

IMPORTANT CONTEXT:
- The system uses Albanian language. Users may write in Albanian or English - understand and respond in the SAME language the user uses.
- Albanian terms you must understand: "mungesa" = absences, "prezencë" = attendance/presence, "lëndë" = subject, "klasë" = class, "studenti/studentja" = student, "me leje" = with permission/leave, "sa herë" = how many times, "aktivizime" = PARTICIPATED (activations in lectures), "pjesëmarrje" = also PARTICIPATED
- Attendance statuses in the system: PRESENT (I Pranishëm), ABSENT (Mungon), PARTICIPATED (Aktivizuar), LEAVE (Me Leje)
- IMPORTANT: When users say "aktivizime" or "ka marrë pjesë" or "pjesëmarrje" they mean PARTICIPATED status. "Sa aktivizime ka?" = "How many PARTICIPATED records?". Always map "aktivizim/aktivizime/ka marrë pjesë/pjesëmarrje" to PARTICIPATED. When displaying PARTICIPATED status in responses, ALWAYS use the label "Aktivizuar" (never "Ka Marrë Pjesë").
- NK (Nuk Kalon) = Student fails because absences exceed the threshold. Thresholds: Leksion ≥50%, Seminar ≥75% attendance required to pass.
- OK = Student passes (meets attendance threshold)
- Teaching types: "Leksion" (lecture), "Seminar" (seminar)
- LEAVE status does NOT count as absence - it is excluded from the total when calculating percentages
- Both PRESENT and PARTICIPATED count as "attended"

Your capabilities:
1. Query: Students (by name/email/ID), professors, classes, subjects, lectures, attendance records, statistics
2. Individual Records: Get specific dated attendance records for a student (use get_student_attendance_records)
3. Reports: NK/OK lists per class/subject/type (use get_class_report)

Function selection guide:
- "Sa mungesa ka studenti X?" → call get_attendance_statistics with studentName. If the function returns needsMoreInfo with available subjects/types, present them to the user and ask them to choose.
- "Datat kur ka munguar X" → call get_student_attendance_records with studentName. Same: if needsMoreInfo is returned, present options to user.
- "Lista NK per klasen X, lenden Y" → use get_class_report with className, subjectName
- "Lista NK per seminaret" → use get_class_report with typeName="Seminar"
- "Kush mungon sot?" → first get_lectures for today, then get_lecture_attendance
- "Detajet e studentit X" → use get_student_details with studentName
- When user provides subject and type (e.g., "Endrit Mustafaj, Projektim DB, Seminar"), pass them directly — fuzzy matching will resolve partial names automatically.

Guidelines:
- When asked about absences ("mungesa"), respond with exact counts and percentages
- Format responses clearly: use bullet points for lists, show key numbers prominently
- When listing students (NK lists, etc.), present them in a clear numbered format
- If a student name matches multiple results, present the candidates and ask user to clarify
- When creating or modifying data, always confirm the action with details
- All operations are logged for audit purposes
- Be precise with numbers and dates
- Keep responses focused and informative`;

    // Prepare messages for OpenAI
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Initial API call with function definitions
    let response = await openai.chat.completions.create({
      model: 'gpt-5.4', // Fast and capable model
      messages: openaiMessages,
      tools: attendanceFunctions,
      tool_choice: 'auto',
      temperature: 0.5,
      max_completion_tokens: 16384,
    });

    let choice = response.choices[0];
    const conversationMessages = [...openaiMessages];

    // Function calling loop - handle multiple function calls if needed
    let iterationCount = 0;
    const maxIterations = 10; // Allow enough iterations for complex queries

    while (choice.message.tool_calls && iterationCount < maxIterations) {
      iterationCount++;
      console.log(`[AI Chat] Iteration ${iterationCount}: Processing ${choice.message.tool_calls.length} tool calls`);

      // Add assistant's message with tool calls to conversation
      conversationMessages.push(choice.message);

      // Execute all tool calls
      const toolResults = await Promise.all(
        choice.message.tool_calls.map(async (toolCall) => {
          if (toolCall.type !== 'function') return null;

          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);

          const result = await executeFunction(functionName, args);

          return {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
        })
      );

      // Filter out null results and add to conversation
      conversationMessages.push(...toolResults.filter((r) => r !== null));

      // Get next response from OpenAI
      response = await openai.chat.completions.create({
        model: 'gpt-5.4',
        messages: conversationMessages,
        tools: attendanceFunctions,
        tool_choice: 'auto',
        temperature: 0.5,
        max_completion_tokens: 16384,
      });

      choice = response.choices[0];
    }

    if (iterationCount >= maxIterations) {
      console.warn('[AI Chat] Max iterations reached, stopping function calls');
    }

    // Return final response
    return NextResponse.json({
      response: choice.message.content || 'I apologize, but I encountered an error processing your request.',
      functionCallsExecuted: iterationCount,
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
