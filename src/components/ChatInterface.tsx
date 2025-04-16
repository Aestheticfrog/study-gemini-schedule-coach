
import { useState, useRef, useEffect } from "react";
import { Send, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, Schedule } from "@/lib/types";
import { callGeminiAPI } from "@/lib/api";
import { saveChatMessage, getChatHistory } from "@/lib/storage";

interface ChatInterfaceProps {
  currentSchedule: Schedule;
  onScheduleUpdated: (scheduleId: string, newContent: string) => void;
}

export default function ChatInterface({ currentSchedule, onScheduleUpdated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load chat history on component mount
  useEffect(() => {
    const history = getChatHistory();
    setMessages(history);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    saveChatMessage(userMessage);
    setInput("");
    setIsLoading(true);
    
    try {
      const prompt = `
As a study coach assistant, please respond to the following request:
"${input}"

Here is the current study schedule:
${currentSchedule.content}

If this request involves modifying the schedule, please provide:
1. A brief response explaining what changes you're making
2. The COMPLETE updated schedule with all modifications incorporated

If it's just a general question, please provide a helpful response.
`;
      
      const response = await callGeminiAPI(prompt);
      
      const botMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
      saveChatMessage(botMessage);
      
      // Check if the response contains schedule modifications
      if (response.includes("updated schedule") || response.includes("modified schedule")) {
        // Try to extract the updated schedule
        // This is a simple approach - in a real app, you might want more sophisticated parsing
        const scheduleStartMarkers = [
          "Here is the updated schedule:",
          "Updated Schedule:",
          "Modified Schedule:",
          "New Schedule:"
        ];
        
        let updatedScheduleContent = null;
        
        for (const marker of scheduleStartMarkers) {
          if (response.includes(marker)) {
            updatedScheduleContent = response.substring(response.indexOf(marker) + marker.length).trim();
            break;
          }
        }
        
        if (updatedScheduleContent) {
          // Update the schedule
          onScheduleUpdated(currentSchedule.id, updatedScheduleContent);
          
          toast({
            title: "Schedule Updated",
            description: "Your study schedule has been updated based on your request",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to get response: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      saveChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Chat with Your Study Coach</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions or request changes to your schedule
        </p>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-60 text-center">
              <div className="space-y-2">
                <p className="text-lg font-medium">Welcome to your Study Coach!</p>
                <p className="text-sm text-muted-foreground">
                  You can ask me to modify your schedule or answer questions about your studies
                </p>
              </div>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-xs mt-1 ${
                  msg.role === "user" 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                }`}>
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-lg p-3 flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
          
          {/* This div is used to scroll to bottom */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
