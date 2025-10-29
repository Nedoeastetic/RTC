-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  daily_consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  reorder_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory scans table
CREATE TABLE public.inventory_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  robot_id TEXT NOT NULL,
  zone TEXT NOT NULL,
  article TEXT NOT NULL,
  product_name TEXT NOT NULL,
  expected_quantity INTEGER NOT NULL,
  actual_quantity INTEGER NOT NULL,
  difference INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warehouse zones table
CREATE TABLE public.warehouse_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  row_pos INTEGER NOT NULL,
  col_pos INTEGER NOT NULL,
  zone_status TEXT NOT NULL DEFAULT 'free',
  robot_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(row_pos, col_pos)
);

-- Create robots table
CREATE TABLE public.robots (
  id TEXT NOT NULL PRIMARY KEY,
  row_pos INTEGER,
  col_pos INTEGER,
  battery_level INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'idle',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robots ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can restrict later)
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow public insert to products" 
ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to products" 
ON public.products FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to inventory_scans" 
ON public.inventory_scans FOR SELECT USING (true);

CREATE POLICY "Allow public insert to inventory_scans" 
ON public.inventory_scans FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to warehouse_zones" 
ON public.warehouse_zones FOR SELECT USING (true);

CREATE POLICY "Allow public insert to warehouse_zones" 
ON public.warehouse_zones FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to warehouse_zones" 
ON public.warehouse_zones FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to robots" 
ON public.robots FOR SELECT USING (true);

CREATE POLICY "Allow public insert to robots" 
ON public.robots FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to robots" 
ON public.robots FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouse_zones_updated_at
BEFORE UPDATE ON public.warehouse_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_robots_updated_at
BEFORE UPDATE ON public.robots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.products (article, name, current_stock, daily_consumption, min_stock_level, reorder_quantity) VALUES
('ART-001', 'Товар А', 150, 15.5, 50, 200),
('ART-002', 'Товар Б', 80, 8.0, 30, 150),
('ART-003', 'Товар В', 200, 12.3, 60, 180),
('ART-004', 'Товар Г', 45, 9.5, 40, 160),
('ART-005', 'Товар Д', 25, 5.2, 20, 100);

-- Insert sample warehouse zones (6 rows x 5 columns)
INSERT INTO public.warehouse_zones (row_pos, col_pos, zone_status) VALUES
(0, 0, 'free'), (0, 1, 'free'), (0, 2, 'free'), (0, 3, 'free'), (0, 4, 'occupied'),
(1, 0, 'free'), (1, 1, 'free'), (1, 2, 'free'), (1, 3, 'free'), (1, 4, 'maintenance'),
(2, 0, 'free'), (2, 1, 'free'), (2, 2, 'free'), (2, 3, 'free'), (2, 4, 'free'),
(3, 0, 'free'), (3, 1, 'maintenance'), (3, 2, 'free'), (3, 3, 'free'), (3, 4, 'occupied'),
(4, 0, 'free'), (4, 1, 'free'), (4, 2, 'free'), (4, 3, 'free'), (4, 4, 'occupied'),
(5, 0, 'free'), (5, 1, 'free'), (5, 2, 'free'), (5, 3, 'free'), (5, 4, 'occupied');

-- Insert sample robots
INSERT INTO public.robots (id, row_pos, col_pos, battery_level, status) VALUES
('R1', 2, 2, 85, 'working'),
('R2', 1, 0, 92, 'idle'),
('R3', 3, 2, 78, 'working'),
('R4', 2, 3, 88, 'charging'),
('R5', 2, 5, 45, 'low_battery'),
('R6', 5, 5, 95, 'idle');

-- Insert sample inventory scans
INSERT INTO public.inventory_scans (scan_datetime, robot_id, zone, article, product_name, expected_quantity, actual_quantity, difference, status) VALUES
(NOW() - INTERVAL '1 hour', 'R1', 'A1', 'ART-001', 'Товар А', 150, 145, -5, 'расхождение'),
(NOW() - INTERVAL '2 hours', 'R2', 'B2', 'ART-002', 'Товар Б', 80, 80, 0, 'совпадает'),
(NOW() - INTERVAL '3 hours', 'R3', 'C3', 'ART-003', 'Товар В', 200, 205, 5, 'расхождение'),
(NOW() - INTERVAL '4 hours', 'R4', 'D4', 'ART-004', 'Товар Г', 45, 45, 0, 'совпадает'),
(NOW() - INTERVAL '5 hours', 'R5', 'E5', 'ART-005', 'Товар Д', 25, 20, -5, 'расхождение');