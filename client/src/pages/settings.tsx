import { useState } from "react";
import { Settings, Shield, Bell, Zap, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    autoBlockHighRisk: true,
    notifyMediumRisk: true,
    notifyPhishing: true,
    notifyNewContracts: false,
    riskThreshold: [70],
    enableRealTimeScanning: true,
    enableContractAnalysis: true,
    enablePhishingDetection: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your protection settings have been updated.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-muted-foreground">Configure your wallet protection preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Protection Settings
            </CardTitle>
            <CardDescription>
              Configure how the AI protects your wallet from threats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="realtime">Real-time Transaction Scanning</Label>
                <p className="text-sm text-muted-foreground">
                  Analyze all transactions before they execute
                </p>
              </div>
              <Switch
                id="realtime"
                checked={settings.enableRealTimeScanning}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, enableRealTimeScanning: checked }))
                }
                data-testid="switch-realtime-scanning"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="contract">Smart Contract Analysis</Label>
                <p className="text-sm text-muted-foreground">
                  Deep bytecode analysis for honeypots and drainers
                </p>
              </div>
              <Switch
                id="contract"
                checked={settings.enableContractAnalysis}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, enableContractAnalysis: checked }))
                }
                data-testid="switch-contract-analysis"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="phishing">Phishing Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Check URLs and domains against known scam databases
                </p>
              </div>
              <Switch
                id="phishing"
                checked={settings.enablePhishingDetection}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, enablePhishingDetection: checked }))
                }
                data-testid="switch-phishing-detection"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Automatic Actions
            </CardTitle>
            <CardDescription>Configure automatic responses to detected threats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoblock">Auto-block High Risk Transactions</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically block transactions above the risk threshold
                </p>
              </div>
              <Switch
                id="autoblock"
                checked={settings.autoBlockHighRisk}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, autoBlockHighRisk: checked }))
                }
                data-testid="switch-auto-block"
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-0.5">
                <Label>Risk Threshold for Auto-block</Label>
                <p className="text-sm text-muted-foreground">
                  Transactions with risk scores above {settings.riskThreshold[0]} will be
                  auto-blocked
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={settings.riskThreshold}
                  onValueChange={(value) => setSettings((s) => ({ ...s, riskThreshold: value }))}
                  min={50}
                  max={100}
                  step={5}
                  className="flex-1"
                  data-testid="slider-risk-threshold"
                />
                <span className="w-12 text-center font-mono text-sm">
                  {settings.riskThreshold[0]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose what alerts you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-medium">Medium Risk Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about medium risk transactions
                </p>
              </div>
              <Switch
                id="notify-medium"
                checked={settings.notifyMediumRisk}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, notifyMediumRisk: checked }))
                }
                data-testid="switch-notify-medium"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-phishing">Phishing Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when phishing attempts are detected
                </p>
              </div>
              <Switch
                id="notify-phishing"
                checked={settings.notifyPhishing}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, notifyPhishing: checked }))
                }
                data-testid="switch-notify-phishing"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-contracts">New Contract Interactions</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when interacting with unverified contracts
                </p>
              </div>
              <Switch
                id="notify-contracts"
                checked={settings.notifyNewContracts}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, notifyNewContracts: checked }))
                }
                data-testid="switch-notify-contracts"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-high-risk/30 bg-high-risk/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-high-risk">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Proceed with caution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-high-risk">Disable All Protection</Label>
                <p className="text-sm text-muted-foreground">
                  This will disable all security features. Not recommended.
                </p>
              </div>
              <Button variant="destructive" size="sm" data-testid="button-disable-protection">
                Disable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2" data-testid="button-save-settings">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
