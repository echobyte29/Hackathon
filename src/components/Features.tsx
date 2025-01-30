import { motion } from "framer-motion";
import { Brain, Code, Target, Users } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Adaptive Learning",
    description: "Personalized learning paths that adapt to each student's progress and understanding."
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "Interactive Coding",
    description: "Hands-on coding experiences with real-time feedback and guidance."
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Goal Tracking",
    description: "Set and track learning goals with detailed progress analytics."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Collaborative Learning",
    description: "Connect with peers and engage in group learning activities."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Young Minds
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the tools that make learning mathematics and coding an exciting journey
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-mint-50 rounded-lg flex items-center justify-center text-mint-500 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;