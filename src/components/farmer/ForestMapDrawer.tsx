import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Pencil, Eraser, Square, Circle, Trash2, Save, MapPin } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DrawingTool {
  type: 'pen' | 'eraser' | 'rectangle' | 'circle';
  color: string;
  size: number;
}

export function ForestMapDrawer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawingTool>({
    type: 'pen',
    color: '#22c55e',
    size: 3
  });
  const [selectedProject, setSelectedProject] = useState('Northern Pine Forest');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw grid background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool.type === 'pen' || tool.type === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool.type === 'pen') {
      ctx.strokeStyle = tool.color;
      ctx.lineWidth = tool.size;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool.type === 'eraser') {
      ctx.clearRect(x - tool.size / 2, y - tool.size / 2, tool.size, tool.size);
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool.type === 'rectangle' || tool.type === 'circle') {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.strokeStyle = tool.color;
      ctx.lineWidth = tool.size;

      if (tool.type === 'rectangle') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool.type === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const saveMap = () => {
    toast.success('Đã lưu bản đồ rừng thành công!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Tools Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Công cụ vẽ</CardTitle>
          <CardDescription>Tạo và chỉnh sửa bản đồ rừng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Dự án</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dự án Rừng Thông Miền Bắc">Dự án Rừng Thông Miền Bắc</SelectItem>
                <SelectItem value="Phục hồi rừng Sồi">Phục hồi rừng Sồi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Công cụ</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={tool.type === 'pen' ? 'default' : 'outline'}
                onClick={() => setTool({ ...tool, type: 'pen' })}
                className="w-full"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Bút vẽ
              </Button>
              <Button
                variant={tool.type === 'eraser' ? 'default' : 'outline'}
                onClick={() => setTool({ ...tool, type: 'eraser' })}
                className="w-full"
              >
                <Eraser className="w-4 h-4 mr-2" />
                Tẩy
              </Button>
              <Button
                variant={tool.type === 'rectangle' ? 'default' : 'outline'}
                onClick={() => setTool({ ...tool, type: 'rectangle' })}
                className="w-full"
              >
                <Square className="w-4 h-4 mr-2" />
                Hình chữ nhật
              </Button>
              <Button
                variant={tool.type === 'circle' ? 'default' : 'outline'}
                onClick={() => setTool({ ...tool, type: 'circle' })}
                className="w-full"
              >
                <Circle className="w-4 h-4 mr-2" />
                Hình tròn
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Màu sắc</Label>
            <div className="grid grid-cols-4 gap-2">
              {['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'].map((color) => (
                <button
                  key={color}
                  onClick={() => setTool({ ...tool, color })}
                  className={`w-full h-10 rounded border-2 ${
                    tool.color === color ? 'border-gray-900' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kích thước: {tool.size}px</Label>
            <input
              type="range"
              min="1"
              max="20"
              value={tool.size}
              onChange={(e) => setTool({ ...tool, size: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Button onClick={saveMap} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Lưu bản đồ
            </Button>
            <Button onClick={clearCanvas} variant="outline" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa toàn bộ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div>
              <CardTitle>Trình chỉnh sửa bản đồ rừng</CardTitle>
              <CardDescription>Vẽ và chú thích các khu vực rừng</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={() => setIsDrawing(false)}
            className="w-full h-[600px] border-2 border-gray-300 rounded-lg cursor-crosshair"
          />
        </CardContent>
      </Card>
    </div>
  );
}