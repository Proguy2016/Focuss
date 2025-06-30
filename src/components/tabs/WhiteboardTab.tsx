import React, { useState, useRef, useEffect } from 'react';
import { Pen, Square, Circle, Type, Eraser, Undo, Redo, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DrawingElement {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'text';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
}

export function WhiteboardTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'rectangle' | 'circle' | 'text' | 'eraser'>('pen');
  const [color, setColor] = useState('#04d9d9');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  const colors = [
    '#04d9d9', '#ef4444', '#f59e0b', '#34d399', '#8b5cf6', '#ec4899', '#000000'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    elements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (element.type === 'pen' && element.points) {
        ctx.beginPath();
        for (let i = 0; i < element.points.length - 1; i += 2) {
          if (i === 0) {
            ctx.moveTo(element.points[i], element.points[i + 1]);
          } else {
            ctx.lineTo(element.points[i], element.points[i + 1]);
          }
        }
        ctx.stroke();
      } else if (element.type === 'rectangle' && element.x && element.y && element.width && element.height) {
        ctx.strokeRect(element.x, element.y, element.width, element.height);
      } else if (element.type === 'circle' && element.x && element.y && element.width) {
        ctx.beginPath();
        ctx.arc(element.x + element.width / 2, element.y + element.width / 2, element.width / 2, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }, [elements]);

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pen') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'pen',
        points: [x, y],
        color,
        strokeWidth,
      };
      setElements(prev => [...prev, newElement]);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || tool !== 'pen') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements(prev => {
      const newElements = [...prev];
      const lastElement = newElements[newElements.length - 1];
      if (lastElement && lastElement.points) {
        lastElement.points.push(x, y);
      }
      return newElements;
    });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Save to history
      setHistory(prev => [...prev.slice(0, historyIndex + 1), elements]);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50/50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/60 bg-white/90 backdrop-blur-glass">
        <div className="flex items-center gap-2">
          {tools.map((toolItem) => (
            <Button
              key={toolItem.id}
              variant={tool === toolItem.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTool(toolItem.id as any)}
              className={cn(
                "w-10 h-10 p-0",
                tool === toolItem.id 
                  ? "bg-gradient-to-r from-theme-primary to-theme-secondary text-white shadow-glow"
                  : "border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary"
              )}
            >
              <toolItem.icon className="w-4 h-4" />
            </Button>
          ))}
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <div className="flex items-center gap-2">
            {colors.map((colorOption) => (
              <button
                key={colorOption}
                onClick={() => setColor(colorOption)}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 transition-all",
                  color === colorOption ? "border-gray-400 scale-110" : "border-gray-200 hover:scale-105"
                )}
                style={{ backgroundColor: colorOption }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-theme-gray-dark w-8">{strokeWidth}px</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex === 0}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex === history.length - 1}>
            <Redo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(4, 217, 217, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(4, 217, 217, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </div>
  );
}