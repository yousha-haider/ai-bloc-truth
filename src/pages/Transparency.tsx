import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Copy,
  ExternalLink,
  Search,
  TrendingUp,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface VerificationRecord {
  id: string;
  title: string;
  source: string;
  status: 'real' | 'fake' | 'uncertain';
  confidence: number;
  blockchainHash: string;
  timestamp: string;
  verifier: string;
  inputType: 'text' | 'url';
  url?: string;
  snippet?: string;
}

const Transparency = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const userId = user?.id || undefined;
      const url = userId 
        ? `/api/verifications?userId=${userId}&limit=100`
        : `/api/verifications?limit=100`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.warn("Unable to load verification history", error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [user]);

  const dashboardStats = useMemo(() => {
    const total = records.length;
    const fakeCount = records.filter((record) => record.status === "fake").length;
    const realCount = records.filter((record) => record.status === "real").length;
    const avgConfidence =
      total === 0
        ? 0
        : records.reduce((sum, record) => sum + record.confidence, 0) / total;

    return [
      {
        label: "Total Verifications",
        value: total.toLocaleString(),
        icon: BarChart3,
        color: "text-primary"
      },
      {
        label: "Fake News Detected",
        value: fakeCount.toLocaleString(),
        icon: XCircle,
        color: "text-destructive"
      },
      {
        label: "Authentic News",
        value: realCount.toLocaleString(),
        icon: CheckCircle,
        color: "text-success"
      },
      {
        label: "Average Confidence",
        value: total === 0 ? "N/A" : `${avgConfidence.toFixed(1)}%`,
        icon: TrendingUp,
        color: "text-secondary"
      }
    ];
  }, [records]);

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: "Copied!",
      description: "Blockchain hash copied to clipboard."
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Blockchain Transparency</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every verification is permanently recorded on the blockchain for complete transparency and accountability.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {dashboardStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`h-12 w-12 mx-auto mb-4 ${stat.color}`} />
                    <div className="text-2xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Search and Filters */}
          <Card className="bg-gradient-card border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Recent Verifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or source..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Blockchain Hash</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading verification records...
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No verification records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => {
                        const statusMeta = {
                          real: {
                            label: "Authentic",
                            variant: "default" as const,
                            Icon: CheckCircle
                          },
                          fake: {
                            label: "Fake",
                            variant: "destructive" as const,
                            Icon: XCircle
                          },
                          uncertain: {
                            label: "Needs Review",
                            variant: "secondary" as const,
                            Icon: AlertTriangle
                          }
                        }[record.status];

                        return (
                          <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate">{record.title}</div>
                          {record.snippet && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {record.snippet}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground break-all">
                            {record.source}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={statusMeta.variant}
                            className="flex items-center space-x-1 w-fit"
                          >
                            <statusMeta.Icon className="h-3 w-3" />
                            <span>{statusMeta.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium">{record.confidence}%</div>
                            <div 
                              className="w-16 h-2 bg-muted rounded-full overflow-hidden"
                            >
                              <div 
                                className={`h-full ${
                                  record.confidence >= 90 ? 'bg-success' : 
                                  record.confidence >= 70 ? 'bg-warning' : 'bg-destructive'
                                }`}
                                style={{ width: `${record.confidence}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {record.blockchainHash.substring(0, 16)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyHash(record.blockchainHash)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.inputType === "url" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={record.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Text submission</span>
                          )}
                        </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {records.length === 0
                    ? "No verification history yet. Run a verification to see it here."
                    : "No records found matching your search criteria."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockchain Info */}
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle>About Blockchain Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Every news verification performed on our platform is permanently recorded on the blockchain, 
                ensuring complete transparency and immutability of results. This creates an auditable trail 
                that cannot be tampered with or altered.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Immutable Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Once verified, results cannot be changed or deleted
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">Public Transparency</h3>
                  <p className="text-sm text-muted-foreground">
                    All verification records are publicly accessible
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Verifiable Proof</h3>
                  <p className="text-sm text-muted-foreground">
                    Cryptographic hashes provide mathematical proof
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

export default Transparency;