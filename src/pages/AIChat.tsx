import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

const AIChat = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [conversations, setConversations] = useState<{ question: string; answer: string }[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: { query: query.trim() }
      });

      if (error) throw error;

      if (!data?.answer) {
        throw new Error('No response received from AI');
      }

      setConversations(prev => [...prev, { question: query, answer: data.answer }]);
      setQuery("");
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-gray-900"
          >
            AI Assistant
          </motion.div>
          
          <div className="flex-1 max-w-xl mx-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask me anything about math or coding..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="bg-mint-500 hover:bg-mint-600 text-white"
              >
                {isSearching ? "Searching..." : "Ask AI"}
              </Button>
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </Button>
        </div>
      </motion.header>

      {/* Main Content - Conversations */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="space-y-6">
            {conversations.map((conv, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {/* Question */}
                <div className="flex justify-end mb-2">
                  <div className="bg-mint-500 text-white rounded-lg px-4 py-2 max-w-[80%]">
                    {conv.question}
                  </div>
                </div>
                {/* Answer */}
                <div className="flex justify-start">
                  <div className="bg-white shadow-md rounded-lg px-4 py-2 max-w-[80%]">
                    {conv.answer}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AIChat;