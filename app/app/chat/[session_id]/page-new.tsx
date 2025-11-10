"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  Paperclip, 
  Sparkles,
  Code,
  Rocket,
  Bug,
  MessageSquare,
  ChevronDown,
  X
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  agentId?: string;
  mode?: string;
}

interface ChatPageProps {
  params: { session_id: string };
}

type ChatMode = "chat" | "code" | "project" | "debug";

const MODES = [
  { id: "chat" as ChatMode, name: " Chat", icon: MessageSquare, desc: "General conversation" },
  { id: "code" as ChatMode, name: "Code", icon: Code, desc: "Code generation & review" },
  { id: "project" as ChatMode, name: " Project", icon: Rocket, desc: "Full project generation" },
  { id: "debug" as ChatMode, name: " Debug", icon: Bug, desc: "Error analysis & fixing" },
];

const AGENTS = [
  { id: "auto", name: "Auto Select", desc: "AI chooses best agent" },
  { id: "agent1", name: " Prompt Expander", desc: "Detailed specifications" },
  { id: "agent2", name: "Architecture Designer", desc: "System architecture" },
  { id: "agent3", name: "Backend Developer", desc: "Database & APIs" },
  { id: "agent4", name: " Frontend Developer", desc: "UI components" },
  { id: "agent5", name: "Integration Developer", desc: "Connect frontend-backend" },
  { id: "agent6", name: "✅ QA Engineer", desc: "Testing & quality" },
  { id: "agent7", name: " Optimization Expert", desc: "Performance & deployment" },
];

export default function EnhancedChatPage({ params }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Load chat history from API
    loadChatHistory();
  }, [params.session_id]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.session_id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
      mode,
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isStreaming: true,
      agentId: selectedAgent,
      mode,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: params.session_id,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          mode,
          agent_id: selectedAgent,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to AI");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data:")) continue;
          const data = line.replace(/^data:/, "").trim();
          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === "chunk" && parsed.content) {
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.role === "assistant") {
                  lastMsg.content += parsed.content;
                }
                return updated;
              });
            }

            if (parsed.type === "done") {
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg) {
                  lastMsg.isStreaming = false;
                }
                return updated;
              });
            }
          } catch (e) {
            console.warn("Failed to parse SSE data:", e);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          lastMsg.content = `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`;
          lastMsg.isStreaming = false;
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentAgent = AGENTS.find(a => a.id === selectedAgent) || AGENTS[0];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Mr.Prompt Chat</h1>
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  mode === m.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Agent Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAgentMenu(!showAgentMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium">{currentAgent.name}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showAgentMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowAgentMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                {AGENTS.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent.id);
                      setShowAgentMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                      selectedAgent === agent.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{agent.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Start a conversation
            </h2>
            <p className="text-gray-500">
              Choose a mode and agent, then type your message below
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-3xl rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");
                        const inline = props.inline;
                        
                        return !inline && match ? (
                          <div className="relative group">
                            <button
                              onClick={() => copyToClipboard(codeString, message.id + "-code")}
                              className="absolute right-2 top-2 p-2 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedId === message.id + "-code" ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-300" />
                              )}
                            </button>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Type your message in ${mode} mode...`}
              className="flex-1 resize-none border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
