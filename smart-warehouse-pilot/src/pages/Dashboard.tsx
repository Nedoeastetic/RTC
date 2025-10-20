import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import WarehouseMap from "@/components/dashboard/WarehouseMap";
import RealTimeStats from "@/components/dashboard/RealTimeStats";
import RecentScans from "@/components/dashboard/RecentScans";
import AIPredictions from "@/components/dashboard/AIPredictions";
import WebSocketIndicator from "@/components/dashboard/WebSocketIndicator";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      
      <main className="p-6">
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Left side - Warehouse Map */}
          <div className="row-span-3">
            <WarehouseMap />
          </div>

          {/* Right side - Stats, Scans, and Predictions */}
          <div className="space-y-6">
            <div className="h-[calc(33%-8px)]">
              <RealTimeStats />
            </div>
          </div>

          <div className="h-[calc(33%-8px)]">
            <RecentScans />
          </div>

          <div className="h-[calc(34%-8px)]">
            <AIPredictions />
          </div>
        </div>
      </main>

      <WebSocketIndicator />
    </div>
  );
};

export default Dashboard;
