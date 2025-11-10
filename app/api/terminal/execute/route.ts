import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
// Removed vm2 dependency - using Function constructor instead

export const dynamic = "force-dynamic";

/**
 * Terminal Command Execution API - RESOLVED TODO
 * Safely executes terminal commands in a sandboxed environment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { command, sessionId } = body;

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    // Parse command
    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    let output = '';
    let exitCode = 0;

    try {
      // Handle built-in commands
      switch (cmd) {
        case 'help':
          output = `Available commands:
  help      - Show this help message
  echo      - Echo text
  date      - Show current date/time
  calc      - Calculate expression (e.g., calc 2 + 2)
  clear     - Clear terminal
  whoami    - Show current user
  pwd       - Print working directory
  ls        - List directory (simulated)
  
Note: This is a sandboxed terminal for demonstration.
For full terminal access, use the system terminal.`;
          break;

        case 'echo':
          output = args.join(' ');
          break;

        case 'date':
          output = new Date().toString();
          break;

        case 'calc':
          try {
            const expression = args.join(' ');
            // Sanitize expression to only allow numbers and basic operators
            const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
            if (sanitized !== expression) {
              throw new Error('Invalid characters in expression');
            }
            const result = Function(`"use strict"; return (${sanitized})`)();
            output = String(result);
          } catch (error: any) {
            output = `Error: ${error.message}`;
            exitCode = 1;
          }
          break;

        case 'clear':
          output = '\x1b[2J\x1b[H'; // ANSI clear screen
          break;

        case 'whoami':
          output = user.email || user.id;
          break;

        case 'pwd':
          output = '/home/user';
          break;

        case 'ls':
          output = `Documents/
Downloads/
Projects/
README.md`;
          break;

        case '':
          // Empty command, just return
          output = '';
          break;

        default:
          output = `Command not found: ${cmd}
Type 'help' for available commands.`;
          exitCode = 127;
      }

      // Save to database if session ID provided
      if (sessionId) {
        await supabase.from('terminal_messages').insert([
          {
            session_id: sessionId,
            message_type: 'input',
            content: command
          },
          {
            session_id: sessionId,
            message_type: 'output',
            content: output
          }
        ]);
      }

      return NextResponse.json({
        success: true,
        output,
        exitCode,
        command: cmd
      });

    } catch (error: any) {
      console.error('Command execution error:', error);
      
      return NextResponse.json({
        success: false,
        output: `Error executing command: ${error.message}`,
        exitCode: 1
      });
    }

  } catch (error: any) {
    console.error('Terminal API error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
