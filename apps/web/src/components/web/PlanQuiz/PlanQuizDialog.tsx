"use client";

import { useState } from "react";

const quizQuestions = [
  {
    id: 1,
    question: "What's your current property portfolio size?",
    options: [
      "Just getting started, only a few properties",
      "We have a small portfolio and growing",
      "We manage a large portfolio of branded residences",
    ],
  },
  {
    id: 2,
    question: "What's your primary goal for joining the platform?",
    options: [
      "Listing and getting visibility",
      "Generating qualified leads",
      "Comprehensive marketing and property exposure",
    ],
  },
  {
    id: 3,
    question:
      "Are you looking for hands-on support with marketing and strategy?",
    options: [
      "No, we prefer managing things myself",
      "Some support would be helpful",
      "Yes, we need full guidance and strategy",
    ],
  },
  {
    id: 4,
    question: "Do you have a marketing budget for property exposure?",
    options: [
      "No, we are just starting out",
      "We have a small budget",
      "Yes, we are ready to invest in advanced marketing",
    ],
  },
  {
    id: 5,
    question: "Do you believe your branded residence is a top-tier property?",
    options: [
      "Yes, it's one of the best in its category",
      "It's high quality, but there's room for improvement",
      "Not yet, but we are working on elevating it",
    ],
  },
  {
    id: 6,
    question: "What kind of marketing structure works best for you?",
    options: [
      "Flat monthly fee",
      "Flat monthly fee + performance-based (based on results)",
    ],
  },
  {
    id: 7,
    question: "What's the average price per unit for your property?",
    options: ["Below $1 million", "$1-5 million", "Above $5 million"],
  },
  {
    id: 8,
    question: "Would you like to list individual units for sale with us?",
    options: [
      "No, just promoting the residence for now",
      "Yes, listing units is a priority for me",
    ],
  },
  {
    id: 9,
    question: "Do you want access to leads from affluent buyers?",
    options: [
      "Yes, lead generation is crucial for me",
      "Not yet, I'm more focused on visibility for now",
    ],
  },
  {
    id: 10,
    question:
      "Would you like a paid visit from our team to better understand and showcase your property, potentially improving your rankings?",
    options: [
      "Yes, we'd love to host you! Seeing it in person will give you full confidence in ranking us higher",
      "Yes, but let's do it virtually. We're on a tighter budget, but you'll still get a great view of our property",
      "No, we don't have the budget for this right now",
    ],
  },
];

interface PlanQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlanQuizDialog = ({ isOpen, onClose }: PlanQuizDialogProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz completed - you can handle the results here
      console.log("Quiz completed:", selectedAnswers);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onClose();
    }
  };

  const currentQuestionData = quizQuestions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / quizQuestions.length) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Left Panel - Information */}
          <div className="w-1/2 bg-[#F5F5F4] p-8 flex flex-col">
            <button 
              onClick={handleBack}
              className="text-[#8B7355] text-sm mb-6 self-start hover:underline"
            >
              ← Return back
            </button>
            
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Find the Perfect Plan for Your Branded Residence
            </h2>
            
            <p className="text-gray-700 leading-relaxed">
              Struggling to choose the right plan? Let us help you cut through the confusion and find the plan that fits your residence and drives results.
            </p>
          </div>

          {/* Right Panel - Quiz */}
          <div className="w-1/2 bg-white p-8 flex flex-col">
            {/* Progress */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">
                {String(currentQuestion + 1).padStart(2, '0')} / {String(quizQuestions.length).padStart(2, '0')}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-[#8B7355] h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              {currentQuestionData.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-8 flex-1">
              {currentQuestionData.options.map((option, index) => (
                <label 
                  key={index}
                  className={`block p-4 border rounded-lg cursor-pointer transition-all hover:border-[#8B7355] ${
                    selectedAnswers[currentQuestion] === option 
                      ? 'border-[#8B7355] bg-[#8B7355]/5' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[currentQuestion] === option 
                        ? 'border-[#8B7355]' 
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers[currentQuestion] === option && (
                        <div className="w-2 h-2 bg-[#8B7355] rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </div>
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={selectedAnswers[currentQuestion] === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>

            {/* Navigation Button */}
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestion]}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                selectedAnswers[currentQuestion]
                  ? 'bg-blue-900 text-white hover:bg-blue-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Get Results' : 'Next'}
              {currentQuestion < quizQuestions.length - 1 && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanQuizDialog; 