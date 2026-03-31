import { ArrowLeft, Sun, Moon, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import useVacancy from "../viewModel/VacancyViewModel/VacancyService";

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  onProfileClick?: () => void;
}

const Header = ({ showBackButton = false, onBackClick, onProfileClick }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated, login } = useAuth();
  const { careerOrgDisplayName } = useVacancy();
  const brandInitial = careerOrgDisplayName.charAt(0).toUpperCase() || "V";

  const handleLogin = () => {
    // Mock login
    login('user@example.com', 'password');
  };

  return (
    <header className="relative z-10 bg-card/50 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBackClick}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-glow-pulse">
                <span className="text-white font-bold text-sm sm:text-lg">{brandInitial}</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gradient">
                  <span className="hidden sm:inline">{careerOrgDisplayName}</span>
                  <span className="sm:hidden">{careerOrgDisplayName.split(/\s+/)[0]}</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Future of Hiring</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="border-border hover:bg-muted p-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-accent to-primary" />
                    <span className="hidden sm:inline text-sm font-medium text-foreground">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="neon-button"
                onClick={handleLogin}
              >
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;