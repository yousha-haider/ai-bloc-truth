import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Layout/Header";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import NewsSubmitter from "./pages/NewsSubmitter";
import NotFound from "./pages/NotFound";
import Transparency from "./pages/Transparency";
import Validator from "./pages/Validator";
import Verify from "./pages/Verify";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/verify"
                  element={
                    <ProtectedRoute>
                      <Verify />
                    </ProtectedRoute>
                  }
                  />
                <Route
                  path="/validator"
                  element={
                    <ProtectedRoute>
                      <Validator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/submit-news"
                  element={
                    <ProtectedRoute>
                      <NewsSubmitter />
                    </ProtectedRoute>
                  }
                />
                <Route path="/transparency" element={<Transparency />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
