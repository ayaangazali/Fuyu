import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI strategy assistant. I can help you configure trading strategies, add indicators, and optimize your rules. What would you like to build?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand you want to configure that strategy. Let me help you set up the indicators and rules. Would you like to start with the Dual Thrust parameters?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full border border-border/50 rounded-lg bg-card/40 backdrop-blur-sm overflow-hidden">
      <div className="border-b border-border/50 p-4 bg-muted/30">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Strategy Assistant
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Configure your trading strategy with AI guidance</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-up ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary/20 border border-primary/50 text-foreground"
                    : "bg-muted/50 border border-border/50 text-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/50 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-4 bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-background/50 border-border/50 focus:border-primary transition-colors"
          />
          <Button
            onClick={handleSend}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(0,217,255,0.3)] hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
