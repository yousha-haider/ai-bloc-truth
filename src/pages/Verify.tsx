import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Link as LinkIcon,
  Loader2,
  Shield,
  Type,
  Upload,
  XCircle
} from "lucide-react";
import { useState } from "react";

interface VerificationResult {
  status: 'real' | 'fake' | 'uncertain';
  confidence: number;
  blockchainHash: string;
  analysis: {
    credibilityScore: number;
    languagePattern: string;
    factCheck: string;
    sourceReliability: string;
  };
  timestamp: string;
}

const Verify = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleVerification = async () => {
    // Validate based on active input method
    if (activeTab === "text" && !inputText.trim()) {
      toast({
        title: "Text Required",
        description: "Please paste the news article text to verify.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "url" && !inputUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a news article URL to verify.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    // Build payload: backend will either use raw text or fetch the article from the URL
    const payload = {
      inputType: activeTab === "url" ? "url" : "text",
      ...(activeTab === "url" ? { url: inputUrl.trim() } : { text: inputText.trim() }),
      userId: user?.id || null,
    };

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      // Expecting your backend to return fields compatible with VerificationResult
      // If names differ, map them here accordingly.
      const normalized: VerificationResult = {
        status: data.status ?? 'uncertain',
        confidence: Number(data.confidence ?? 0),
        blockchainHash: String(data.blockchainHash ?? ''),
        analysis: {
          credibilityScore: Number(data.analysis?.credibilityScore ?? 0),
          languagePattern: String(data.analysis?.languagePattern ?? ''),
          factCheck: String(data.analysis?.factCheck ?? ''),
          sourceReliability: String(data.analysis?.sourceReliability ?? ''),
        },
        timestamp: data.timestamp ?? new Date().toISOString(),
      };

      setResult(normalized);
      toast({
        title: "Verification Complete",
        description: `News article verified with ${normalized.confidence}% confidence.`
      });
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err?.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyBlockchainHash = () => {
    if (result?.blockchainHash) {
      navigator.clipboard.writeText(result.blockchainHash);
      toast({
        title: "Copied!",
        description: "Blockchain hash copied to clipboard."
      });
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Verify News Authenticity</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Submit news content for AI-powered analysis and blockchain-verified authenticity scoring.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Submit Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" className="flex items-center space-x-1">
                      <Type className="h-4 w-4" />
                      <span>Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center space-x-1">
                      <LinkIcon className="h-4 w-4" />
                      <span>URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="file" className="flex items-center space-x-1">
                      <Upload className="h-4 w-4" />
                      <span>File</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div>
                      <Label htmlFor="news-text">News Article Text</Label>
                      <Textarea
                        id="news-text"
                        placeholder="Paste the news article content here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[200px] mt-2"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <Label htmlFor="news-url">News Article URL</Label>
                      <Input
                        id="news-url"
                        type="url"
                        placeholder="https://example.com/news-article"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <div>
                      <Label>Upload Text File</Label>
                      <div className="border-2 border-dashed border-border rounded-md p-8 text-center mt-2">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">Drop your file here or click to browse</p>
                        <Button variant="outline" size="sm">Choose File</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleVerification}
                  disabled={isVerifying}
                  className="w-full"
                  variant="hero"
                  size="lg"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    "Verify Authenticity"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Verification Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isVerifying ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analyzing Content</h3>
                    <p className="text-muted-foreground text-sm">
                      Our AI is processing your content and checking it against multiple sources...
                    </p>
                  </div>
                ) : result ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Main Result */}
                    <div className="text-center p-6 bg-background/50 rounded-lg">
                      {result.status === 'real' ? (
                        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                      ) : result.status === 'fake' ? (
                        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                      ) : (
                        <AlertTriangle className="h-16 w-16 text-warning mx-auto mb-4" />
                      )}
                      
                      <Badge 
                        variant={result.status === 'real' ? 'default' : 'destructive'}
                        className="text-lg px-4 py-2 mb-4"
                      >
                        {result.status === 'real' ? 'LIKELY AUTHENTIC' : 'LIKELY FAKE'}
                      </Badge>
                      
                      <div className="text-3xl font-bold mb-2">
                        {result.confidence}% Confidence
                      </div>
                      <p className="text-muted-foreground">
                        Based on AI analysis and fact-checking
                      </p>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Detailed Analysis</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Credibility Score:</span>
                          <div className="font-medium">{result.analysis.credibilityScore}/100</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Language Pattern:</span>
                          <div className="font-medium">{result.analysis.languagePattern}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Fact Check:</span>
                          <div className="font-medium">{result.analysis.factCheck}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Source Reliability:</span>
                          <div className="font-medium">{result.analysis.sourceReliability}</div>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Hash */}
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Blockchain Hash:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyBlockchainHash}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <code className="text-xs break-all bg-muted p-2 rounded text-muted-foreground">
                        {result.blockchainHash}
                      </code>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Verified on {new Date(result.timestamp).toLocaleDateString()} at{' '}
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Results will appear here after verification</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;