import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Warehouse, LogOut, Plus, Bot } from "lucide-react";
import CreateWarehouseModal from "@/components/CreateWarehouseModal";

interface WarehouseDTO {
  id: number;
  code: string;
  name: string;
  location: string;
  zoneMaxSize: number;
  rowMaxSize: number;
  shelfMaxSize: number;
}

const WarehouseSelection = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<WarehouseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/warehouse', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWarehouses(data);
      } else {
        throw new Error('Failed to fetch warehouses');
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseSelect = (warehouseCode: string) => {
    localStorage.setItem('selectedWarehouse', warehouseCode);
    navigate(`/dashboard/${warehouseCode}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedWarehouse');
    navigate('/login');
  };

  const handleWarehouseCreated = () => {
    fetchWarehouses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading warehouses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Warehouse Management</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r min-h-screen">
          <div className="p-4 space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => navigate('/warehouses')}
            >
              <Warehouse className="mr-2 h-4 w-4" />
              Warehouses
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/robots')}
            >
              <Bot className="mr-2 h-4 w-4" />
              Robots
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Add Warehouse Card */}
              <Card
                className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => setCreateModalOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-40 p-6">
                  <Plus className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-lg font-medium text-gray-600 text-center">
                    Add New Warehouse
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Create a new warehouse location
                  </p>
                </CardContent>
              </Card>

              {/* Existing Warehouses */}
              {warehouses.map((warehouse) => (
                <Card
                  key={warehouse.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20"
                  onClick={() => handleWarehouseSelect(warehouse.code)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5" />
                      {warehouse.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Code:</strong> {warehouse.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {warehouse.location || "Not specified"}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-3">
                      <div className="text-center">
                        <div className="font-semibold">{warehouse.zoneMaxSize}</div>
                        <div>Zones</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{warehouse.rowMaxSize}</div>
                        <div>Rows</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{warehouse.shelfMaxSize}</div>
                        <div>Shelves</div>
                      </div>
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      Select Warehouse
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {warehouses.length === 0 && (
              <div className="text-center py-12">
                <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No warehouses found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first warehouse
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Warehouse
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateWarehouseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onWarehouseCreated={handleWarehouseCreated}
      />
    </div>
  );
};

export default WarehouseSelection;