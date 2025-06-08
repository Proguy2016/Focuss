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

// Configure pdfjs worker and create document options outside component
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf-worker/pdf.worker.js`;

// Memoize these values outside the component to prevent unnecessary re-renders
const PDF_OPTIONS = {
  cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`
};

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

// New interface for bookmarks
interface Bookmark {
  id: string;
  page: number;
  title: string;
  timestamp: number;
  color?: string; // Optional color for visualization
}

// New interface for text annotations
interface TextAnnotation {
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
  selectedText: string;
  comment: string;
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
  const [scale, setScale] = useState(0.6); // Lower initial zoom level to show full page
  const [rotation, setRotation] = useState(0);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'annotations' | 'bookmarks'>('thumbnails');
  const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'pen' | 'note' | 'eraser' | 'bookmark'>('select');
  
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
  const [isErasing, setIsErasing] = useState(false);
  
  // Notes state
  const [notes, setNotes] = useState<Annotation[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [notePosition, setNotePosition] = useState({ x: 0, y: 0 });
  const [noteText, setNoteText] = useState('');
  const [noteColor, setNoteColor] = useState('#4caf50');
  
  // Bookmark state
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  
  // Text annotation state
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [showTextAnnotationEditor, setShowTextAnnotationEditor] = useState(false);
  const [textAnnotationPosition, setTextAnnotationPosition] = useState({ x: 0, y: 0 });
  const [textAnnotationText, setTextAnnotationText] = useState('');
  const [textAnnotationColor, setTextAnnotationColor] = useState('#2196f3');
  const [activeTextAnnotation, setActiveTextAnnotation] = useState<string | null>(null);
  const [textAnnotationSelectedText, setTextAnnotationSelectedText] = useState('');
  const [textAnnotationBoundingRect, setTextAnnotationBoundingRect] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  } | null>(null);
  
  // Refs
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const textSelectorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noteEditorRef = useRef<HTMLDivElement>(null);
  const bookmarkDialogRef = useRef<HTMLDivElement>(null);
  const textAnnotationEditorRef = useRef<HTMLDivElement>(null);

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

  // Worker is now configured globally outside the component

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

  // Define basic bookmark functions before they're used
  const handleBookmarkClick = () => {
    // Check if another dialog is open first
    if (showNoteEditor || showTextAnnotationEditor) {
      return; // Don't open bookmark dialog if another dialog is open
    }
    
    setBookmarkTitle(`Page ${currentPage}`);
    setShowBookmarkDialog(true);
  };
  
  const jumpToBookmark = (page: number) => {
    setCurrentPage(page);
  };
  
  const addBookmark = () => {
    // Create a new bookmark for the current page
    const newBookmark: Bookmark = {
      id: `bookmark_${Date.now()}`,
      page: currentPage,
      title: bookmarkTitle || `Page ${currentPage}`,
      timestamp: Date.now(),
      color: '#f44336' // Default color for bookmarks
    };
    
    setBookmarks([...bookmarks, newBookmark]);
    setShowBookmarkDialog(false);
    setBookmarkTitle('');
    
    // Optionally switch to bookmarks tab in sidebar
    setActiveTab('bookmarks');
    setSidebarOpen(true);
  };
  
  const editBookmark = (id: string, newTitle: string) => {
    setBookmarks(bookmarks.map(bookmark => 
      bookmark.id === id ? { ...bookmark, title: newTitle } : bookmark
    ));
  };
  
  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  // Define text annotation functions
  const resetTextAnnotationState = () => {
    setActiveTextAnnotation(null);
    setTextAnnotationText('');
    setTextAnnotationSelectedText('');
    setTextAnnotationBoundingRect(null);
  };

  // Add a state to track mouse position
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverPdf, setIsMouseOverPdf] = useState(false);
  
  // Add a handler to update mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleTextAnnotationSelection = () => {
    // Only handle selections when the note tool is active
    if (activeTool !== 'note') return;
    
    // Don't do anything if mouse is not over PDF
    if (!isMouseOverPdf) return;
    
    // Close any existing text annotation editor
    if (showTextAnnotationEditor) {
      setShowTextAnnotationEditor(false);
      resetTextAnnotationState();
    }
    
    // Get the current selection
    const selection = window.getSelection();
    if (!selection) return;
    
    // Get selected text if any
    const selectedText = selection.toString().trim();
    
    try {
      // Use absolute screen coordinates for the annotation rectangle
      const mouseX = lastMousePosition.x;
      const mouseY = lastMousePosition.y;
      
      // Create a fixed size rectangle (100x20 pixels) at cursor position
      const boundingRect = {
        x1: mouseX,
        y1: mouseY,
        x2: mouseX + 100,
        y2: mouseY + 20,
        width: 100,
        height: 20
      };
      
      // Store the selected text and its position
      setTextAnnotationSelectedText(selectedText);
      setTextAnnotationBoundingRect(boundingRect);
      
      // Position the editor at the center top of the viewport
      const viewportWidth = window.innerWidth;
      
      setTextAnnotationPosition({
        x: viewportWidth / 2 - 150, // Center the 300px dialog
        y: 100 // Fixed position from top
      });
      
      // Show the editor
      setShowTextAnnotationEditor(true);
      setActiveTextAnnotation(null); // We're creating a new annotation
      setTextAnnotationText(''); // Clear previous text
    } catch (error) {
      console.error('Error creating text annotation:', error);
    }
  };
  
  const addTextAnnotation = () => {
    if (!textAnnotationBoundingRect) return;
    
    // Create a simple annotation with a fixed rectangle
    const newTextAnnotation: TextAnnotation = {
      id: `text_annotation_${Date.now()}`,
      page: currentPage,
      position: {
        boundingRect: {
          x1: textAnnotationBoundingRect.x1,
          y1: textAnnotationBoundingRect.y1,
          x2: textAnnotationBoundingRect.x2,
          y2: textAnnotationBoundingRect.y2,
          width: textAnnotationBoundingRect.width,
          height: textAnnotationBoundingRect.height
        },
        rects: [{
          x1: textAnnotationBoundingRect.x1,
          y1: textAnnotationBoundingRect.y1,
          x2: textAnnotationBoundingRect.x2,
          y2: textAnnotationBoundingRect.y2,
          width: textAnnotationBoundingRect.width,
          height: textAnnotationBoundingRect.height
        }]
      },
      selectedText: textAnnotationSelectedText,
      comment: textAnnotationText,
      color: textAnnotationColor,
      timestamp: Date.now()
    };
    
    setTextAnnotations([...textAnnotations, newTextAnnotation]);
    setShowTextAnnotationEditor(false);
    resetTextAnnotationState();
    
    // Clear selection after creating the annotation
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
  };
  
  const updateTextAnnotation = () => {
    if (!activeTextAnnotation) return;
    
    setTextAnnotations(textAnnotations.map(annotation => 
      annotation.id === activeTextAnnotation 
        ? { 
            ...annotation, 
            comment: textAnnotationText,
            color: textAnnotationColor 
          } 
        : annotation
    ));
    
    setShowTextAnnotationEditor(false);
    resetTextAnnotationState();
    
    // Clear selection after updating the annotation
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
  };
  
  const deleteTextAnnotation = (id: string) => {
    setTextAnnotations(textAnnotations.filter(annotation => annotation.id !== id));
    
    if (activeTextAnnotation === id) {
      setShowTextAnnotationEditor(false);
      resetTextAnnotationState();
    }
  };
  
  const editTextAnnotation = (id: string) => {
    const annotation = textAnnotations.find(a => a.id === id);
    if (!annotation) return;
    
    // Position the editor at the center top of the viewport
    const viewportWidth = window.innerWidth;
    
    setTextAnnotationPosition({
      x: viewportWidth / 2 - 150, // Center the 300px dialog
      y: 100 // Fixed position from top
    });
    
    setActiveTextAnnotation(id);
    setTextAnnotationText(annotation.comment);
    setTextAnnotationColor(annotation.color);
    setTextAnnotationSelectedText(annotation.selectedText);
    setShowTextAnnotationEditor(true);
  };

  // Update the mouse up handler for text selection - now auto-highlights without showing the selector
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Clear selection when using eraser to prevent weird text selection behavior
      if (activeTool === 'eraser') {
        const selection = window.getSelection();
        if (selection) selection.removeAllRanges();
        return;
      }
      
      // For bookmark tool, handle it in the main container click handler
      if (activeTool === 'bookmark') {
        return;
      }
      
      // For text annotation tool, handle the selection
      if (activeTool === 'note') {
        // Only handle text annotation when no dialog is open
        if (!showTextAnnotationEditor && !showNoteEditor && !showBookmarkDialog) {
          handleTextAnnotationSelection();
        }
        return;
      }
      
      if (activeTool !== 'highlight') return;
      
      // Don't process highlights if any dialog is open
      if (showTextAnnotationEditor || showNoteEditor || showBookmarkDialog) {
        return;
      }
      
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
  }, [activeTool, currentPage, scale, showTextAnnotationEditor, showNoteEditor, showBookmarkDialog]);

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
        // Get the PDF page element to properly size the canvas
        const pageElement = pdfContainerRef.current.querySelector('.react-pdf__Page');
        if (!pageElement) return;
        
        const pageRect = pageElement.getBoundingClientRect();
        
        // Set canvas dimensions to match PDF page size exactly
        canvas.width = pageRect.width;
        canvas.height = pageRect.height;
        
        // Clear canvas completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw existing drawings for current page only
        renderDrawings(ctx);
      }
    }
  }, [currentPage, drawings, scale, rotation]);

  // Function to render all drawings on canvas
  const renderDrawings = useCallback((ctx: CanvasRenderingContext2D) => {
    // Only render drawings for current page
    const pageDrawings = drawings.filter(d => d.page === currentPage);

    // Clear canvas first to prevent artifacts
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
      
      // Set canvas size to match PDF page size exactly
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Position the canvas exactly over the PDF page
      canvas.style.position = 'absolute';
      canvas.style.top = `${rect.top - container.getBoundingClientRect().top}px`;
      canvas.style.left = `${rect.left - container.getBoundingClientRect().left}px`;
      
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
  }, [renderDrawings, scale, rotation, currentPage]);
  
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
      
      // Use client coordinates for cursor positioning
      // This ensures the cursor follows the mouse exactly
      setEraserPosition({
        x: e.clientX,
        y: e.clientY
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
  const handleErase = useCallback((e: React.MouseEvent) => {
    // Only perform erasing if the mouse button is pressed (click or drag)
    if (activeTool !== 'eraser' || !isErasing) return;
    
    const container = pdfContainerRef.current;
    if (!container) return;
    
    // Get the PDF page element for correct coordinates
    const pdfPage = container.querySelector('.react-pdf__Page');
    if (!pdfPage) return;
    
    const pageRect = pdfPage.getBoundingClientRect();
    
    // Client coordinates for cursor display
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // Page-relative coordinates for erasing
    // These coordinates are relative to the PDF page element
    const pageX = clientX - pageRect.left;
    const pageY = clientY - pageRect.top;
    
    // Update eraser cursor position using client coordinates
    setEraserPosition({
      x: clientX,
      y: clientY
    });
    setShowEraserCursor(true);
    
    // Define eraser radius - bigger for easier erasing
    const eraserRadius = 20; // Match to the visual cursor size (40px/2)
    
    // 1. Find and filter drawings within the eraser radius
    const updatedDrawings = drawings.filter(drawing => {
      if (drawing.page !== currentPage) return true;
      
      // Check if any point is within the eraser radius
      const pointInEraser = drawing.points.some(point => {
        // Need to convert the stored normalized points to screen coordinates
        const screenX = point.x * scale;
        const screenY = point.y * scale;
        
        const distance = Math.sqrt(
          Math.pow(screenX - pageX, 2) + Math.pow(screenY - pageY, 2)
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
        // Calculate the center point of the highlight rectangle in screen coordinates
        const rectCenterX = ((rect.x1 + rect.x2) / 2) * scale;
        const rectCenterY = ((rect.y1 + rect.y2) / 2) * scale;
        
        const distance = Math.sqrt(
          Math.pow(rectCenterX - pageX, 2) + Math.pow(rectCenterY - pageY, 2)
        );
        
        return distance < eraserRadius;
      });
      
      // Keep the highlight if it's not within the eraser radius
      return !highlightInEraser;
    });
    
    // 3. Find and filter text annotations within the eraser radius
    const updatedTextAnnotations = textAnnotations.filter(annotation => {
      if (annotation.page !== currentPage) return true;
      
      // First check if annotation has rects
      if (annotation.position.rects && annotation.position.rects.length > 0) {
        // Check if any rect of the annotation is within the eraser radius
        const annotationInEraser = annotation.position.rects.some(rect => {
          // Calculate the center point of the annotation rectangle in screen coordinates
          const rectCenterX = ((rect.x1 + rect.x2) / 2) * scale;
          const rectCenterY = ((rect.y1 + rect.y2) / 2) * scale;
          
          const distance = Math.sqrt(
            Math.pow(rectCenterX - pageX, 2) + Math.pow(rectCenterY - pageY, 2)
          );
          
          return distance < eraserRadius;
        });
        
        // Keep the annotation if it's not within the eraser radius
        return !annotationInEraser;
      } else {
        // Fallback to bounding rect if no rects available
        const { boundingRect } = annotation.position;
        
        // Calculate the center point of the annotation rectangle in screen coordinates
        const rectCenterX = ((boundingRect.x1 + boundingRect.x2) / 2) * scale;
        const rectCenterY = ((boundingRect.y1 + boundingRect.y2) / 2) * scale;
        
        const distance = Math.sqrt(
          Math.pow(rectCenterX - pageX, 2) + Math.pow(rectCenterY - pageY, 2)
        );
        
        // Keep the annotation if it's not within the eraser radius
        return distance >= eraserRadius;
      }
    });
    
    // 4. Update drawings if any were erased
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
    
    // 5. Update highlights if any were erased
    if (updatedHighlights.length !== highlights.length) {
      setHighlights(updatedHighlights);
    }
    
    // 6. Update text annotations if any were erased
    if (updatedTextAnnotations.length !== textAnnotations.length) {
      setTextAnnotations(updatedTextAnnotations);
    }
    
  }, [activeTool, currentPage, drawings, renderDrawings, isErasing, scale, highlights, textAnnotations]);

  // Define eraser action handlers
  const startErasing = useCallback((e: React.MouseEvent) => {
    // Prevent default to disable text selection
    e.preventDefault();
    
    // Clear any existing selection
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
    
    setIsErasing(true);
    handleErase(e); // Start erasing immediately on click
  }, [handleErase]);
  
  const stopErasing = useCallback(() => {
    setIsErasing(false);
  }, []);

  // Add note functionality
  const handleNoteClick = (e: React.MouseEvent) => {
    if (activeTool !== 'note') return;
    
    // Don't process note click if we're in text selection mode or any dialog is open
    if (showTextAnnotationEditor || showNoteEditor || showBookmarkDialog) {
      return;
    }
    
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
    
    // Prevent default to avoid text selection
    e.preventDefault();
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

  // Update the save functionality to save PDF with annotations
  const handleSave = async () => {
    if (!pdfFile) return;
    
    try {
      // Get PDF document
      const loadingTask = pdfjs.getDocument(pdfFile);
      const pdf = await loadingTask.promise;
      
      // Create a canvas for each page
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Create a new PDF document
      const mergedPdf = await import('jspdf').then(module => new module.default('portrait', 'pt'));
      
      // Loop through pages
      for (let i = 1; i <= pdf.numPages; i++) {
        // Get the page
        const page = await pdf.getPage(i);
        
        // Set canvas dimensions to match page size
        const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better quality
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render page to canvas
        await page.render({
          canvasContext: ctx,
          viewport
        }).promise;
        
        // Draw highlights for this page
        const pageHighlights = highlights.filter(h => h.page === i);
        pageHighlights.forEach(highlight => {
          ctx.fillStyle = `${highlight.color}80`;
          highlight.position.rects.forEach(rect => {
            ctx.fillRect(
              rect.x1 * 1.5, 
              rect.y1 * 1.5, 
              rect.width * 1.5, 
              rect.height * 1.5
            );
          });
        });
        
        // Draw text annotations for this page
        const pageTextAnnotations = textAnnotations.filter(a => a.page === i);
        pageTextAnnotations.forEach(annotation => {
          // Set the fill style with transparency
          ctx.fillStyle = `${annotation.color}40`;
          
          // If the annotation has rects, use them for more accurate rendering
          if (annotation.position.rects && annotation.position.rects.length > 0) {
            // Draw each rect in the annotation
            annotation.position.rects.forEach(rect => {
              ctx.fillRect(
                rect.x1 * 1.5, 
                rect.y1 * 1.5, 
                rect.width * 1.5, 
                rect.height * 1.5
              );
            });
          } else {
            // Fallback to bounding rect if no rects available
            const { boundingRect } = annotation.position;
            const width = (boundingRect.x2 - boundingRect.x1) * 1.5;
            const height = (boundingRect.y2 - boundingRect.y1) * 1.5;
            
            ctx.fillRect(
              boundingRect.x1 * 1.5, 
              boundingRect.y1 * 1.5, 
              width, 
              height
            );
          }
        });
        
        // Draw drawings for this page
        const pageDrawings = drawings.filter(d => d.page === i);
        pageDrawings.forEach(drawing => {
          if (drawing.points.length < 2) return;
          
          ctx.strokeStyle = drawing.color;
          ctx.lineWidth = drawing.width * 1.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.beginPath();
          ctx.moveTo(drawing.points[0].x * 1.5, drawing.points[0].y * 1.5);
          
          for (let j = 1; j < drawing.points.length; j++) {
            ctx.lineTo(drawing.points[j].x * 1.5, drawing.points[j].y * 1.5);
          }
          ctx.stroke();
        });
        
        // Add the page to the PDF (except for the last page)
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = mergedPdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add page to PDF
        if (i > 1) {
          mergedPdf.addPage();
        }
        mergedPdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        // Clear canvas for next page
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Save PDF
      mergedPdf.save(`annotated_document_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      // Also save the annotations data as JSON
    const annotationsData = {
      highlights,
      notes,
      drawings,
        bookmarks,
        textAnnotations,
      timestamp: new Date().toISOString(),
      documentInfo: {
        numPages,
        title: 'Document Annotations'
      }
    };
    
    // Convert to JSON
    const jsonString = JSON.stringify(annotationsData, null, 2);
    
      // Create a blob and download link for annotations JSON
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      
      // Create download link and trigger it for JSON
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `annotations_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
    
    // Clean up
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Failed to save PDF with annotations. Please try again.');
    }
  };

  // Using the predefined PDF_OPTIONS constant

  // Completely disable text selection when eraser is active
  useEffect(() => {
    // Create a style element to disable text selection
    const styleId = 'disable-text-selection-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (activeTool === 'eraser') {
      // If eraser is active, add or update style to disable text selection
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      // Add CSS to disable text selection everywhere in the document
      styleElement.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        ::selection {
          background: transparent !important;
        }
      `;
      
      // Also immediately clear any existing selection
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
    } else {
      // If not in eraser mode, remove the style element if it exists
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    }
    
    // Cleanup
    return () => {
      const el = document.getElementById(styleId);
      if (el) document.head.removeChild(el);
    };
  }, [activeTool]);

  // Basic PDF functions
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clean up previous blob URL if needed
      if (typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) {
        URL.revokeObjectURL(pdfFile);
      }
      
      // Use FileReader to load the PDF
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPdfFile(fileReader.result);
        setCurrentPage(1);
      };
      fileReader.onerror = (error) => {
        console.error('Error reading file:', error);
        const fallbackPdfUrl = createFallbackPdf();
        setPdfFile(fallbackPdfUrl);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Drawing functionality
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'pen') return;
    
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get canvas rect
    const rect = canvas.getBoundingClientRect();
    
    // Get the exact position relative to the canvas
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Create a new drawing path with first point
    const newDrawing: DrawingPath = {
      id: `drawing_${Date.now()}`,
      points: [{ x, y }],
      color: penColor,
      width: penWidth,
      page: currentPage,
      timestamp: Date.now()
    };

    setCurrentDrawing(newDrawing);
  }, [activeTool, currentPage, penColor, penWidth, scale]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Get position relative to canvas
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Add new point to current drawing
    const updatedDrawing = {
      ...currentDrawing,
      points: [...currentDrawing.points, { x, y }]
    };

    setCurrentDrawing(updatedDrawing);

    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const { points, color, width } = updatedDrawing;
      const lastPoint = points[points.length - 2];
      const currentPoint = points[points.length - 1];

      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      // Apply scale when drawing on canvas
      ctx.moveTo(lastPoint.x * scale, lastPoint.y * scale);
      ctx.lineTo(currentPoint.x * scale, currentPoint.y * scale);
      ctx.stroke();
    }
  }, [isDrawing, currentDrawing, scale]);

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentDrawing) {
      setDrawings(prev => [...prev, currentDrawing]);
      setCurrentDrawing(null);
      setIsDrawing(false);
    }
  }, [isDrawing, currentDrawing]);

  // Render text annotations with absolute positioning
  const renderTextAnnotation = (annotation: TextAnnotation) => {
    if (annotation.page !== currentPage) return null;
    
    // Get position data
    const { boundingRect } = annotation.position;
    
    return (
      <div key={annotation.id} className="group">
        <div
          className="fixed z-20 cursor-pointer group"
          style={{
            left: `${boundingRect.x1}px`,
            top: `${boundingRect.y1}px`,
            width: `${boundingRect.width}px`,
            height: `${boundingRect.height}px`,
            backgroundColor: `${annotation.color}40`,
            borderRadius: '2px',
          }}
          onClick={() => editTextAnnotation(annotation.id)}
        >
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-0 mb-1 z-50 w-64 bg-gray-800/95 backdrop-blur-md rounded shadow-lg border border-white/20 p-2">
            <div className="text-xs text-white/70 mb-1">Comment:</div>
            <div className="text-sm text-white p-2 bg-black/30 rounded max-h-32 overflow-y-auto">
              {annotation.comment || <span className="text-white/50 italic">No comment added</span>}
            </div>
            <div className="flex justify-end mt-1">
              <button
                className="text-xs text-white/70 hover:text-white px-2 py-1 hover:bg-white/10 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  editTextAnnotation(annotation.id);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <div className="space-y-2">
                {bookmarks.length > 0 ? (
                  bookmarks
                    .sort((a, b) => a.page - b.page) // Sort by page number
                    .map((bookmark) => (
                      <div 
                        key={bookmark.id}
                        className="p-2 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer group"
                        onClick={() => jumpToBookmark(bookmark.page)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 rounded-full" style={{ backgroundColor: bookmark.color }}>
                              <Bookmark className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-white font-medium">{bookmark.title}</div>
                              <div className="text-xs text-white/50">Page {bookmark.page}</div>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <button
                              className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Implement edit bookmark functionality here
                                const newTitle = window.prompt('Enter new bookmark title:', bookmark.title);
                                if (newTitle) {
                                  editBookmark(bookmark.id, newTitle);
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this bookmark?')) {
                                  deleteBookmark(bookmark.id);
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
              <div className="text-center py-10 text-white/40">
                <Bookmark className="inline-block w-6 h-6 mb-2 opacity-50" />
                <p>No bookmarks</p>
                    <p className="text-xs mt-1">Use the bookmark tool to add bookmarks</p>
                  </div>
                )}
                
                <div className="flex justify-center mt-4">
                  <button
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-1"
                    onClick={handleBookmarkClick}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Bookmark Current Page</span>
                  </button>
                </div>
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
              <Button 
                variant={activeTool === 'bookmark' ? 'glass' : 'outline'}
                size="sm"
                className={activeTool === 'bookmark' ? 'bg-white/10 text-blue-300' : ''}
                onClick={() => setActiveTool('bookmark')}
                icon={Bookmark}
                title="Add Bookmark"
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
          className={`flex-1 overflow-auto flex items-center justify-center p-4 relative ${activeTool === 'eraser' ? 'select-none' : ''}`} 
          ref={pdfContainerRef}
          onClick={(e) => {
            // Don't handle clicks when dialogs are open
            if (showTextAnnotationEditor || showBookmarkDialog || showNoteEditor) {
              return;
            }
            
            // Handle bookmark tool click
            if (activeTool === 'bookmark') {
              handleBookmarkClick();
              e.stopPropagation();
              return;
            }
            
            // Handle note tool click for adding notes at specific positions
            if (activeTool === 'note') {
              handleNoteClick(e);
              e.stopPropagation();
              return;
            }
          }}
          onMouseEnter={() => setIsMouseOverPdf(true)}
          onMouseLeave={() => {
            setIsMouseOverPdf(false);
            stopErasing();
          }}
          onMouseDown={(e) => {
            if (activeTool === 'eraser') {
              startErasing(e);
            }
          }}
          onMouseUp={(e) => {
            stopErasing();
            
            // Handle text annotation
            if (activeTool === 'note') {
              // Only handle text annotation when no dialog is open
              if (!showTextAnnotationEditor && !showNoteEditor && !showBookmarkDialog) {
                handleTextAnnotationSelection();
              }
            }
          }}
          onMouseMove={(e) => {
            // Always update eraser cursor position when in eraser mode
            if (activeTool === 'eraser') {
              // Prevent default browser behavior and text selection
              e.preventDefault();
              
              // Use client coordinates for cursor positioning
              setEraserPosition({
                x: e.clientX,
                y: e.clientY
              });
              setShowEraserCursor(true);
              
              // Perform erasing only if mouse is pressed
              handleErase(e);
              
              // Clear any text selection that might occur
              const selection = window.getSelection();
              if (selection) selection.removeAllRanges();
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
                options={PDF_OPTIONS}
              >
                {numPages && numPages > 0 && (
                  <Page
                    key={`page_${currentPage}`}
                    pageNumber={currentPage}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-xl bg-white max-w-full"
                    onLoadError={(error) => {
                      console.error(`Error loading page ${currentPage}:`, error);
                    }}
                    onRenderError={(error) => {
                      console.error(`Error rendering page ${currentPage}:`, error);
                    }}
                    // Don't set a fixed width, let the page scale naturally
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
              
              {/* Eraser cursor - positioned directly under the mouse pointer */}
              {showEraserCursor && (
                <div
                  className="fixed rounded-full border-2 border-white/70 bg-red-500/30 pointer-events-none z-30"
                  style={{
                    width: '40px',
                    height: '40px',
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
          
          {/* Bookmark dialog */}
          {showBookmarkDialog && (
            <div
              ref={bookmarkDialogRef}
              className="fixed z-50 inset-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the overlay
            >
              <div 
                className="w-80 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/20 p-4"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.95)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-white text-lg font-medium mb-3">Add Bookmark</h3>
                <div className="mb-4">
                  <label className="block text-white/70 text-sm mb-1">Bookmark Title</label>
                  <input
                    type="text"
                    value={bookmarkTitle}
                    onChange={(e) => setBookmarkTitle(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter bookmark title"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBookmarkDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={addBookmark}
                  >
                    Add Bookmark
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Text annotation editor */}
          {showTextAnnotationEditor && (
            <div
              ref={textAnnotationEditorRef}
              className="fixed z-50 w-300px bg-gray-800/95 backdrop-blur-md rounded-md shadow-xl border border-white/20"
              style={{ 
                top: `${textAnnotationPosition.y}px`, 
                left: `${textAnnotationPosition.x}px`,
                width: '300px',
                backgroundColor: 'rgba(30, 41, 59, 0.95)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 border-b border-white/20 flex items-center justify-between">
                <div className="text-white font-medium">
                  {activeTextAnnotation ? 'Edit Comment' : 'Add Comment'}
                </div>
                <div className="flex space-x-1">
              <button 
                    className="w-5 h-5 rounded-full bg-blue-500 hover:ring-2 ring-white"
                    onClick={() => setTextAnnotationColor('#2196f3')}
                    style={{ border: textAnnotationColor === '#2196f3' ? '2px solid white' : 'none' }}
                  />
                  <button 
                    className="w-5 h-5 rounded-full bg-purple-500 hover:ring-2 ring-white"
                    onClick={() => setTextAnnotationColor('#9c27b0')}
                    style={{ border: textAnnotationColor === '#9c27b0' ? '2px solid white' : 'none' }}
                  />
                  <button 
                    className="w-5 h-5 rounded-full bg-orange-500 hover:ring-2 ring-white"
                    onClick={() => setTextAnnotationColor('#ff9800')}
                    style={{ border: textAnnotationColor === '#ff9800' ? '2px solid white' : 'none' }}
                  />
                </div>
              </div>
              <div className="p-2">
                <div className="mb-2 text-xs text-white/60 italic line-clamp-2">
                  "{textAnnotationSelectedText}"
                </div>
                <textarea
                  value={textAnnotationText}
                  onChange={(e) => setTextAnnotationText(e.target.value)}
                  className="w-full h-24 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add your comment..."
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowTextAnnotationEditor(false);
                      resetTextAnnotationState();
                      // Clear the selection after canceling
                      const selection = window.getSelection();
                      if (selection) selection.removeAllRanges();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (activeTextAnnotation) {
                        updateTextAnnotation();
                      } else {
                        addTextAnnotation();
                      }
                      // Clear the selection after adding/updating
                      const selection = window.getSelection();
                      if (selection) selection.removeAllRanges();
                    }}
                  >
                    {activeTextAnnotation ? 'Update' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Render text annotations */}
          {textAnnotations.map(renderTextAnnotation)}
          
          {/* Render notes for the current page */}
              {notes
                .filter(note => note.page === currentPage)
                .map(note => (
                  <div
                    key={note.id}
                    id={note.id}
                className="absolute z-20 w-48 rounded-md shadow-lg"
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
          
          {/* Note editor */}
          {showNoteEditor && (
            <div
              ref={noteEditorRef}
              className="absolute z-50 w-64 bg-gray-800/95 backdrop-blur-md rounded-md shadow-xl border border-white/20"
              style={{ 
                top: `${notePosition.y}px`, 
                left: `${notePosition.x}px`,
                backgroundColor: 'rgba(30, 41, 59, 0.95)'
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