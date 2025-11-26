import { Link } from "wouter";
import {
  Shield,
  Scan,
  Brain,
  Zap,
  FileCode,
  AlertTriangle,
  BarChart3,
  Ban,
  CheckCircle,
  Users,
  ArrowRight,
  Github,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletButton } from "@/components/wallet-button";
import heroImage from "@assets/generated_images/abstract_blockchain_security_hero.png";

const features = [
  {
    icon: <FileCode className="h-6 w-6" />,
    title: "Smart Contract Analysis",
    description:
      "Deep bytecode analysis detects honeypots, drainers, and rug pull patterns before you interact.",
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: "Phishing Detection",
    description:
      "Real-time URL and domain checking against known scam databases to protect your assets.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Transaction Scoring",
    description:
      "AI-powered risk scoring from 0-100 with detailed reasoning for every transaction.",
  },
  {
    icon: <Ban className="h-6 w-6" />,
    title: "Auto-Block",
    description:
      "Automatically block high-risk transactions with one-click protection settings.",
  },
];

const howItWorks = [
  {
    icon: <Scan className="h-8 w-8" />,
    title: "Real-time Scanning",
    description: "Every transaction is intercepted and analyzed before execution.",
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI Analysis",
    description: "Advanced AI models evaluate contract code, patterns, and risk signals.",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Instant Protection",
    description: "Get immediate alerts and block malicious transactions automatically.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              <span className="text-lg font-semibold">ASWG</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center pt-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 md:py-24">
            <div className="max-w-3xl space-y-6">
              <Badge
                variant="secondary"
                className="backdrop-blur-md bg-primary/20 text-primary-foreground border-primary/30"
              >
                Built on Polygon PoS
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Protect Your Web3 Wallet with AI
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
                Real-time AI security layer that analyzes smart contracts, detects phishing, and
                blocks malicious transactions before they drain your assets.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="gap-2 backdrop-blur-md"
                    data-testid="button-launch-dashboard"
                  >
                    Launch Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
                  data-testid="button-view-demo"
                >
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to protect your wallet from scams and malicious contracts.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <div
                  key={step.title}
                  className="text-center space-y-4"
                  data-testid={`step-${index + 1}`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive protection powered by advanced AI and blockchain analysis.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="overflow-visible"
                  data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <Card className="overflow-visible">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-safe/10 text-safe">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl md:text-5xl font-bold">1.2M+</p>
                    <p className="text-muted-foreground">Transactions Protected</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-visible">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl md:text-5xl font-bold">50K+</p>
                    <p className="text-muted-foreground">Active Users</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg
                  viewBox="0 0 38 33"
                  fill="none"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M28.5 0L17.1 6.6L19 10.9L28.5 5.5V0Z"
                    fill="#8247E5"
                  />
                  <path
                    d="M28.5 0V5.5L38 11V5.5L28.5 0Z"
                    fill="#8247E5"
                  />
                  <path
                    d="M38 11L28.5 5.5V16.5L38 22V11Z"
                    fill="#8247E5"
                  />
                  <path
                    d="M28.5 27.5V16.5L19 22V27.5L28.5 33V27.5Z"
                    fill="#8247E5"
                  />
                  <path
                    d="M19 27.5V22L9.5 16.5V27.5L19 33V27.5Z"
                    fill="#8247E5"
                  />
                  <path
                    d="M9.5 16.5L0 11V22L9.5 27.5V16.5Z"
                    fill="#8247E5"
                  />
                  <path
                    d="M0 11L9.5 5.5V0L0 5.5V11Z"
                    fill="#8247E5"
                  />
                  <path
                    d="M9.5 0V5.5L19 11V5.5L9.5 0Z"
                    fill="#8247E5"
                  />
                  <path
                    d="M19 11L9.5 5.5L0 11L9.5 16.5L19 11Z"
                    fill="#8247E5"
                  />
                </svg>
              </div>
              <Badge
                variant="secondary"
                className="text-sm bg-purple-500/10 text-purple-400 border-purple-500/30"
              >
                Built on Polygon PoS
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Leveraging Polygon's fast, low-cost infrastructure for real-time transaction
              monitoring and protection.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-primary/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Start Protecting Your Wallet Today
            </h2>
            <p className="text-muted-foreground">
              Connect your wallet and enable AI-powered protection in seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2" data-testid="button-get-started">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Smart Wallet Guardian</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Polygon PoS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
