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

interface WhiteboardTabProps {
  elements?: DrawingElement[];
  onUpdateElements?: (elements: DrawingElement[]) => void;
}

export function WhiteboardTab({ elements = [], onUpdateElements }: WhiteboardTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'rectangle' | 'circle' | 'text' | 'eraser'>('pen');
  const [color, setColor] = useState('#04d9d9');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [localElements, setLocalElements] = useState<DrawingElement[]>(elements);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Update local elements when props change
  useEffect(() => {
    setLocalElements(elements);
  }, [elements]);

  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  const colors = [
    '#04d9d9', '#ef4444', '#f59e0b', '#34d399', '#8b5cf6', '#ec4899', '#ffffff'
  ];

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const saveCanvasState = () => {
    // Save to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), localElements]);
    setHistoryIndex(prev => prev + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const container = containerRef.current;
    
    const resizeCanvas = () => {
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Fill with dark background
        ctx.fillStyle = 'rgba(0, 32, 36, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid pattern
        drawGrid(ctx, canvas.width, canvas.height);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Save initial canvas state
    saveCanvasState();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

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
    
    // Fill with dark background
    ctx.fillStyle = 'rgba(0, 32, 36, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add grid pattern
    drawGrid(ctx, canvas.width, canvas.height);
    
    localElements.forEach(element => {
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
  }, [localElements]);

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
      const updatedElements = [...localElements, newElement];
      setLocalElements(updatedElements);
      
      // Sync with server if callback provided
      if (onUpdateElements) {
        onUpdateElements(updatedElements);
      }
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || tool !== 'pen') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedElements = [...localElements];
    const lastElement = updatedElements[updatedElements.length - 1];
    if (lastElement && lastElement.points) {
      lastElement.points.push(x, y);
      setLocalElements(updatedElements);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Save to history
      setHistory(prev => [...prev.slice(0, historyIndex + 1), localElements]);
      setHistoryIndex(prev => prev + 1);
      
      // Sync with server if callback provided
      if (onUpdateElements) {
        onUpdateElements(localElements);
      }
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newHistoryIndex = historyIndex - 1;
      setHistoryIndex(newHistoryIndex);
      const updatedElements = history[newHistoryIndex];
      setLocalElements(updatedElements);
      
      // Sync with server if callback provided
      if (onUpdateElements) {
        onUpdateElements(updatedElements);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newHistoryIndex = historyIndex + 1;
      setHistoryIndex(newHistoryIndex);
      const updatedElements = history[newHistoryIndex];
      setLocalElements(updatedElements);
      
      // Sync with server if callback provided
      if (onUpdateElements) {
        onUpdateElements(updatedElements);
      }
    }
  };

  const clearCanvas = () => {
    setLocalElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
    
    // Sync with server if callback provided
    if (onUpdateElements) {
      onUpdateElements([]);
    }
  };

  return (
    <div className="flex flex-col h-full animated-bg" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-dark/30 backdrop-blur-glass">
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
                  : "border-white/10 hover:bg-theme-primary/10 text-theme-primary"
              )}
            >
              <toolItem.icon className="w-4 h-4" />
            </Button>
          ))}
          
          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <div className="flex items-center gap-2">
            {colors.map((colorOption) => (
              <button
                key={colorOption}
                onClick={() => setColor(colorOption)}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 transition-all",
                  color === colorOption ? "border-white scale-110" : "border-white/20 hover:scale-105"
                )}
                style={{ backgroundColor: colorOption }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray w-8">{strokeWidth}px</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex === 0} className="border-white/10 text-gray hover:text-white">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex === history.length - 1} className="border-white/10 text-gray hover:text-white">
            <Redo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-white/10 text-gray hover:text-white">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={clearCanvas} className="border-white/10 text-gray hover:text-white">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-dark/20">
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