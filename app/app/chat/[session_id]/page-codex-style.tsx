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
  Plus,
  MessageSquare,
  Sparkles,
  Settings,
  Trash2,
  Edit3,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  agentId?: string;
  agentName?: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
}

interface ChatPageProps {
  params: { session_id: string };
}

const AGENTS = [
  { id: "auto", name: "🤖 Auto Select", nameEn: "Auto Select", nameTh: "เลือกอัตโนมัติ", color: "bg-blue-500" },
  { id: "agent1", name: " Prompt Expander", nameEn: "Prompt Expander", nameTh: "ขยายโปรมต์", color: "bg-purple-500" },
  { id: "agent2", name: "🏗️ Architecture Designer", nameEn: "Architecture Designer", nameTh: "ออกแบบสถาปัตยกรรม", color: "bg-green-500" },
  { id: "agent3", name: "💾 Backend Developer", nameEn: "Backend Developer", nameTh: "พัฒนา Backend", color: "bg-orange-500" },
  { id: "agent4", name: " Frontend Developer", nameEn: "Frontend Developer", nameTh: "พัฒนา Frontend", color: "bg-pink-500" },
  { id: "agent5", name: "🔗 Integration Developer", nameEn: "Integration Developer", nameTh: "พัฒนาการเชื่อมต่อ", color: "bg-cyan-500" },
  { id: "agent6", name: "✅ QA Engineer", nameEn: "QA Engineer", nameTh: "วิศวกร QA", color: "bg-yellow-500" },
  { id: "agent7", name: " Optimization Expert", nameEn: "Optimization Expert", nameTh: "ผู้เชี่ยวชาญเพิ่มประสิทธิภาพ", color: "bg-red-500" },
];

export default function CodexStyleChatPage({ params }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "th">("th");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
    loadSessions();
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

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const agent = AGENTS.find(a => a.id === selectedAgent) || AGENTS[0];
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isStreaming: true,
      agentId: selectedAgent,
      agentName: language === "th" ? agent.nameTh : agent.nameEn,
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
          lastMsg.content = `❌ ${language === "th" ? "เกิดข้อผิดพลาด" : "Error"}: ${error instanceof Error ? error.message : "Unknown error"}`;
          lastMsg.isStreaming = false;
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
      loadSessions(); // Refresh session list
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const createNewSession = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: language === "th" ? "แชทใหม่" : "New Chat" }),
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = `/app/chat/${data.session.id}`;
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const currentAgent = AGENTS.find(a => a.id === selectedAgent) || AGENTS[0];

  const t = {
    newChat: language === "th" ? "แชทใหม่" : "New Chat",
    chatHistory: language === "th" ? "ประวัติการแชท" : "Chat History",
    typeMessage: language === "th" ? "พิมพ์ข้อความของคุณ..." : "Type your message...",
    send: language === "th" ? "ส่ง" : "Send",
    selectAgent: language === "th" ? "เลือก Agent" : "Select Agent",
    aiResponding: language === "th" ? "กำลังตอบกลับ..." : "AI is responding...",
    startConversation: language === "th" ? "เริ่มการสนทนา" : "Start a conversation",
    chooseAgent: language === "th" ? "เลือก AI agent และพิมพ์ข้อความด้านล่าง" : "Choose an AI agent and type your message below",
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chat History */}
      <div className={`${sidebarCollapsed ? "w-0" : "w-64"} transition-all duration-300 bg-white border-r flex flex-col overflow-hidden`}>
        {!sidebarCollapsed && (
          <>
            <div className="p-4 border-b">
              <button
                onClick={createNewSession}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.newChat}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                {t.chatHistory}
              </h3>
              <div className="space-y-1 mt-2">
                {sessions.map((session) => (
                  <a
                    key={session.id}
                    href={`/app/chat/${session.id}`}
                    className={`block px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      session.id === params.session_id ? "bg-blue-50 border-l-2 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {session.title}
                        </div>
                        {session.lastMessage && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {session.lastMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setLanguage(language === "en" ? "th" : "en")}
                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                🌐 {language === "en" ? "ภาษาไทย" : "English"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-semibold">Mr.Prompt Chat</h1>
          </div>

          {/* Agent Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAgentMenu(!showAgentMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${currentAgent.color}`}></div>
              <span className="text-sm font-medium">
                {language === "th" ? currentAgent.nameTh : currentAgent.nameEn}
              </span>
              <Settings className="w-4 h-4 text-gray-400" />
            </button>

            {showAgentMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowAgentMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                  <div className="p-2 border-b">
                    <p className="text-xs text-gray-500 px-2">{t.selectAgent}</p>
                  </div>
                  {AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent.id);
                        setShowAgentMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        selectedAgent === agent.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${agent.color} flex-shrink-0`}></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {language === "th" ? agent.nameTh : agent.nameEn}
                        </div>
                      </div>
                      {selectedAgent === agent.id && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  {t.startConversation}
                </h2>
                <p className="text-gray-500">
                  {t.chooseAgent}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${AGENTS.find(a => a.id === message.agentId)?.color || "bg-gray-400"} flex items-center justify-center text-white font-semibold text-sm`}>
                      AI
                    </div>
                  </div>
                )}

                <div className={`flex-1 max-w-3xl ${message.role === "user" ? "flex justify-end" : ""}`}>
                  {message.role === "assistant" && message.agentName && (
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                      <span className="font-medium">{message.agentName}</span>
                      {message.isStreaming && (
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {t.aiResponding}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white border shadow-sm"
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
                                <div className="relative group my-4">
                                  <button
                                    onClick={() => copyToClipboard(codeString, message.id + "-code")}
                                    className="absolute right-2 top-2 p-2 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                                <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-sm`} {...props}>
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
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                      U
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 bg-gray-50 border rounded-xl p-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
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
                placeholder={t.typeMessage}
                className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 px-2 py-2 max-h-32"
                rows={1}
                disabled={isStreaming}
                style={{
                  minHeight: "40px",
                  maxHeight: "128px",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {language === "th" 
                ? "กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่" 
                : "Press Enter to send, Shift+Enter for new line"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
