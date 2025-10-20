import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, History, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onUploadClick?: () => void;
}

const Navigation = ({ onUploadClick }: NavigationProps) => {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard">
            <Button
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              className={cn(
                "space-x-2",
                location.pathname === "/dashboard" && "bg-primary text-primary-foreground"
              )}
            >
              <Activity className="h-4 w-4" />
              <span>Текущий мониторинг</span>
            </Button>
          </Link>
          <Link to="/history">
            <Button
              variant={location.pathname === "/history" ? "default" : "ghost"}
              className={cn(
                "space-x-2",
                location.pathname === "/history" && "bg-primary text-primary-foreground"
              )}
            >
              <History className="h-4 w-4" />
              <span>Исторические данные</span>
            </Button>
          </Link>
        </div>

        {onUploadClick && (
          <Button onClick={onUploadClick} variant="outline" className="space-x-2">
            <Upload className="h-4 w-4" />
            <span>Загрузить CSV</span>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
