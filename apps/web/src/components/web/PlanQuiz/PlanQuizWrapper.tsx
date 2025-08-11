"use client";

import { useState } from "react";
import PlanQuizInfo from "./PlanQuizInfo";
import PlanQuizDialog from "./PlanQuizDialog";

const PlanQuizWrapper = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <>
      <PlanQuizInfo onTakeQuiz={() => setIsQuizOpen(true)} />
      <PlanQuizDialog 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
      />
    </>
  );
};

export default PlanQuizWrapper; 