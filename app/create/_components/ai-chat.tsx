"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AIChat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput("");
    await sendMessage({ text: currentInput });
  };

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 p-2 mb-4 scrollbar-thin scrollbar-thumb-primary/20"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-sm text-muted-foreground italic">
              &quot;Make the intro more exciting&quot;<br/>
              &quot;Change the background music to corporate style&quot;<br/>
              &quot;Make the overall tone more professional&quot;
            </p>
          </div>
        )}
        {messages.map((m: UIMessage) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 backdrop-blur-sm border border-white/10"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {m.parts
                  .map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted/30 rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 p-1">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask AI to modify video..."
          className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50 transition-all"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={isLoading || !input.trim()}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
