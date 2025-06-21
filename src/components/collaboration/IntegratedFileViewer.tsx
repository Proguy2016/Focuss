import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { 
  ZoomIn, 
  ZoomOut, 
  Highlighter, 
  Pencil, 
  Type, 
  Download, 
  X, 
  Save,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCw
} from 'lucide-react';
import { SharedFile } from '../../contexts/CollaborationContext';
import { useCollaboration } from '../../contexts/CollaborationContext';

interface IntegratedFileViewerProps {
  file: SharedFile | null;
  onClose: () => void;
}

export const IntegratedFileViewer: React.FC<IntegratedFileViewerProps> = ({ file, onClose }) => {
  const { socketRef, currentUser } = useCollaboration();
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentTool, setCurrentTool] = useState<'highlight' | 'pencil' | 'text' | null>(null);
  const [lastEditBy, setLastEditBy] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showToolbar, setShowToolbar] = useState(true);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const annotationLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when file changes
    if (file) {
      setContent('');
      setIsEditing(false);
      setZoom(100);
      setCurrentTool(null);
      setCurrentPage(1);
      
      // Determine file type
      setIsPdf(file.type === 'pdf');
      setIsImage(file.type === 'image');
      
      // Load file content if it's a text file
      if (!isPdf && !isImage && file.downloadUrl) {
        fetchFileContent(file.downloadUrl);
      }
    }
  }, [file]);

  useEffect(() => {
    if (!socketRef.current) return;

    // Listen for document content updates from other users
    socketRef.current.on('documentUpdate', ({ fileId, newContent, editedBy }: { fileId: string, newContent: string, editedBy: string }) => {
      if (file && file.id === fileId) {
        setContent(newContent);
        setLastEditBy(editedBy);
      }
    });

    // Listen for annotation updates
    socketRef.current.on('annotationUpdate', ({ fileId, annotations, editedBy }: { fileId: string, annotations: any, editedBy: string }) => {
      if (file && file.id === fileId) {
        // Apply annotations to the PDF or image
        applyAnnotations(annotations);
        setLastEditBy(editedBy);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('documentUpdate');
        socketRef.current.off('annotationUpdate');
      }
    };
  }, [socketRef, file]);

  const fetchFileContent = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file content');
      
      const text = await response.text();
      setContent(text);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setContent('Error loading file content. The file might be binary or inaccessible.');
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Emit changes to other users
    if (socketRef.current && file) {
      socketRef.current.emit('documentEdit', {
        fileId: file.id,
        content: newContent,
        editedBy: currentUser?.name || 'Unknown user'
      });
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const toggleToolbar = () => {
    setShowToolbar(!showToolbar);
  };

  const handleSave = () => {
    if (!file) return;
    
    // Emit save event
    if (socketRef.current) {
      socketRef.current.emit('documentSave', {
        fileId: file.id,
        content,
        savedBy: currentUser?.name || 'Unknown user'
      });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleToolChange = (tool: 'highlight' | 'pencil' | 'text' | null) => {
    setCurrentTool(currentTool === tool ? null : tool);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Function to apply annotations received from other users
  const applyAnnotations = (annotations: any) => {
    // This would be implemented with a PDF annotation library
    console.log('Applying annotations:', annotations);
  };

  // Function to handle annotation creation
  const handleAnnotation = (e: React.MouseEvent) => {
    if (!currentTool || !annotationLayerRef.current) return;
    
    const rect = annotationLayerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Create annotation based on current tool
    const annotation = {
      type: currentTool,
      x,
      y,
      page: currentPage,
      color: currentTool === 'highlight' ? 'yellow' : 'red',
      text: currentTool === 'text' ? 'Text annotation' : '',
    };
    
    // Emit annotation to other users
    if (socketRef.current && file) {
      socketRef.current.emit('createAnnotation', {
        fileId: file.id,
        annotation,
        editedBy: currentUser?.name || 'Unknown user'
      });
    }
    
    // Apply annotation locally
    // This would be implemented with a PDF annotation library
    console.log('Created annotation:', annotation);
  };

  if (!file) return null;

  return (
    <Card variant="glass" className="flex flex-col h-full overflow-hidden">
      {showToolbar && (
        <>
          <div className="flex items-center justify-between p-2 border-b border-white/10">
            <div className="flex-1 min-w-0">
              <h3 className="text-md font-bold text-white truncate">{file.name}</h3>
              <p className="text-xs text-white/60 truncate">
                {lastEditBy ? `Last edited by ${lastEditBy}` : `Shared by ${file.user.name}`}
              </p>
            </div>
            <div className="flex gap-1">
              {isPdf && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-white/80 flex items-center">{zoom}%</span>
                  <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}
              {!isPdf && !isImage && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleEditMode}
                  title={isEditing ? 'View Mode' : 'Edit Mode'}
                >
                  {isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleToolbar}
                title="Hide Toolbar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isPdf && (
            <div className="flex items-center justify-center p-1 border-b border-white/10">
              <Button 
                variant={currentTool === 'highlight' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => handleToolChange('highlight')}
                title="Highlight Tool"
                className="px-2"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              <Button 
                variant={currentTool === 'pencil' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => handleToolChange('pencil')}
                title="Pencil Tool"
                className="px-2"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant={currentTool === 'text' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => handleToolChange('text')}
                title="Text Tool"
                className="px-2"
              >
                <Type className="h-4 w-4" />
              </Button>
              <div className="flex-1" />
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  title="Previous Page"
                  className="px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-white/80">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  title="Next Page"
                  className="px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="flex-1 overflow-auto relative">
        {!showToolbar && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleToolbar}
            title="Show Toolbar"
            className="absolute top-2 left-2 z-10 bg-black/30 hover:bg-black/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        
        {isPdf && file.downloadUrl && (
          <div 
            ref={pdfContainerRef} 
            className="relative w-full h-full flex items-center justify-center"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center top' }}
          >
            <iframe 
              src={`${file.downloadUrl}#toolbar=0&page=${currentPage}`} 
              className="w-full h-full" 
              title={file.name}
            />
            <div 
              ref={annotationLayerRef}
              className="absolute inset-0 z-10 pointer-events-auto"
              onClick={handleAnnotation}
              style={{ display: currentTool ? 'block' : 'none' }}
            />
          </div>
        )}
        
        {isImage && file.downloadUrl && (
          <div className="flex items-center justify-center h-full">
            <img 
              src={file.downloadUrl} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain" 
              style={{ transform: `scale(${zoom / 100})` }}
            />
          </div>
        )}
        
        {!isPdf && !isImage && (
          isEditing ? (
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              className="w-full h-full p-4 bg-black/20 text-white font-mono resize-none focus:outline-none"
              spellCheck="false"
            />
          ) : (
            <pre className="w-full h-full p-4 bg-black/20 text-white font-mono whitespace-pre-wrap">
              {content}
            </pre>
          )
        )}
      </div>
      
      {isEditing && !isPdf && !isImage && (
        <div className="p-2 border-t border-white/10 flex justify-end">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      )}
    </Card>
  );
}; 