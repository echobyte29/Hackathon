import { useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { motion } from "framer-motion";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
  },
  {
    id: 2,
    text: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
  },
];

const SkillAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleAnswer = async (selectedAnswer: number) => {
    const correct = selectedAnswer === sampleQuestions[currentQuestion].correctAnswer;
    if (correct) setScore(score + 1);

    if (currentQuestion + 1 < sampleQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      await saveAssessment();
    }
  };

  const saveAssessment = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const { error } = await supabase.from("skill_assessments").insert({
        user_id: user.id,
        subject: "General Knowledge",
        score: (score / sampleQuestions.length) * 100,
      });

      if (error) throw error;

      toast({
        title: "Assessment Completed",
        description: "Your results have been saved!",
      });
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Error",
        description: "Failed to save assessment results.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      {!showResults ? (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Question {currentQuestion + 1} of {sampleQuestions.length}
          </h2>
          <p className="text-lg mb-6 text-gray-700 dark:text-gray-200">
            {sampleQuestions[currentQuestion].text}
          </p>
          <div className="space-y-3">
            {sampleQuestions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left justify-start hover:bg-purple-600"
                variant="outline"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Assessment Complete!
          </h2>
          <p className="text-lg mb-4 text-gray-700 dark:text-gray-200">
            Your score: {score} out of {sampleQuestions.length}
          </p>
          <Button
            onClick={() => {
              setCurrentQuestion(0);
              setScore(0);
              setShowResults(false);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Try Again
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default SkillAssessment;