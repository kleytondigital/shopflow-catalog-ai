import React from "react";
import {
  Check,
  Package,
  DollarSign,
  Image,
  Search,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

interface ImprovedWizardStepNavigationProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  completedSteps?: number[];
}

const stepIcons = {
  basic: Package,
  pricing: DollarSign,
  images: Image,
  seo: Search,
  advanced: Settings,
};

const ImprovedWizardStepNavigation: React.FC<
  ImprovedWizardStepNavigationProps
> = ({ steps, currentStep, onStepClick, completedSteps = [] }) => {
  return (
    <div className="border-b bg-gray-50/50">
      <div className="px-2 sm:px-6 py-2 sm:py-4">
        {/* Mobile Compact Navigation */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200",
                  "bg-primary border-primary text-white"
                )}
              >
                {completedSteps.includes(currentStep) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{currentStep + 1}</span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-primary truncate max-w-[150px]">
                  {steps[currentStep]?.title}
                </h4>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {steps[currentStep]?.description}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <span>{currentStep + 1}</span>
              <ChevronRight className="h-3 w-3 mx-1" />
              <span>{steps.length}</span>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex space-x-4 lg:space-x-8 overflow-x-auto">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = completedSteps.includes(index);
            const isClickable = index <= currentStep || isCompleted;
            const IconComponent =
              stepIcons[step.id as keyof typeof stepIcons] || Package;

            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center min-w-0 group transition-all duration-200 flex-shrink-0",
                  isClickable
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                )}
              >
                {/* Step Indicator */}
                <div className="flex items-center mb-2">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200",
                      isActive
                        ? "bg-primary border-primary text-white"
                        : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-gray-300 text-gray-500 group-hover:border-primary group-hover:text-primary"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 lg:w-16 h-0.5 ml-4 transition-colors duration-200",
                        index < currentStep || isCompleted
                          ? "bg-primary"
                          : "bg-gray-300"
                      )}
                    />
                  )}
                </div>

                {/* Step Info */}
                <div className="text-center min-w-0 max-w-[100px] lg:max-w-none">
                  <h4
                    className={cn(
                      "text-sm font-medium truncate transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-600 group-hover:text-primary"
                    )}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={cn(
                      "text-xs mt-1 truncate transition-colors duration-200 hidden lg:block",
                      isActive ? "text-primary/70" : "text-gray-500"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Desktop Progress Bar */}
        <div className="mt-4 hidden sm:block">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span>
              {Math.round(((currentStep + 1) / steps.length) * 100)}% concluído
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedWizardStepNavigation;
