import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Magnet from "./Magnet";
import { Button } from "./ui/button";
import { pipeline } from "@huggingface/transformers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface SentimentResult {
  label: string;
  score: number;
}

const AIHelper = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeSentiment = async (text: string) => {
    try {
      setIsAnalyzing(true);
      const classifier = await pipeline("sentiment-analysis", "distilbert/distilbert-base-uncased-finetuned-sst-2-english");
      const result = await classifier(text) as SentimentResult[];
      const classification = Array.isArray(result) ? result[0] : result;
      return classification.score > 0.5 ? "POSITIVE" : "NEGATIVE";
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const storeAIResponse = async (query: string, aiResponse: string, sentimentResult: string | null) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const { error } = await supabase.from("ai_responses").insert({
        user_id: user.id,
        query,
        response: aiResponse,
        sentiment: sentimentResult,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error storing AI response:", error);
      toast({
        title: "Error",
        description: "Failed to store the response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClick = async () => {
    setShowPopup(true);
    const query = "How can I help you?";
    const result = await analyzeSentiment(query);
    setSentiment(result);
    setResponse("I'm here to assist you with any questions or concerns you might have.");
    
    if (result) {
      await storeAIResponse(query, response || "", result);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 left-8 z-50">
        <Magnet
          padding={50}
          magnetStrength={50}
          wrapperClassName="cursor-pointer"
          onClick={handleClick}
        >
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            Need Help?
          </Button>
        </Magnet>
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl z-50 max-w-sm border border-purple-200 dark:border-purple-800"
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-300">
              How can I help you?
            </h3>
            {response && (
              <p className="text-gray-600 dark:text-gray-300">
                {response}
              </p>
            )}
            {isAnalyzing ? (
              <p className="mt-2 text-sm text-purple-600 dark:text-purple-400">
                Analyzing sentiment...
              </p>
            ) : sentiment && (
              <p className="mt-2 text-sm text-purple-600 dark:text-purple-400">
                Sentiment: {sentiment}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIHelper;