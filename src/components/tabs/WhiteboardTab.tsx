import React, { useState, useEffect } from 'react';
import { Pencil, Eraser, Square, Circle, MousePointer, Undo, Redo, Download, Trash, Save, Share, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';

export function WhiteboardTab() {
  const [activeTool, setActiveTool] = useState<'select' | 'pencil' | 'eraser' | 'rectangle' | 'circle'>('pencil');
  const [strokeWidth, setStrokeWidth] = useState([3]);
  const [strokeColor, setStrokeColor] = useState('#04d9d9');
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { startEdit, endEdit } = useRealtimeCollaboration();
  
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isDrawing = React.useRef(false);
  const lastPos = React.useRef({ x: 0, y: 0 });
  
  // Available colors
  const colors = [
    '#04d9d9', // theme-primary
    '#34d399', // theme-emerald
    '#f59e0b', // theme-yellow
    '#ef4444', // theme-red
    '#ffffff', // white
    '#888888', // gray
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to parent container size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
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
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    startEdit('whiteboard', 'drawing', { tool: activeTool, color: strokeColor, width: strokeWidth[0] });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    if (activeTool === 'pencil') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth[0];
      
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth[0] * 2;
      
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      
      ctx.globalCompositeOperation = 'source-over';
    }
    
    lastPos.current = currentPos;
  };
  
  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveCanvasState();
      endEdit('drawing');
    }
  };
  
  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save canvas state to history
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const undo = () => {
    if (historyIndex <= 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = canvasHistory[newIndex];
  };
  
  const redo = () => {
    if (historyIndex >= canvasHistory.length - 1) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = canvasHistory[newIndex];
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill with dark background
    ctx.fillStyle = 'rgba(0, 32, 36, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add grid pattern
    drawGrid(ctx, canvas.width, canvas.height);
    
    saveCanvasState();
  };
  
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'whiteboard.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full animated-bg">
      <div className="p-4 border-b border-white/10 bg-dark/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTool === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTool('select')}
              className={`w-9 h-9 p-0 ${activeTool === 'select' ? 'bg-theme-primary text-white' : 'text-gray hover:text-white'}`}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === 'pencil' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTool('pencil')}
              className={`w-9 h-9 p-0 ${activeTool === 'pencil' ? 'bg-theme-primary text-white' : 'text-gray hover:text-white'}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === 'eraser' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTool('eraser')}
              className={`w-9 h-9 p-0 ${activeTool === 'eraser' ? 'bg-theme-primary text-white' : 'text-gray hover:text-white'}`}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTool('rectangle')}
              className={`w-9 h-9 p-0 ${activeTool === 'rectangle' ? 'bg-theme-primary text-white' : 'text-gray hover:text-white'}`}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === 'circle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTool('circle')}
              className={`w-9 h-9 p-0 ${activeTool === 'circle' ? 'bg-theme-primary text-white' : 'text-gray hover:text-white'}`}
            >
              <Circle className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-white/10 mx-2" />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 p-0 border-2 hover:border-white"
                  style={{ 
                    backgroundColor: strokeColor,
                    borderColor: strokeColor === '#ffffff' ? 'rgba(255, 255, 255, 0.5)' : strokeColor
                  }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-dark border-white/10">
                <div className="flex gap-2 flex-wrap max-w-[180px]">
                  {colors.map(color => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: color,
                        borderColor: color === '#ffffff' ? 'rgba(255, 255, 255, 0.5)' : color,
                        boxShadow: color === strokeColor ? '0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none'
                      }}
                      onClick={() => setStrokeColor(color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStrokeWidth([Math.max(1, strokeWidth[0] - 1)])}
                className="w-7 h-7 p-0 text-gray hover:text-white"
                disabled={strokeWidth[0] <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <div className="w-20">
                <Slider
                  value={strokeWidth}
                  onValueChange={setStrokeWidth}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStrokeWidth([Math.min(20, strokeWidth[0] + 1)])}
                className="w-7 h-7 p-0 text-gray hover:text-white"
                disabled={strokeWidth[0] >= 20}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="w-9 h-9 p-0 text-gray hover:text-white disabled:opacity-50"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= canvasHistory.length - 1}
              className="w-9 h-9 p-0 text-gray hover:text-white disabled:opacity-50"
            >
              <Redo className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-white/10 mx-2" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
              className="w-9 h-9 p-0 text-gray hover:text-theme-red"
            >
              <Trash className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadCanvas}
              className="w-9 h-9 p-0 text-gray hover:text-white"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
            >
              <Share className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 cursor-crosshair"
        />
      </div>
    </div>
  );
}