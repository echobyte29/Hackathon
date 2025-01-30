import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Json } from "@/integrations/supabase/types";

interface LearningPath {
  id: string;
  subject: string;
  current_level: number;
  recommended_topics: string[];
  last_updated: string;
  user_id: string;
}

const LearningPath = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const { data, error } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Transform the data to ensure recommended_topics is always a string array
      const transformedData = (data || []).map(path => ({
        ...path,
        recommended_topics: Array.isArray(path.recommended_topics) 
          ? path.recommended_topics.map(topic => String(topic))
          : ["Introduction", "Basic Concepts", "Practice Exercises"]
      })) as LearningPath[];

      setPaths(transformedData);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      toast({
        title: "Error",
        description: "Failed to load learning paths.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewPath = async (subject: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const { error } = await supabase.from("learning_paths").insert({
        user_id: user.id,
        subject,
        current_level: 1,
        recommended_topics: ["Introduction", "Basic Concepts", "Practice Exercises"],
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `New learning path created for ${subject}!`,
      });

      fetchLearningPaths();
    } catch (error) {
      console.error("Error creating learning path:", error);
      toast({
        title: "Error",
        description: "Failed to create learning path.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Your Learning Paths
        </h2>
        <Button
          onClick={() => createNewPath("Mathematics")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Start New Path
        </Button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : paths.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          No learning paths yet. Start one by clicking the button above!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {paths.map((path) => (
            <motion.div
              key={path.id}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {path.subject}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Current Level: {path.current_level}
              </p>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-200">
                  Recommended Topics:
                </h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {path.recommended_topics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LearningPath;