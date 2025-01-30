import { motion } from "framer-motion";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AIHelper from "@/components/AIHelper";
import SkillAssessment from "@/components/SkillAssessment";
import LearningPath from "@/components/LearningPath";

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      <Header />
      <main className="container mx-auto px-4 space-y-16 py-8">
        <Hero />
        <Features />
        <section id="skill-assessment" className="py-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Test Your Knowledge
          </h2>
          <SkillAssessment />
        </section>
        <section id="learning-path" className="py-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Your Learning Journey
          </h2>
          <LearningPath />
        </section>
      </main>
      <AIHelper />
    </motion.div>
  );
};

export default Index;