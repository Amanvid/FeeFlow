
"use client";

import { useState } from "react";
import type { Student } from "@/lib/definitions";
import UserInfoForm from "@/components/fee-flow/user-info-form";
import ClassSelection from "@/components/fee-flow/class-selection";
import StudentSelection from "@/components/fee-flow/student-selection";
import FeeResult from "@/components/fee-flow/fee-result";
import { AnimatePresence, motion } from "framer-motion";

type Step = "USER_INFO" | "CLASS_SELECTION" | "STUDENT_SELECTION" | "FEE_RESULT";

export default function CheckFeesPage() {
  // Start at the USER_INFO step
  const [step, setStep] = useState<Step>("USER_INFO");
  
  const [userInfo, setUserInfo] = useState<{ name: string; phone: string; relationship: string; } | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleUserVerified = (name: string, phone: string) => {
    setUserInfo({ name, phone, relationship: "" }); // relationship will be added later
    setStep("CLASS_SELECTION");
  };

  const handleClassSelected = (className: string) => {
    setSelectedClass(className);
    setStep("STUDENT_SELECTION");
  };

  const handleStudentSelected = (student: Student, relationship: string) => {
    setSelectedStudent(student);
    setUserInfo(prev => ({...prev!, relationship: relationship}));
    setStep("FEE_RESULT");
  };

  const handleBack = () => {
    if (step === "STUDENT_SELECTION") {
      setStep("CLASS_SELECTION");
      setSelectedClass(null);
    } else if (step === "CLASS_SELECTION") {
      setStep("USER_INFO");
      setUserInfo(null);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case "USER_INFO":
        return <UserInfoForm onVerified={handleUserVerified} />;
      case "CLASS_SELECTION":
        return <ClassSelection onClassSelected={handleClassSelected} />;
      case "STUDENT_SELECTION":
        return (
          <StudentSelection
            className={selectedClass!}
            onStudentSelected={handleStudentSelected}
            onBack={handleBack}
          />
        );
      case "FEE_RESULT":
        return <FeeResult student={selectedStudent!} userInfo={userInfo!} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
