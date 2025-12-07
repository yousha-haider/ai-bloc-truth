import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { 
  User, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Award,
  History,
  Loader2
} from "lucide-react";

interface VerificationRecord {
  id: string;
  title: string;
  source: string;
  status: 'real' | 'fake' | 'uncertain';
  confidence: number;
  blockchainHash: string;
  timestamp: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVerifications = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/verifications?userId=${user.id}&limit=100`);
        if (response.ok) {
          const data = await response.json();
          setVerifications(data);
        }
      } catch (error) {
        console.error("Failed to load verifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVerifications();
  }, [user?.id]);

  const userStats = useMemo(() => {
    const total = verifications.length;
    const authentic = verifications.filter(v => v.status === 'real').length;
    const fake = verifications.filter(v => v.status === 'fake').length;
    const avgConfidence = total > 0
      ? verifications.reduce((sum, v) => sum + v.confidence, 0) / total
      : 0;
    
    // Calculate credibility score based on accuracy and average confidence
    const accuracy = total > 0 ? (authentic / total) * 100 : 0;
    const credibilityScore = Math.round((accuracy * 0.6 + avgConfidence * 0.4));

    return {
      credibilityScore: Math.min(100, Math.max(0, credibilityScore)),
      totalSubmissions: total,
      authenticNews: authentic,
      fakeNews: fake,
      accuracy: total > 0 ? (authentic / total) * 100 : 0
    };
  }, [verifications]);

  const recentSubmissions = verifications.slice(0, 5);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Credibility Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Track your verification history and build your credibility score.
            </p>
          </div>

          {/* User Profile Card */}
          <Card className="bg-gradient-card border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName || user?.email || "User"}
                    </h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Badge variant="success" className="mt-1">
                      <Award className="h-3 w-3 mr-1" />
                      {userStats.totalSubmissions > 0 ? "Trusted Verifier" : "New User"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Credibility Score</span>
                      <span className="text-2xl font-bold text-primary">{userStats.credibilityScore}/100</span>
                    </div>
                    <Progress value={userStats.credibilityScore} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{userStats.totalSubmissions}</div>
                      <div className="text-xs text-muted-foreground">Total Submissions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-success">{userStats.authenticNews}</div>
                      <div className="text-xs text-muted-foreground">Authentic</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-destructive">{userStats.fakeNews}</div>
                      <div className="text-xs text-muted-foreground">Fake</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Accuracy Rate",
                value: `${userStats.accuracy}%`,
                icon: TrendingUp,
                color: "text-success"
              },
              {
                title: "Credibility Score",
                value: userStats.credibilityScore,
                icon: Shield,
                color: "text-primary"
              },
              {
                title: "Authentic News",
                value: userStats.authenticNews,
                icon: CheckCircle,
                color: "text-success"
              },
              {
                title: "Fake News Found",
                value: userStats.fakeNews,
                icon: XCircle,
                color: "text-destructive"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Submissions */}
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Recent Submissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading your submissions...</p>
                </div>
              ) : recentSubmissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions yet. Start verifying news to see your history here!</p>
                </div>
              ) : (
              <div className="space-y-4">
                {recentSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {submission.status === 'real' ? (
                        <CheckCircle className="h-8 w-8 text-success" />
                      ) : (
                        <XCircle className="h-8 w-8 text-destructive" />
                      )}
                      <div>
                        <h4 className="font-medium">{submission.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(submission.timestamp).toLocaleDateString()} at{' '}
                          {new Date(submission.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        variant={submission.status === 'real' ? 'default' : 'destructive'}
                        className="mb-1"
                      >
                        {submission.status === 'real' ? 'Authentic' : 'Fake'}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {submission.confidence}% confidence
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
              
              {recentSubmissions.length > 0 && (
              <div className="mt-6 text-center">
                  <Button variant="outline" onClick={() => window.location.href = '/transparency'}>
                  View All Submissions
                </Button>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-gradient-card border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: "First Verification",
                    description: "Submit your first news article for verification",
                    earned: userStats.totalSubmissions > 0,
                    icon: "🏆"
                  },
                  {
                    title: "Truth Seeker",
                    description: "Successfully identify 10 fake news articles",
                    earned: userStats.fakeNews >= 10,
                    icon: "🔍"
                  },
                  {
                    title: "Accuracy Expert",
                    description: "Maintain 90%+ accuracy rate with 50+ submissions",
                    earned: userStats.accuracy >= 90 && userStats.totalSubmissions >= 50,
                    icon: "🎯"
                  }
                ].map((achievement) => (
                  <div
                    key={achievement.title}
                    className={`p-4 rounded-lg border ${
                      achievement.earned 
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && (
                      <Badge variant="success" className="mt-2">
                        Earned
                      </Badge>
                    )}
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

export default Dashboard;