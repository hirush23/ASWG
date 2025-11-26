import { 
  Shield, 
  Wallet, 
  Scan, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  FileText,
  Zap,
  Lock,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const gettingStartedSteps = [
  {
    step: 1,
    title: "Install a Web3 Wallet",
    description: "Install MetaMask, Trust Wallet, or Coinbase Wallet in your browser.",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    step: 2,
    title: "Connect Your Wallet",
    description: "Click 'Connect Wallet' in the header and approve the connection request.",
    icon: <Lock className="h-5 w-5" />,
  },
  {
    step: 3,
    title: "Switch to Polygon Network",
    description: "Ensure you're connected to the Polygon network for optimal protection.",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    step: 4,
    title: "Start Scanning Transactions",
    description: "Use the 'Scan Transaction' button to analyze any transaction before executing it.",
    icon: <Scan className="h-5 w-5" />,
  },
];

const features = [
  {
    title: "Smart Contract Analysis",
    description: "Deep bytecode analysis detects honeypots, drainers, and rug pull patterns before you interact with any smart contract.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Phishing Detection",
    description: "Real-time URL and domain checking against known scam databases to protect your assets from phishing attempts.",
    icon: <AlertTriangle className="h-6 w-6" />,
  },
  {
    title: "Risk Scoring",
    description: "Advanced risk scoring from 0-100 with detailed reasoning for every transaction, helping you make informed decisions.",
    icon: <CheckCircle className="h-6 w-6" />,
  },
  {
    title: "Auto-Block Protection",
    description: "Automatically block high-risk transactions with configurable protection settings based on your risk tolerance.",
    icon: <Shield className="h-6 w-6" />,
  },
];

const faqs = [
  {
    question: "What is Smart Wallet Guardian?",
    answer: "Smart Wallet Guardian is a blockchain security application that provides real-time transaction analysis and threat detection for cryptocurrency wallets on the Polygon network. It helps protect your assets from scams, phishing attempts, and malicious smart contracts."
  },
  {
    question: "How does the risk scoring work?",
    answer: "Our risk scoring system analyzes multiple factors including smart contract bytecode patterns, transaction history, destination address reputation, and known phishing indicators. Scores range from 0 (completely safe) to 100 (extremely dangerous), with detailed explanations for each assessment."
  },
  {
    question: "Which networks are supported?",
    answer: "Currently, Smart Wallet Guardian supports the Polygon mainnet (Chain ID 137) and Polygon testnet (Chain ID 80001). We're working on adding support for additional networks in the future."
  },
  {
    question: "Do I need to pay to use this service?",
    answer: "Basic protection features are free to use. Simply connect your Web3 wallet and start scanning transactions. Premium features with enhanced protection may be available in future updates."
  },
  {
    question: "Is my wallet data safe?",
    answer: "Yes, we never store your private keys or have access to your funds. We only analyze transaction data that you submit for scanning. Your wallet remains fully under your control at all times."
  },
  {
    question: "What should I do if a transaction is flagged as high risk?",
    answer: "If a transaction is flagged as high risk, carefully review the detailed analysis and threat indicators. Consider blocking the transaction if the risks outweigh the benefits. When in doubt, it's always safer to avoid suspicious transactions."
  },
  {
    question: "How do I report a false positive?",
    answer: "If you believe a transaction was incorrectly flagged, you can still approve it after reviewing the analysis. We continuously improve our detection algorithms based on feedback and new threat patterns."
  },
];

const riskLevels = [
  {
    level: "Safe",
    score: "0-39",
    color: "bg-green-500",
    description: "Transaction appears safe with no detected threats. Standard precautions still apply.",
  },
  {
    level: "Medium",
    score: "40-69",
    color: "bg-yellow-500",
    description: "Some risk indicators detected. Review the analysis carefully before proceeding.",
  },
  {
    level: "High",
    score: "70-100",
    color: "bg-red-500",
    description: "Significant threats detected. Strongly recommend blocking this transaction.",
  },
];

export default function DocumentationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to use Smart Wallet Guardian to protect your crypto assets.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {gettingStartedSteps.map((step) => (
            <Card key={step.step}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">Step {step.step}</Badge>
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Understanding Risk Levels</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {riskLevels.map((risk) => (
                <div key={risk.level} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className={`w-4 h-4 rounded-full ${risk.color} mt-1 shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{risk.level}</span>
                      <Badge variant="outline">{risk.score}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Frequently Asked Questions
          </div>
        </h2>
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold mb-1">Contact Support</h3>
                <p className="text-sm text-muted-foreground">
                  Have questions or need assistance? Our team is here to help.
                </p>
              </div>
              <a 
                href="mailto:support@smartwalletguardian.com"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Get in touch
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
