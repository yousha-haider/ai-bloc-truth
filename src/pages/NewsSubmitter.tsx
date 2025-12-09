import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Coins,
  FileText,
  Link as LinkIcon,
  Loader2,
  Send,
  Shield,
  XCircle
} from "lucide-react";
import { useState } from "react";

interface SubmittedNews {
  id: string;
  title: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  stake: number;
  validations: number;
  validationsNeeded: number;
}

const NewsSubmitter = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [stakeAmount, setStakeAmount] = useState(50);
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock data for submitted news history
  const [submittedNews] = useState<SubmittedNews[]>([
    {
      id: "sub-1",
      title: "New Study Reveals Benefits of Green Spaces",
      status: 'verified',
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      stake: 50,
      validations: 5,
      validationsNeeded: 5,
    },
    {
      id: "sub-2",
      title: "Tech Industry Report Shows Growth",
      status: 'pending',
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      stake: 75,
      validations: 2,
      validationsNeeded: 5,
    },
    {
      id: "sub-3",
      title: "Local Community Initiative Launches",
      status: 'rejected',
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
      stake: 50,
      validations: 5,
      validationsNeeded: 5,
    },
  ]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for the news article.",
        variant: "destructive",
      });
      return;
    }

    if (stakeAmount < 10) {
      toast({
        title: "Minimum Stake Required",
        description: "You must stake at least 10 VFT to submit news.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2500));

    toast({
      title: "News Submitted Successfully",
      description: `Your news has been submitted with ${stakeAmount} VFT stake. It will be validated by the network.`,
    });

    setTitle("");
    setContent("");
    setSourceUrl("");
    setStakeAmount(50);
    setIsSubmitting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-warning border-warning/20">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Submit News to Blockchain</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stake tokens to submit news for community validation and earn rewards for authentic content.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">500 VFT</div>
                <p className="text-muted-foreground text-sm">Available Balance</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold">{submittedNews.length}</div>
                <p className="text-muted-foreground text-sm">News Submitted</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {submittedNews.filter(n => n.status === 'verified').length}
                </div>
                <p className="text-muted-foreground text-sm">Verified News</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Submission Form */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-primary" />
                  <span>Submit News Article</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">News Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter the news headline..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Article Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste or write the full news article content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source URL (Optional)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="source"
                      placeholder="https://example.com/original-article"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stake">Stake Amount (VFT)</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="stake"
                      type="number"
                      min={10}
                      max={500}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(Number(e.target.value))}
                      className="w-32"
                    />
                    <div className="flex-1">
                      <input
                        type="range"
                        min={10}
                        max={500}
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Higher stakes increase visibility and potential rewards
                  </p>
                </div>

                <div className="p-4 bg-accent/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Staking Rules</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Verified news returns stake + rewards</li>
                      <li>• Rejected news loses staked amount</li>
                      <li>• Minimum 5 validators required</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                  variant="hero"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting to Blockchain...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit News ({stakeAmount} VFT)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Submission History */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>My Submissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submittedNews.map((news) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-background/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(news.status)}
                        <h4 className="font-medium text-sm line-clamp-1">{news.title}</h4>
                      </div>
                      {getStatusBadge(news.status)}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Stake</span>
                        <div className="font-medium">{news.stake} VFT</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Validations</span>
                        <div className="font-medium">{news.validations}/{news.validationsNeeded}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted</span>
                        <div className="font-medium">
                          {new Date(news.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {news.status === 'pending' && (
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-warning rounded-full transition-all"
                            style={{ width: `${(news.validations / news.validationsNeeded) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {news.status === 'verified' && (
                      <div className="mt-3 flex items-center text-xs text-success">
                        <Coins className="h-3 w-3 mr-1" />
                        +{Math.floor(news.stake * 0.2)} VFT reward earned
                      </div>
                    )}

                    {news.status === 'rejected' && (
                      <div className="mt-3 flex items-center text-xs text-destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {news.stake} VFT stake forfeited
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="bg-gradient-card border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>How News Submission Works</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-1">Submit & Stake</h4>
                  <p className="text-muted-foreground text-sm">
                    Submit news with a token stake as proof of confidence
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-1">Community Validation</h4>
                  <p className="text-muted-foreground text-sm">
                    Validators review and vote on the authenticity
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-1">Consensus Reached</h4>
                  <p className="text-muted-foreground text-sm">
                    News is verified or rejected based on votes
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <h4 className="font-semibold mb-1">Rewards Distributed</h4>
                  <p className="text-muted-foreground text-sm">
                    Earn rewards for authentic news submissions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsSubmitter;