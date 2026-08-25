import { useState } from "react";
import "./Chat.css";
type Message = {
  role: "user" | "assistant";
  content: string;
};

function Chat() {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          history: messages,
        }),
      });

      const data = await response.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <section className="chat-page">
      <div className="chat-shell">

        {/* LEFT SIDEBAR */}
        <aside className="chat-sidebar">

          <button
            className="new-chat-button"
            onClick={startNewChat}
          >
            <span>＋</span>
            New Chat
          </button>

          <div className="chat-history">
            <h3>My Chats</h3>

            {messages.length === 0 ? (
              <p className="empty-history">
                Your conversations will appear here.
              </p>
            ) : (
              <button className="history-item">
                {messages.find((msg) => msg.role === "user")?.content ||
                  "New conversation"}
              </button>
            )}
          </div>

        </aside>

        {/* MAIN CHAT */}
        <main className="chat-main">

          {/* HEADER */}
          <header className="chat-header">
            <div>
              <h1>AI Career Chat</h1>
              <p>Your developer career companion.</p>
            </div>

            <div className="ai-status">
              <span className="status-dot"></span>
              Online
            </div>
          </header>

          {/* MESSAGES */}
          <div className="messages-container">

            {messages.length === 0 && (
              <div className="chat-welcome">

                <div className="welcome-orb">
                  ✦
                </div>

                <h2>
                  What are you building today?
                </h2>

                <p>
                  Ask De Zéro about coding, DSA, projects,
                  interviews, resumes, or your career roadmap.
                </p>

                <div className="suggestions">
                  <button
                    onClick={() => setMessage("How should I learn DSA?")}
                  >
                    How should I learn DSA?
                  </button>

                  <button
                    onClick={() => setMessage("How do I become a better React developer?")}
                  >
                    Become a better React developer
                  </button>

                  <button
                    onClick={() => setMessage("How can I build my first portfolio project?")}
                  >
                    Build my first portfolio
                  </button>
                </div>

              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${
                  msg.role === "user" ? "user-row" : "assistant-row"
                }`}
              >

                {msg.role === "assistant" && (
                  <div className="avatar">
                    ✦
                  </div>
                )}

                <div className="message-content">

                  <span className="message-name">
                    {msg.role === "user" ? "You" : "De Zéro"}
                  </span>

                  <div
                    className={`message-bubble ${
                      msg.role === "user"
                        ? "user-bubble"
                        : "assistant-bubble"
                    }`}
                  >
                    {msg.content}
                  </div>

                </div>

              </div>
            ))}

          </div>

          {/* INPUT */}
          <div className="chat-input-area">

            <div className="chat-input-wrapper">

              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask De Zéro anything..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                className="send-button"
                onClick={sendMessage}
                disabled={!message.trim()}
              >
                ↑
              </button>

            </div>

            <p className="input-hint">
              De Zéro can help with coding, careers, projects and interviews.
            </p>

          </div>

        </main>

      </div>
    </section>
  );
}

export default Chat;