import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ChevronLeft, ChevronRight, FileText, Maximize2, Minimize2, SplitSquareHorizontal, Loader2, AlertTriangle } from 'lucide-react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

export const WhiteboardWithPDF: React.FC = () => {
  const { files, tldrawStore, handleTldrawMount } = useCollaboration();
  const [selectedFile, setSelectedFile] = useState<typeof files[0] | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'pdf-only' | 'whiteboard-only'>('split');
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [splitRatio, setSplitRatio] = useState(50); // 50% for each side in split mode

  const handleCloseViewer = () => {
    setSelectedFile(null);
  };

  const toggleViewMode = () => {
    if (viewMode === 'split') {
      setViewMode('pdf-only');
    } else if (viewMode === 'pdf-only') {
      setViewMode('whiteboard-only');
    } else {
      setViewMode('split');
    }
  };

  const toggleFileSelector = () => {
    setShowFileSelector(!showFileSelector);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handlePreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  // Calculate classes based on view mode
  const getWhiteboardClasses = () => {
    if (viewMode === 'whiteboard-only') return 'flex-1';
    if (viewMode === 'pdf-only') return 'hidden';
    return `w-[${100 - splitRatio}%]`;
  };

  const getPdfClasses = () => {
    if (viewMode === 'pdf-only') return 'flex-1';
    if (viewMode === 'whiteboard-only') return 'hidden';
    return `w-[${splitRatio}%]`;
  };

  const getViewModeButtonText = () => {
    switch (viewMode) {
      case 'split': return 'PDF Only';
      case 'pdf-only': return 'Whiteboard Only';
      case 'whiteboard-only': return 'Split View';
      default: return 'Change View';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-white">Collaborative Whiteboard & PDF</h3>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={toggleFileSelector}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            {selectedFile ? 'Change PDF' : 'Select PDF'}
          </Button>
          {selectedFile && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleViewMode}
              className="flex items-center gap-1"
            >
              <SplitSquareHorizontal className="h-4 w-4" />
              {getViewModeButtonText()}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-2 overflow-hidden">
        {/* Whiteboard area */}
        <div 
          className={`${viewMode === 'whiteboard-only' ? 'flex-1' : viewMode === 'pdf-only' ? 'hidden' : 'w-[70%]'}`}
        >
          <Tldraw store={tldrawStore} onMount={handleTldrawMount} />
        </div>

        {/* PDF viewer */}
        {selectedFile ? (
          <div className={`${viewMode === 'pdf-only' ? 'flex-1' : viewMode === 'whiteboard-only' ? 'hidden' : 'w-[30%]'} bg-gray-900 rounded-lg overflow-hidden flex flex-col`}>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <Document
                file={selectedFile.downloadUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading PDF...</span></div>}
                error={<div className="flex items-center justify-center h-64 text-red-500"><AlertTriangle className="h-8 w-8 mr-2" /> Error loading PDF.</div>}
              >
                <Page pageNumber={pageNumber} />
              </Document>
            </div>
            {numPages && (
              <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-800">
                <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={pageNumber <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <p>Page {pageNumber} of {numPages}</p>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={pageNumber >= numPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card variant="glass" className="p-6 text-center max-w-lg">
              <FileText className="h-12 w-12 text-white/40 mx-auto mb-2" />
              <p className="text-white/60">Select a PDF to view alongside the whiteboard</p>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={toggleFileSelector}
                className="mt-4"
              >
                Select PDF
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* File selector overlay */}
      {showFileSelector && (
        <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center p-8">
          <Card variant="glass" className="w-full max-w-2xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Select a PDF</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleFileSelector}
              >
                Close
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {files.filter(file => file.type === 'pdf').length === 0 ? (
                <p className="text-white/60 text-center py-8">No PDF files available</p>
              ) : (
                files
                  .filter(file => file.type === 'pdf')
                  .map(file => (
                    <div 
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedFile(file);
                        setShowFileSelector(false);
                      }}
                    >
                      <FileText className="h-6 w-6 text-red-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white/90">{file.name}</p>
                        <p className="text-xs text-white/60">{file.size} - Shared by {file.user.name}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}; 