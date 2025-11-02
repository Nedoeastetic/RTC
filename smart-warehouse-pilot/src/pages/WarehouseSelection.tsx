import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Warehouse, LogOut } from "lucide-react";

interface WarehouseDTO {
  id: number;
  code: string;
  name: string;
  location: string;
}

const WarehouseSelection = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<WarehouseDTO[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Failed to fetch warehouses');
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

  if (loading) {
    return <div>Loading warehouses...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Select Warehouse</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <Card 
              key={warehouse.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleWarehouseSelect(warehouse.code)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  {warehouse.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Code: {warehouse.code}</p>
                <Button className="w-full mt-4">Select</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WarehouseSelection;