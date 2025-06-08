import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download,
  Highlighter, Pen, StickyNote, Eraser, Hand, RotateCw, 
  PanelLeft, File, BookOpen, Bookmark, Settings
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Define interfaces for annotations
interface DrawingPoint {
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
  page: number;
  timestamp: number;
}

interface Highlight {
  id: string;
  page: number;
  position: { 
    boundingRect: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
      height: number;
    };
    rects: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
      height: number;
    }>;
  };
  content: {
    text: string;
  };
  comment?: string;
  color: string;
  timestamp: number;
}

interface Annotation {
  id: string;
  type: 'highlight' | 'drawing' | 'note';
  page: number;
  content: string;
  position: { x: number; y: number };
  color: string;
  timestamp: number;
}

// Add the component
const PDFViewer: React.FC = () => {
  // Create a fallback PDF
  const createFallbackPdf = () => {
    const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 68 >>
stream
BT
/F1 24 Tf
100 700 Td
(Focus Ritual PDF Viewer - Sample PDF) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000234 00000 n
0000000352 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF
    `.trim();
    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  // PDF state
  const [pdfFile, setPdfFile] = useState<string | ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(0.8);
  const [rotation, setRotation] = useState(0);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'annotations' | 'bookmarks'>('thumbnails');
  const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'pen' | 'note' | 'eraser'>('select');
  
  // Highlighting state
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showTextSelector, setShowTextSelector] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  
  // Drawing state
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingPath | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#ff5722');
  const [penWidth, setPenWidth] = useState(3);
  
  // Eraser state
  const [eraserPosition, setEraserPosition] = useState({ x: 0, y: 0 });
  const [showEraserCursor, setShowEraserCursor] = useState(false);
  
  // Notes state
  const [notes, setNotes] = useState<Annotation[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [notePosition, setNotePosition] = useState({ x: 0, y: 0 });
  const [noteText, setNoteText] = useState('');
  const [noteColor, setNoteColor] = useState('#4caf50');
  
  // Refs
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const textSelectorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noteEditorRef = useRef<HTMLDivElement>(null);

  // Add a new state to store the PDF dimensions
  const [pdfDimensions, setPdfDimensions] = useState<{width: number, height: number} | null>(null);

  // Add a useEffect to update PDF dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (pdfContainerRef.current) {
        setPdfDimensions({
          width: pdfContainerRef.current.clientWidth,
          height: pdfContainerRef.current.clientHeight
        });
      }
    };
    
    // Set initial dimensions
    updateDimensions();
    
    // Update dimensions on resize
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Configure pdfjs worker once when component loads
  useEffect(() => {
    // Use local worker file to avoid CORS issues
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf-worker/pdf.worker.js`;
  }, []);

  // Add initial PDF loading
  useEffect(() => {
    // Start with the fallback PDF
    const fallbackPdfUrl = createFallbackPdf();
    setPdfFile(fallbackPdfUrl);
    
    return () => {
      // Clean up blob URLs
      if (typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, []);

  // Update the mouse up handler for text selection - now auto-highlights without showing the selector
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (activeTool !== 'highlight') return;
      
      // Use setTimeout to handle selection after the browser has finished processing the mouseup
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          if (selection.rangeCount > 0 && pdfContainerRef.current) {
            try {
              // Get the PDF container and page element
              const containerRect = pdfContainerRef.current.getBoundingClientRect();
              const pageElement = pdfContainerRef.current.querySelector('.react-pdf__Page');
              
              if (!pageElement) return;
              
              const pageRect = pageElement.getBoundingClientRect();
              
              // Get the selected text and range
              const range = selection.getRangeAt(0);
              const selectedText = selection.toString().trim();
              
              // Get the position of the selection relative to the PDF page, not the container
              const clientRects = Array.from(range.getClientRects());
              
              // Adjust positions relative to the PDF page and account for scale
              const rects = clientRects.map(rect => {
                // Calculate position relative to the page
                const x1 = (rect.left - pageRect.left) / scale;
                const y1 = (rect.top - pageRect.top) / scale;
                const x2 = (rect.right - pageRect.left) / scale;
                const y2 = (rect.bottom - pageRect.top) / scale;
                
                return {
                  x1,
                  y1,
                  x2,
                  y2,
                  width: rect.width / scale,
                  height: rect.height / scale,
                };
              });
              
              if (rects.length === 0) return;
              
              // Get the bounding rect of the selection
              const boundingRect = {
                x1: Math.min(...rects.map(r => r.x1)),
                y1: Math.min(...rects.map(r => r.y1)),
                x2: Math.max(...rects.map(r => r.x2)),
                y2: Math.max(...rects.map(r => r.y2)),
                width: 0,
                height: 0,
              };
              
              boundingRect.width = boundingRect.x2 - boundingRect.x1;
              boundingRect.height = boundingRect.y2 - boundingRect.y1;
              
              // Create highlight object
              const newHighlight: Highlight = {
                id: `highlight_${Date.now()}`,
                page: currentPage,
                position: {
                  boundingRect,
                  rects: rects.map(r => ({
                    x1: r.x1,
                    y1: r.y1,
                    x2: r.x2,
                    y2: r.y2,
                    width: r.width,
                    height: r.height,
                  })),
                },
                content: {
                  text: selectedText,
                },
                color: '#ffeb3b', // Default highlight color
                timestamp: Date.now(),
              };
              
              // Add highlight to state
              setHighlights(prev => [...prev, newHighlight]);
              
              // Clear the selection
              selection.removeAllRanges();
            } catch (error) {
              console.error('Error creating highlight:', error);
            }
          }
        }
      }, 0);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeTool, currentPage, scale]);

  // Hide text selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textSelectorRef.current && !textSelectorRef.current.contains(event.target as Node)) {
        setShowTextSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Update the addHighlight function to work with text selection properly
  const addHighlight = useCallback((color = '#ffeb3b') => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return;
    
    try {
      if (selection.rangeCount > 0 && pdfContainerRef.current) {
        // Get the container position for relative positioning
        const containerRect = pdfContainerRef.current.getBoundingClientRect();
        
        // Get the selected text and range
        const range = selection.getRangeAt(0);
        const selectedText = selection.toString().trim();
        
        // Get the position of the selection
        const rects = Array.from(range.getClientRects()).map(rect => ({
          x1: rect.left - containerRect.left,
          y1: rect.top - containerRect.top,
          x2: rect.right - containerRect.left,
          y2: rect.bottom - containerRect.top,
          width: rect.width,
          height: rect.height,
        }));
        
        if (rects.length === 0) return;
        
        // Get the bounding rect of the selection
        const boundingRect = {
          x1: Math.min(...rects.map(r => r.x1)),
          y1: Math.min(...rects.map(r => r.y1)),
          x2: Math.max(...rects.map(r => r.x2)),
          y2: Math.max(...rects.map(r => r.y2)),
          width: 0,
          height: 0,
        };
        
        boundingRect.width = boundingRect.x2 - boundingRect.x1;
        boundingRect.height = boundingRect.y2 - boundingRect.y1;
        
        // Create highlight object
        const newHighlight: Highlight = {
          id: `highlight_${Date.now()}`,
          page: currentPage,
          position: {
            boundingRect,
            rects: rects.map(r => ({
              x1: r.x1,
              y1: r.y1,
              x2: r.x2,
              y2: r.y2,
              width: r.width,
              height: r.height,
            })),
          },
          content: {
            text: selectedText,
          },
          color,
          timestamp: Date.now(),
        };
        
        // Add highlight to state
        setHighlights(prev => [...prev, newHighlight]);
        
        // Clear the text selector and selection
        setShowTextSelector(false);
        selection.removeAllRanges();
        
        console.log("Added highlight:", newHighlight);
      }
    } catch (error) {
      console.error('Error adding highlight:', error);
    }
  }, [currentPage]);

  // Update the drawing canvas and rendering logic

  // First, let's add a useEffect to re-render drawings when the page changes
  useEffect(() => {
    // Render existing drawings for the current page
    if (canvasRef.current && pdfContainerRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set canvas dimensions to match container
        canvas.width = pdfContainerRef.current.clientWidth;
        canvas.height = pdfContainerRef.current.clientHeight;
        
        // Draw existing drawings
        renderDrawings(ctx);
      }
    }
  }, [currentPage, drawings]);

  // Function to render all drawings on canvas
  const renderDrawings = useCallback((ctx: CanvasRenderingContext2D) => {
    // Only render drawings for current page
    const pageDrawings = drawings.filter(d => d.page === currentPage);

    for (const drawing of pageDrawings) {
      const { points, color, width } = drawing;
      if (points.length < 2) continue;

      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      // Apply scale when rendering stored drawings
      ctx.moveTo(points[0].x * scale, points[0].y * scale);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * scale, points[i].y * scale);
      }
      ctx.stroke();
    }
  }, [currentPage, drawings, scale]);

  // Update the effect that handles drawing canvas
  useEffect(() => {
    const updateCanvas = () => {
      const canvas = canvasRef.current;
      const container = pdfContainerRef.current;
      if (!canvas || !container) return;
      
      const pdfPage = container.querySelector('.react-pdf__Page');
      if (!pdfPage) return;
      
      const rect = pdfPage.getBoundingClientRect();
      
      // Set canvas size to match PDF page size
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderDrawings(ctx);
      }
    };
    
    // Initialize canvas
    updateCanvas();
    
    // Update canvas on window resize
    window.addEventListener('resize', updateCanvas);
    
    return () => {
      window.removeEventListener('resize', updateCanvas);
    };
  }, [renderDrawings, scale, rotation]);
  
  // Ensure canvas is updated when the PDF page changes or scale/rotation changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderDrawings(ctx);
    }
  }, [currentPage, renderDrawings, scale, rotation]);

  // Handle eraser cursor display
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeTool !== 'eraser') {
        setShowEraserCursor(false);
        return;
      }
      
      const container = pdfContainerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      
      // Update eraser cursor position to match mouse position exactly
      setEraserPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setShowEraserCursor(true);
    };
    
    const handleMouseLeave = () => {
      setShowEraserCursor(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeTool]);
  
  // Add improved eraser functionality - only erase on click and drag
  const [isErasing, setIsErasing] = useState(false);
  
  const handleErase = useCallback((e: React.MouseEvent) => {
    // Only perform erasing if the mouse button is pressed (click or drag)
    if (activeTool !== 'eraser' || !isErasing) return;
    
    const container = pdfContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update eraser cursor position
    setEraserPosition({x, y});
    setShowEraserCursor(true);
    
    // Define eraser radius - bigger for easier erasing
    const eraserRadius = 20;
    
    // 1. Find and filter drawings within the eraser radius
    const updatedDrawings = drawings.filter(drawing => {
      if (drawing.page !== currentPage) return true;
      
      // Check if any point is within the eraser radius
      const pointInEraser = drawing.points.some(point => {
        // Convert stored points to screen coordinates by applying scale
        const screenX = point.x * scale;
        const screenY = point.y * scale;
        
        const distance = Math.sqrt(
          Math.pow(screenX - x, 2) + Math.pow(screenY - y, 2)
        );
        return distance < eraserRadius;
      });
      
      // Keep the drawing if no points are within the eraser radius
      return !pointInEraser;
    });
    
    // 2. Find and filter highlights within the eraser radius
    const updatedHighlights = highlights.filter(highlight => {
      if (highlight.page !== currentPage) return true;
      
      // Check if any rect of the highlight is within the eraser radius
      const highlightInEraser = highlight.position.rects.some(rect => {
        // Calculate the center point of the highlight rectangle
        const rectCenterX = ((rect.x1 + rect.x2) / 2) * scale;
        const rectCenterY = ((rect.y1 + rect.y2) / 2) * scale;
        
        const distance = Math.sqrt(
          Math.pow(rectCenterX - x, 2) + Math.pow(rectCenterY - y, 2)
        );
        return distance < eraserRadius;
      });
      
      // Keep the highlight if it's not within the eraser radius
      return !highlightInEraser;
    });
    
    // 3. Update drawings if any were erased
    if (updatedDrawings.length !== drawings.length) {
      setDrawings(updatedDrawings);
      
      // Force re-render the canvas with updated drawings
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          renderDrawings(ctx);
        }
      }
    }
    
    // 4. Update highlights if any were erased
    if (updatedHighlights.length !== highlights.length) {
      setHighlights(updatedHighlights);
    }
    
  }, [activeTool, currentPage, drawings, renderDrawings, isErasing, scale, highlights]);

  // Define eraser action handlers
  const startErasing = useCallback((e: React.MouseEvent) => {
    setIsErasing(true);
    handleErase(e); // Start erasing immediately on click
  }, [handleErase]);
  
  const stopErasing = useCallback(() => {
    setIsErasing(false);
  }, []);

  // Add note functionality
  const handleNoteClick = (e: React.MouseEvent) => {
    if (activeTool !== 'note') return;
    
    // Get position relative to the PDF container
    const container = pdfContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set up the note editor
    setNotePosition({ x, y });
    setNoteText('');
    setShowNoteEditor(true);
  };

  const saveNote = () => {
    if (!noteText.trim()) {
      setShowNoteEditor(false);
      return;
    }
    
    const newNote: Annotation = {
      id: `note_${Date.now()}`,
      type: 'note',
      page: currentPage,
      content: noteText,
      position: notePosition,
      color: noteColor,
      timestamp: Date.now()
    };
    
    setNotes([...notes, newNote]);
    setShowNoteEditor(false);
    setNoteText('');
  };

  const editNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    setActiveNote(id);
    setNotePosition(note.position);
    setNoteText(note.content);
    setNoteColor(note.color);
    setShowNoteEditor(true);
  };

  const updateNote = () => {
    if (!activeNote) return;
    
    const updatedNotes = notes.map(note => 
      note.id === activeNote 
        ? { ...note, content: noteText, color: noteColor } 
        : note
    );
    
    setNotes(updatedNotes);
    setShowNoteEditor(false);
    setActiveNote(null);
    setNoteText('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (activeNote === id) {
      setShowNoteEditor(false);
      setActiveNote(null);
    }
  };

  // Add save functionality
  const handleSave = () => {
    // Create an object with all annotations
    const annotationsData = {
      highlights,
      notes,
      drawings,
      timestamp: new Date().toISOString(),
      documentInfo: {
        numPages,
        title: 'Document Annotations'
      }
    };
    
    // Convert to JSON
    const jsonString = JSON.stringify(annotationsData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Memoize PDF options to prevent unnecessary reloads
  const documentOptions = useMemo(() => ({
    cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`
  }), []);

  return (
    <div className="flex h-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />
      
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r border-white/10 flex flex-col bg-black/20 backdrop-blur-sm">
          {/* Sidebar tabs */}
          <div className="flex border-b border-white/10">
            <button 
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'thumbnails' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-white/60 hover:text-white'}`}
              onClick={() => setActiveTab('thumbnails')}
            >
              <div className="flex justify-center items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>Pages</span>
              </div>
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'annotations' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-white/60 hover:text-white'}`}
              onClick={() => setActiveTab('annotations')}
            >
              <div className="flex justify-center items-center space-x-1">
                <Highlighter className="w-4 h-4" />
                <span>Notes</span>
              </div>
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'bookmarks' ? 'text-purple-300 border-b-2 border-purple-400' : 'text-white/60 hover:text-white'}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              <div className="flex justify-center items-center space-x-1">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks</span>
              </div>
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
            {activeTab === 'thumbnails' && numPages && (
              <div className="space-y-2">
                {Array.from(new Array(numPages), (_, index) => (
                  <div 
                    key={`thumb_${index + 1}`}
                    className={`relative cursor-pointer transition-all duration-200 ${currentPage === index + 1 ? 'ring-2 ring-purple-400' : 'hover:ring-1 hover:ring-white/30'} rounded-md overflow-hidden p-2 bg-black/20`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    <div className="text-white text-center">Page {index + 1}</div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'annotations' && (
              <div className="space-y-2">
                {[...highlights, ...notes, ...drawings].length > 0 ? (
                  [...highlights, ...notes, ...drawings]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((item) => {
                      // Add proper type guards
                      const isHighlight = 'content' in item && 'position' in item && 'boundingRect' in item.position;
                      const isNote = 'type' in item && item.type === 'note';
                      const isDrawing = 'points' in item;
                      
                      let displayContent = '';
                      let icon = <Highlighter className="w-3 h-3 text-yellow-400" />;
                      let iconColor = 'text-yellow-400';
                      
                      if (isHighlight) {
                        const highlight = item as Highlight;
                        displayContent = highlight.content.text.substring(0, 50) + (highlight.content.text.length > 50 ? '...' : '');
                        icon = <Highlighter className="w-3 h-3 text-yellow-400" />;
                      } else if (isNote) {
                        const note = item as Annotation;
                        displayContent = note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '');
                        icon = <StickyNote className="w-3 h-3 text-green-400" />;
                        iconColor = 'text-green-400';
                      } else if (isDrawing) {
                        displayContent = 'Drawing';
                        icon = <Pen className="w-3 h-3 text-orange-400" />;
                        iconColor = 'text-orange-400';
                      }
                      
                      const page = 'page' in item ? item.page : 1;
                      const timestamp = item.timestamp;
                      const id = item.id;
                      
                      return (
                        <div 
                          key={id}
                          className="p-2 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer"
                          onClick={() => {
                            setCurrentPage(page);
                            if (isNote) {
                              // Focus on the note after page change
                              setTimeout(() => {
                                const noteEl = document.getElementById(id);
                                if (noteEl) {
                                  noteEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  noteEl.classList.add('ring-2', 'ring-purple-400');
                                  setTimeout(() => {
                                    noteEl.classList.remove('ring-2', 'ring-purple-400');
                                  }, 2000);
                                }
                              }, 300);
                            }
                          }}
                        >
                          <div className="flex items-start space-x-2">
                            <div className={`mt-1 p-1 rounded-full bg-white/10 ${iconColor}`}>
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-white/50">
                                Page {page} • {new Date(timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="text-sm text-white truncate">
                                {displayContent}
                              </div>
                            </div>
                            {isNote && (
                              <button
                                className="text-white/50 hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editNote(id);
                                }}
                              >
                                <Settings className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-10 text-white/40">
                    <Highlighter className="inline-block w-6 h-6 mb-2 opacity-50" />
                    <p>No annotations yet</p>
                    <p className="text-xs mt-1">Use the annotation tools to add notes and highlights</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'bookmarks' && (
              <div className="text-center py-10 text-white/40">
                <Bookmark className="inline-block w-6 h-6 mb-2 opacity-50" />
                <p>No bookmarks</p>
                <p className="text-xs mt-1">Bookmark important pages for quick access</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900/80 via-purple-900/40 to-slate-900/80">
        {/* Top toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <Button 
              variant="glass" 
              size="sm" 
              onClick={toggleSidebar}
              icon={PanelLeft}
              className={sidebarOpen ? 'text-purple-300' : ''}
            />
            <Button 
              variant="glass" 
              size="sm" 
              onClick={triggerFileUpload}
              icon={File}
            >
              Open PDF
            </Button>
          </div>
          
          {/* Tool buttons */}
          <div className="flex items-center bg-black/20 rounded-md p-1">
            <div className="flex border-r border-white/10 pr-2 mr-2">
              <Button 
                variant={activeTool === 'select' ? 'glass' : 'outline'} 
                size="sm"
                className={activeTool === 'select' ? 'bg-white/10 text-purple-300' : ''}
                onClick={() => setActiveTool('select')}
                icon={Hand}
                title="Select Tool"
              />
            </div>
            
            <div className="flex space-x-1 border-r border-white/10 pr-2 mr-2">
              <Button 
                variant={activeTool === 'highlight' ? 'glass' : 'outline'}
                size="sm"
                className={activeTool === 'highlight' ? 'bg-white/10 text-yellow-300' : ''}
                onClick={() => setActiveTool('highlight')}
                icon={Highlighter}
                title="Highlight Text"
              />
              <Button 
                variant={activeTool === 'note' ? 'glass' : 'outline'}
                size="sm"
                className={activeTool === 'note' ? 'bg-white/10 text-green-300' : ''}
                onClick={() => setActiveTool('note')}
                icon={StickyNote}
                title="Add Note"
              />
              <Button 
                variant={activeTool === 'pen' ? 'glass' : 'outline'}
                size="sm"
                className={activeTool === 'pen' ? 'bg-white/10 text-orange-300' : ''}
                onClick={() => setActiveTool('pen')}
                icon={Pen}
                title="Draw"
              />
            </div>
            
            <div className="flex">
              <Button 
                variant={activeTool === 'eraser' ? 'glass' : 'outline'}
                size="sm"
                className={activeTool === 'eraser' ? 'bg-white/10 text-red-300' : ''}
                onClick={() => setActiveTool('eraser')}
                icon={Eraser}
                title="Erase"
              />
            </div>
          </div>
          
          {/* Drawing tools - show when pen tool is active */}
          {activeTool === 'pen' && (
            <div className="flex items-center space-x-1 ml-2 p-1 bg-white/10 rounded-md">
              <div className="text-xs text-white/70 mr-1">Color:</div>
              <button 
                className="w-5 h-5 rounded-full hover:ring-2 ring-white"
                onClick={() => setPenColor('#f44336')}
                style={{ 
                  backgroundColor: '#f44336',
                  border: penColor === '#f44336' ? '2px solid white' : 'none' 
                }}
              />
              <button 
                className="w-5 h-5 rounded-full hover:ring-2 ring-white"
                onClick={() => setPenColor('#2196f3')}
                style={{ 
                  backgroundColor: '#2196f3',
                  border: penColor === '#2196f3' ? '2px solid white' : 'none' 
                }}
              />
              <button 
                className="w-5 h-5 rounded-full hover:ring-2 ring-white"
                onClick={() => setPenColor('#4caf50')}
                style={{ 
                  backgroundColor: '#4caf50',
                  border: penColor === '#4caf50' ? '2px solid white' : 'none' 
                }}
              />
              <button 
                className="w-5 h-5 rounded-full hover:ring-2 ring-white"
                onClick={() => setPenColor('#ffeb3b')}
                style={{ 
                  backgroundColor: '#ffeb3b',
                  border: penColor === '#ffeb3b' ? '2px solid white' : 'none' 
                }}
              />
              <button 
                className="w-5 h-5 rounded-full hover:ring-2 ring-white"
                onClick={() => setPenColor('#9c27b0')}
                style={{ 
                  backgroundColor: '#9c27b0',
                  border: penColor === '#9c27b0' ? '2px solid white' : 'none' 
                }}
              />
              <div className="border-r border-white/20 h-4 mx-1" />
              <div className="text-xs text-white/70 mr-1">Size:</div>
              <button 
                className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                onClick={() => setPenWidth(1)}
              >
                <div className={`rounded-full bg-white ${penWidth === 1 ? 'w-1 h-1' : 'w-1 h-1'}`}></div>
              </button>
              <button 
                className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                onClick={() => setPenWidth(3)}
              >
                <div className={`rounded-full bg-white ${penWidth === 3 ? 'w-3 h-3' : 'w-2 h-2'}`}></div>
              </button>
              <button 
                className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                onClick={() => setPenWidth(5)}
              >
                <div className={`rounded-full bg-white ${penWidth === 5 ? 'w-5 h-5' : 'w-3 h-3'}`}></div>
              </button>
            </div>
          )}
        </div>
        
        {/* PDF viewer container */}
        <div 
          className="flex-1 overflow-auto flex items-center justify-center p-4 relative" 
          ref={pdfContainerRef}
          onClick={(e) => {
            if (activeTool === 'note') {
              handleNoteClick(e);
            }
          }}
          onMouseDown={(e) => {
            if (activeTool === 'eraser') {
              startErasing(e);
            }
          }}
          onMouseUp={stopErasing}
          onMouseLeave={stopErasing}
          onMouseMove={(e) => {
            // Always update eraser cursor position when in eraser mode
            if (activeTool === 'eraser') {
              const rect = pdfContainerRef.current?.getBoundingClientRect();
              if (rect) {
                setEraserPosition({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
                setShowEraserCursor(true);
              }
              
              // Perform erasing only if mouse is pressed
              handleErase(e);
            }
          }}
        >
          {pdfFile ? (
            <div className="relative">
              <Document
                file={pdfFile}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error('Error loading document:', error);
                  // If loading fails, use our simple fallback PDF
                  const fallbackPdfUrl = createFallbackPdf();
                  setPdfFile(fallbackPdfUrl);
                }}
                options={documentOptions}
              >
                {numPages && numPages > 0 && (
                  <Page
                    key={`page_${currentPage}`}
                    pageNumber={currentPage}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-xl bg-white"
                    onLoadError={(error) => {
                      console.error(`Error loading page ${currentPage}:`, error);
                    }}
                    onRenderError={(error) => {
                      console.error(`Error rendering page ${currentPage}:`, error);
                    }}
                    width={pdfDimensions?.width}
                  />
                )}
              </Document>
              
              {/* Drawing canvas */}
              <canvas
                ref={canvasRef}
                className={`absolute top-0 left-0 w-full h-full z-10 ${activeTool === 'pen' ? 'cursor-crosshair' : 'pointer-events-none'}`}
                style={{ touchAction: 'none' }}
                onMouseDown={activeTool === 'pen' ? startDrawing : undefined}
                onMouseMove={activeTool === 'pen' ? draw : undefined}
                onMouseUp={activeTool === 'pen' ? stopDrawing : undefined}
                onMouseOut={activeTool === 'pen' ? stopDrawing : undefined}
              />
              
              {/* Render highlights */}
              {highlights
                .filter(highlight => highlight.page === currentPage)
                .map(highlight => (
                  <div key={highlight.id}>
                    {highlight.position.rects.map((rect, index) => (
                      <div
                        key={`${highlight.id}_${index}`}
                        className="absolute z-8 pointer-events-none"
                        style={{
                          left: `${rect.x1 * scale}px`,
                          top: `${rect.y1 * scale}px`,
                          width: `${rect.width * scale}px`,
                          height: `${rect.height * scale}px`,
                          backgroundColor: `${highlight.color}80`,
                          borderRadius: '2px',
                        }}
                      />
                    ))}
                  </div>
                ))}
              
              {/* Render existing notes for the current page */}
              {notes
                .filter(note => note.page === currentPage)
                .map(note => (
                  <div
                    key={note.id}
                    id={note.id}
                    className="absolute z-10 w-48 rounded-md shadow-lg"
                    style={{ 
                      top: `${note.position.y}px`, 
                      left: `${note.position.x}px`,
                      backgroundColor: `${note.color}20`,
                      border: `2px solid ${note.color}`
                    }}
                  >
                    <div 
                      className="p-2 text-sm text-white cursor-pointer flex justify-between items-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        editNote(note.id);
                      }}
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium mb-1 truncate">Note</div>
                        <div className="text-white/80 text-xs whitespace-pre-wrap max-h-24 overflow-y-auto">
                          {note.content}
                        </div>
                      </div>
                      <button
                        className="ml-2 p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              
              {/* Eraser cursor */}
              {showEraserCursor && (
                <div
                  className="absolute rounded-full border-2 border-white/70 bg-red-500/30 pointer-events-none z-30"
                  style={{
                    width: '20px',
                    height: '20px',
                    transform: 'translate(-50%, -50%)',
                    top: `${eraserPosition.y}px`,
                    left: `${eraserPosition.x}px`
                  }}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/70">
              <File className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-xl mb-2">No PDF loaded</p>
              <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                Select a PDF
              </Button>
            </div>
          )}
          
          {/* Text selection popup */}
          {showTextSelector && selectedText && (
            <div 
              ref={textSelectorRef}
              className="absolute z-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg p-1 flex space-x-1"
              style={{ 
                top: `${textPosition.y - 50}px`, 
                left: `${textPosition.x - 40}px`,
              }}
            >
              <button 
                className="p-1 rounded-full bg-yellow-400/80 hover:bg-yellow-400 text-black"
                onClick={() => addHighlight('#ffeb3b')}
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <button 
                className="p-1 rounded-full bg-green-400/80 hover:bg-green-400 text-black"
                onClick={() => addHighlight('#4caf50')}
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <button 
                className="p-1 rounded-full bg-red-400/80 hover:bg-red-400 text-black"
                onClick={() => addHighlight('#f44336')}
              >
                <Highlighter className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Note editor */}
          {showNoteEditor && (
            <div
              ref={noteEditorRef}
              className="absolute z-20 w-64 bg-gray-800/90 backdrop-blur-md rounded-md shadow-xl border border-white/20"
              style={{ 
                top: `${notePosition.y}px`, 
                left: `${notePosition.x}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 border-b border-white/20 flex items-center justify-between">
                <div className="text-white font-medium">
                  {activeNote ? 'Edit Note' : 'New Note'}
                </div>
                <div className="flex space-x-1">
                  <button 
                    className="w-5 h-5 rounded-full bg-green-500 hover:ring-2 ring-white"
                    onClick={() => setNoteColor('#4caf50')}
                    style={{ border: noteColor === '#4caf50' ? '2px solid white' : 'none' }}
                  />
                  <button 
                    className="w-5 h-5 rounded-full bg-blue-500 hover:ring-2 ring-white"
                    onClick={() => setNoteColor('#2196f3')}
                    style={{ border: noteColor === '#2196f3' ? '2px solid white' : 'none' }}
                  />
                  <button 
                    className="w-5 h-5 rounded-full bg-purple-500 hover:ring-2 ring-white"
                    onClick={() => setNoteColor('#9c27b0')}
                    style={{ border: noteColor === '#9c27b0' ? '2px solid white' : 'none' }}
                  />
                  <button 
                    className="w-5 h-5 rounded-full bg-yellow-500 hover:ring-2 ring-white"
                    onClick={() => setNoteColor('#ffc107')}
                    style={{ border: noteColor === '#ffc107' ? '2px solid white' : 'none' }}
                  />
                </div>
              </div>
              <div className="p-2">
                <textarea
                  className="w-full h-24 bg-black/30 border border-white/20 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                  placeholder="Type your note here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-md"
                    onClick={() => setShowNoteEditor(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                    onClick={activeNote ? updateNote : saveNote}
                  >
                    {activeNote ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom navigation bar */}
        <div className="flex items-center justify-between p-3 border-t border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Button 
                variant="glass" 
                size="sm" 
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                icon={ChevronLeft}
              />
              <div className="min-w-[80px] text-center text-white">
                <span className="text-sm">{currentPage} / {numPages || '?'}</span>
              </div>
              <Button 
                variant="glass" 
                size="sm" 
                onClick={handleNextPage}
                disabled={!numPages || currentPage >= numPages}
                icon={ChevronRight}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="glass" size="sm" onClick={handleZoomOut} icon={ZoomOut} />
            <div className="min-w-[60px] text-center">
              <span className="text-sm text-white">{Math.round(scale * 100)}%</span>
            </div>
            <Button variant="glass" size="sm" onClick={handleZoomIn} icon={ZoomIn} />
            <Button variant="glass" size="sm" onClick={handleRotate} icon={RotateCw} />
            <div className="border-l border-white/10 mx-2 h-6"></div>
            <Button 
              variant="glass" 
              size="sm" 
              onClick={handleSave}
              icon={Download}
              title="Save Annotations"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer; 