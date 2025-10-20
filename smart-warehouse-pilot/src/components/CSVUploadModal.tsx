import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
}

const CSVUploadModal = ({ open, onClose }: CSVUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string[][]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      handleFileSelect(droppedFile);
    } else {
      toast.error("Пожалуйста, загрузите CSV файл");
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").slice(0, 6); // First 5 rows + header
      const parsedRows = rows.map((row) => row.split(";"));
      setPreview(parsedRows);
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success("Файл успешно загружен");
          setTimeout(() => {
            onClose();
            setFile(null);
            setPreview([]);
            setProgress(0);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Загрузка данных инвентаризации</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-foreground mb-2">
              Перетащите CSV файл сюда или нажмите для выбора
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="mt-2" asChild>
                <span>Выбрать файл</span>
              </Button>
            </label>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Требования к файлу:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Формат: CSV с разделителем ";"</li>
              <li>Кодировка: UTF-8</li>
              <li>
                Обязательные колонки: product_id, product_name, quantity, zone, date
              </li>
            </ul>
          </div>

          {file && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setPreview([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Progress value={progress} />
              </div>

              {preview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Предпросмотр (первые 5 строк):
                  </p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {preview[0]?.map((header, i) => (
                            <TableHead key={i}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.slice(1, 6).map((row, i) => (
                          <TableRow key={i}>
                            {row.map((cell, j) => (
                              <TableCell key={j} className="text-sm">
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleUpload} disabled={!file || progress > 0}>
              Загрузить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadModal;
