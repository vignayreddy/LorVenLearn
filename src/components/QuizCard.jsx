import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizCard({ quiz, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const questions = quiz || [];

  const handleOptionSelect = (index) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete(score + (selectedOption === questions[currentQuestion].correctAnswer ? 1 : 0));
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  if (!questions.length) {
    return <div className="p-8 text-center text-zinc-500 font-medium italic">No quiz questions available for this module.</div>;
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 text-center bg-white rounded-3xl border border-zinc-100 shadow-xl"
      >
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-2xl font-black text-zinc-900 mb-2">Knowledge Check Complete!</h3>
        <p className="text-zinc-500 font-medium mb-8">You scored {score} out of {questions.length} ({percentage}%)</p>
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={resetQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-all"
          >
            <RefreshCcw className="w-4 h-4" /> Retake Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <div className="h-1.5 w-32 bg-zinc-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-500" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold text-zinc-900 leading-tight">{q.question}</h3>

      <div className="grid gap-3">
        {q.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === q.correctAnswer;
          
          let cardStyle = "bg-white border-zinc-200 hover:border-zinc-400";
          if (showResult) {
            if (isCorrect) cardStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm shadow-emerald-500/10";
            else if (isSelected) cardStyle = "bg-rose-50 border-rose-500 text-rose-900";
            else cardStyle = "bg-white border-zinc-100 opacity-50";
          } else if (isSelected) {
            cardStyle = "bg-zinc-900 border-zinc-900 text-white shadow-lg";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={showResult}
              className={`p-5 rounded-2xl border text-left font-bold text-[14px] transition-all flex items-center justify-between group ${cardStyle}`}
            >
              <span>{option}</span>
              {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
          >
            <div className="flex items-center gap-3">
              {selectedOption === q.correctAnswer ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> That's correct!
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <XCircle className="w-4 h-4" /> Not quite. The correct answer was {q.options[q.correctAnswer]}.
                </div>
              )}
            </div>
            <button 
              onClick={handleNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Test"} <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
