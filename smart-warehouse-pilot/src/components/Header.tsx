import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Вы вышли из системы");
    navigate("/login");
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-10 bg-primary rounded flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">Ростелеком</span>
          </div>
          <div className="border-l border-border h-8"></div>
          <h1 className="text-xl font-semibold text-foreground">Умный склад</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Иван Петров</p>
            <p className="text-xs text-muted-foreground">Оператор склада</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выход
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
