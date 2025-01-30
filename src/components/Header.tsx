import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Success",
        description: "You have been signed out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: { 
          query: query.trim(),
          userId: user?.id 
        }
      });

      if (error) throw error;

      if (!data?.answer) {
        throw new Error('No response received from AI');
      }

      // Store the AI response in the database
      const { error: storeError } = await supabase
        .from('ai_responses')
        .insert({
          user_id: user?.id,
          query: query.trim(),
          response: data.answer,
          sentiment: null // You can add sentiment analysis here if needed
        });

      if (storeError) throw storeError;

      toast({
        title: "AI Response",
        description: data.answer,
        duration: 10000,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "AI Service Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
      setQuery("");
    }
  };

  return (
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
          SmartKids
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

        <div className="flex items-center space-x-4">
          {user ? (
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="hidden md:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                className="bg-mint-500 hover:bg-mint-600 text-white"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;