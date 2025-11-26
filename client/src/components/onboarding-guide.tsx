import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Wallet, 
  Scan, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ONBOARDING_KEY = "swg_onboarding_completed";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to Smart Wallet Guardian",
    description: "Your security layer for blockchain transactions",
    icon: <Shield className="h-12 w-12 text-primary" />,
    details: [
      "Protect your crypto assets from scams and malicious contracts",
      "Get real-time risk analysis for every transaction",
      "Make informed decisions with detailed threat detection",
    ],
  },
  {
    title: "Connect Your Wallet",
    description: "Securely link your Web3 wallet to get started",
    icon: <Wallet className="h-12 w-12 text-primary" />,
    details: [
      "We support MetaMask, Trust Wallet, and Coinbase Wallet",
      "Your private keys remain safe - we never access them",
      "Switch to Polygon network for the best experience",
    ],
  },
  {
    title: "Scan Before You Transact",
    description: "Analyze any transaction before signing",
    icon: <Scan className="h-12 w-12 text-primary" />,
    details: [
      "Click 'Scan Transaction' to analyze smart contracts",
      "Review risk scores and detailed threat analysis",
      "Block suspicious transactions with one click",
    ],
  },
  {
    title: "Understand Risk Levels",
    description: "Know what each risk score means",
    icon: <AlertTriangle className="h-12 w-12 text-primary" />,
    details: [
      "Green (0-39): Safe transactions with no detected threats",
      "Yellow (40-69): Medium risk - review carefully before proceeding",
      "Red (70-100): High risk - blocking recommended",
    ],
  },
  {
    title: "You're All Set!",
    description: "Start protecting your wallet today",
    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
    details: [
      "Monitor your transaction history in the dashboard",
      "Configure protection settings to match your needs",
      "Stay alert with real-time security notifications",
    ],
  },
];

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Skip</span>
        </button>

        <div className="mb-4">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Step {currentStep + 1} of {onboardingSteps.length}
          </p>
        </div>

        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              {step.icon}
            </div>
          </div>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {step.details.map((detail, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
            <Button onClick={handleNext} className="gap-1">
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useResetOnboarding() {
  return () => {
    localStorage.removeItem(ONBOARDING_KEY);
    window.location.reload();
  };
}
