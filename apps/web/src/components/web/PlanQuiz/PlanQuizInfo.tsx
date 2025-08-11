"use client";

interface PlanQuizInfoProps {
  onTakeQuiz: () => void;
}

const PlanQuizInfo = ({ onTakeQuiz }: PlanQuizInfoProps) => {
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-blue-100/20 rounded-2xl backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 text-center">
          Need Help Choosing a Plan?
        </h2>
        
        {/* Description */}
        <p className="text-gray-700 text-center mb-6 leading-relaxed">
          Discover the plan that will maximize your property&apos;s exposure, generate leads, and drive more sales. Answer a few simple questions to get started.
        </p>
        
        {/* Bullet points */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700 text-sm">
              Save time by quickly identifying the best plan for your business needs.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700 text-sm">
              Get a tailored recommendation based on your property portfolio and goals.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700 text-sm">
              Find out which plan offers the best value based on your marketing budget and goals.
            </p>
          </div>
        </div>
        
        {/* CTA Button */}
        <button 
          onClick={onTakeQuiz}
          className="w-full bg-blue-950 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-900 transition-colors duration-200"
        >
          Take The Quiz
        </button>
      </div>
    </div>
  );
};

export default PlanQuizInfo; 