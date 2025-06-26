import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../common/Button';
import { Download, X, Loader2, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { SharedFile } from '../../contexts/CollaborationContext';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface FilePreviewModalProps {
  file: SharedFile | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    if (!file) return null;

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

    const renderContent = () => {
        switch (file.type) {
            case 'image':
                return <img src={file.downloadUrl} alt={file.name} className="max-w-full max-h-[70vh] object-contain mx-auto" />;
            case 'pdf':
                return (
                    <div className="flex flex-col items-center">
                        <Document
                            file={file.downloadUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading PDF...</span></div>}
                            error={<div className="flex items-center justify-center h-64 text-red-500"><AlertTriangle className="h-8 w-8 mr-2" /> Error loading PDF.</div>}
                        >
                            <Page pageNumber={pageNumber} />
                        </Document>
                        {numPages && (
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <Button variant="outline" size="icon" onClick={handlePreviousPage} disabled={pageNumber <= 1}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <p>Page {pageNumber} of {numPages}</p>
                                <Button variant="outline" size="icon" onClick={handleNextPage} disabled={pageNumber >= numPages}>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                );
            case 'link':
                 return (
                    <div className="p-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">External Link</h3>
                        <p className="mb-4 text-gray-400">This is a link to an external resource.</p>
                        <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-primary-300 hover:underline break-all">{file.downloadUrl}</a>
                    </div>
                );
            default:
                return (
                     <div className="p-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
                        <p className="mb-4 text-gray-400">A preview for this file type ({file.type}) is not available. You can download it instead.</p>
                     </div>
                );
        }
    };

    return (
        <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-full bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle className="truncate">{file.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {renderContent()}
                </div>
                <DialogFooter className="justify-between">
                    <span className="text-sm text-gray-400">Uploaded by {file.user.name} on {file.date}</span>
                    <a 
                        href={file.downloadUrl} 
                        download={file.name}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-black font-medium"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </a>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 