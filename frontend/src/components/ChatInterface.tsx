import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatInterfaceProps {
  strategy: any; // Using any for flexibility
}

export const ChatInterface = ({ strategy }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI strategy assistant. I can help you analyze and optimize your trading strategy. Ask me anything about the current configuration!",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [includeMarketData, setIncludeMarketData] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newUserMessage.text,
          strategy: strategy,
          includeMarketData: includeMarketData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();

      const newAiMessage: Message = {
        id: messages.length + 2,
        text: data.response,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting to the server. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-border/50 bg-card/50 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center border border-neon-purple/50">
          <Bot className="w-5 h-5 text-neon-purple" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">AI Strategy Assistant</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Online
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg
                    ${
                      message.sender === "user"
                        ? "bg-neon-cyan/10 border border-neon-cyan/30 text-foreground rounded-tr-none"
                        : "bg-card/80 border border-border/50 text-foreground rounded-tl-none"
                    }
                  `}
                >
                  {message.text}
                  <div className="text-[10px] opacity-50 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-card/80 border border-border/50 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-neon-purple/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-neon-purple/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-neon-purple/50 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-card/50 border-t border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIncludeMarketData(!includeMarketData)}
            className={`text-xs transition-all ${
              includeMarketData 
                ? "bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan" 
                : "bg-background/50 border-border/50 text-muted-foreground"
            }`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {includeMarketData ? "Market Data ON" : "Market Data OFF"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {includeMarketData ? "Includes live market context" : "Normal chat mode"}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your strategy..."
            className="bg-background/50 border-border/50 focus:border-neon-cyan/50 transition-colors"
          />
          <Button 
            onClick={handleSend}
            size="icon"
            className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_10px_rgba(0,217,255,0.2)]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
