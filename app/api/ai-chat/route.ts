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
    throw new Error('Unauthorized: Invalid token');
  }
}

// Execute function based on name
async function executeFunction(
  functionName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any,
  user: User
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

      // Create operations
      case 'create_lecture':
        return await handlers.createLecture(args, user);
      case 'mark_attendance':
        return await handlers.markAttendance(args, user);

      // Update operations
      case 'update_attendance':
        return await handlers.updateAttendance(args, user);

      // Delete operations
      case 'delete_lecture':
        return await handlers.deleteLecture(args, user);

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
    const systemPrompt = `You are an AI assistant for an attendance management system at a university.

Current user:
- Name: ${user.firstName} ${user.lastName}
- Role: ${user.isAdmin ? 'Administrator' : 'Professor'}
- Permissions: ${user.isAdmin ? 'Full access to all operations' : 'Can create lectures and mark attendance for assigned classes'}

Your capabilities:
1. Query information: Students, professors, classes, subjects, lectures, attendance records, statistics
2. Create operations: Lectures, attendance records
3. Update operations: Attendance status
4. Delete operations: Lectures (with cascade deletion of attendance)

Guidelines:
- Use natural language to communicate with users
- When creating lectures or marking attendance, always confirm the action with details
- Provide helpful error messages if operations fail
- Use the available functions to access real-time data from the database
- Be concise but informative
- Support both English and Albanian language queries
- When users ask vague questions, help them by suggesting what you can do

Important:
- All operations are logged for audit purposes
- Professors can only create lectures and mark attendance for their assigned classes
- Administrators have full access to all operations`;

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
      model: 'gpt-4o', // Fast and capable model
      messages: openaiMessages,
      tools: attendanceFunctions,
      tool_choice: 'auto',
      temperature: 0.7,
      max_completion_tokens: 1000,
    });

    let choice = response.choices[0];
    const conversationMessages = [...openaiMessages];

    // Function calling loop - handle multiple function calls if needed
    let iterationCount = 0;
    const maxIterations = 5; // Prevent infinite loops

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

          const result = await executeFunction(functionName, args, user);

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
        model: 'gpt-4o',
        messages: conversationMessages,
        tools: attendanceFunctions,
        tool_choice: 'auto',
        temperature: 0.7,
        max_completion_tokens: 1000,
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
