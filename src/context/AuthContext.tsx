import { authService } from "@/services/authService";
import { LoginCredentials, SignupData, User } from "@/types/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (data: SignupData) => Promise<{ user: User | null; session: any }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        const initAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error("Failed to restore session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for storage changes (e.g., logout in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "auth_user") {
                try {
                    const stored = e.newValue ? JSON.parse(e.newValue) : null;
                    setUser(stored);
                } catch {
                setUser(null);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const loggedInUser = await authService.login(credentials.email, credentials.password);
        // Store user in localStorage
        if (typeof window !== "undefined") {
            localStorage.setItem("auth_user", JSON.stringify(loggedInUser));
        }
        setUser(loggedInUser);
    };

    const signup = async (data: SignupData) => {
        const result = await authService.signup(data);
        if (result.user) {
            // Store user in localStorage
            if (typeof window !== "undefined") {
                localStorage.setItem("auth_user", JSON.stringify(result.user));
            }
            setUser(result.user);
        }
        return result;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
