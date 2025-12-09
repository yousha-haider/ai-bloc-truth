import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Coins,
  Loader2,
  Shield,
  ThumbsDown,
  ThumbsUp,
  XCircle
} from "lucide-react";
import { useState } from "react";

interface PendingNews {
  id: string;
  title: string;
  content: string;
  submittedBy: string;
  submittedAt: string;
  validationsNeeded: number;
  validationsReceived: number;
  stake: number;
}

interface ValidationRecord {
  newsId: string;
  vote: 'authentic' | 'fake';
  timestamp: string;
  reward?: number;
}

const Validator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<PendingNews | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock data for pending validations
  const [pendingNews] = useState<PendingNews[]>([
    {
      id: "1",
      title: "Breaking: Major Tech Company Announces Revolutionary AI",
      content: "A leading technology company has unveiled a groundbreaking artificial intelligence system that promises to transform how we interact with computers...",
      submittedBy: "0x1234...5678",
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      validationsNeeded: 5,
      validationsReceived: 2,
      stake: 50,
    },
    {
      id: "2", 
      title: "Scientists Discover New Species in Deep Ocean",
      content: "Marine biologists have identified a previously unknown species of fish in the deepest parts of the Pacific Ocean...",
      submittedBy: "0xabcd...ef01",
      submittedAt: new Date(Date.now() - 7200000).toISOString(),
      validationsNeeded: 5,
      validationsReceived: 4,
      stake: 75,
    },
    {
      id: "3",
      title: "Global Summit Reaches Historic Climate Agreement",
      content: "World leaders have agreed to unprecedented measures to combat climate change, including new targets for carbon emissions...",
      submittedBy: "0x9876...5432",
      submittedAt: new Date(Date.now() - 1800000).toISOString(),
      validationsNeeded: 5,
      validationsReceived: 1,
      stake: 100,
    },
  ]);

  const [myValidations] = useState<ValidationRecord[]>([
    { newsId: "prev-1", vote: 'authentic', timestamp: new Date(Date.now() - 86400000).toISOString(), reward: 10 },
    { newsId: "prev-2", vote: 'fake', timestamp: new Date(Date.now() - 172800000).toISOString(), reward: 15 },
  ]);

  const handleVote = async (vote: 'authentic' | 'fake') => {
    if (!selectedNews) return;

    setIsVoting(true);

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Vote Submitted",
      description: `Your vote has been recorded on the blockchain. You'll receive rewards once consensus is reached.`,
    });

    setIsVoting(false);
    setSelectedNews(null);
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Validator Dashboard</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Validate news submissions and earn rewards for maintaining network integrity.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">125 VFT</div>
                <p className="text-muted-foreground text-sm">Total Rewards Earned</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold">{myValidations.length}</div>
                <p className="text-muted-foreground text-sm">Validations Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold">{pendingNews.length}</div>
                <p className="text-muted-foreground text-sm">Pending Validations</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pending News List */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Pending Validations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingNews.map((news) => (
                  <motion.div
                    key={news.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedNews?.id === news.id 
                        ? 'border-primary bg-accent' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedNews(news)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm line-clamp-1">{news.title}</h4>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {news.stake} VFT
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
                      {news.content}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        {news.validationsReceived}/{news.validationsNeeded} validations
                      </span>
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(news.validationsReceived / news.validationsNeeded) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Validation Panel */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Validate News</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedNews ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-bold text-lg mb-2">{selectedNews.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {selectedNews.content}
                      </p>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted by:</span>
                        <code className="text-xs">{selectedNews.submittedBy}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stake amount:</span>
                        <span className="font-medium">{selectedNews.stake} VFT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Potential reward:</span>
                        <span className="font-medium text-success">{Math.floor(selectedNews.stake / 5)} VFT</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleVote('authentic')}
                        disabled={isVoting}
                        className="bg-success hover:bg-success/90"
                        size="lg"
                      >
                        {isVoting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ThumbsUp className="h-4 w-4 mr-2" />
                        )}
                        Authentic
                      </Button>
                      <Button
                        onClick={() => handleVote('fake')}
                        disabled={isVoting}
                        variant="destructive"
                        size="lg"
                      >
                        {isVoting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 mr-2" />
                        )}
                        Fake
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Your vote will be recorded on the blockchain and cannot be changed.
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a news item to validate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Validation History */}
          <Card className="bg-gradient-card border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>My Validation History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myValidations.map((validation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {validation.vote === 'authentic' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="text-sm">News #{validation.newsId}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-muted-foreground">
                        {new Date(validation.timestamp).toLocaleDateString()}
                      </span>
                      {validation.reward && (
                        <Badge variant="outline" className="text-success">
                          +{validation.reward} VFT
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Validator;