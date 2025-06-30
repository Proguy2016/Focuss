import React, { useState } from 'react';
import { X, Download, ExternalLink, FileText, Image, Video, Music, Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (type.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-6 h-6" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
          <img
            src="https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2"
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-custom"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    }

    if (file.type.includes('pdf')) {
      return (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-theme-red" />
          <p className="text-lg font-semibold text-theme-dark mb-2">PDF Document</p>
          <p className="text-theme-gray-dark">Preview not available. Click download to view.</p>
        </div>
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-theme-primary" />
          <p className="text-lg font-semibold text-theme-dark mb-2">Video File</p>
          <p className="text-theme-gray-dark">Video preview coming soon</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        {getFileIcon(file.type)}
        <p className="text-lg font-semibold text-theme-dark mb-2 mt-4">File Preview</p>
        <p className="text-theme-gray-dark">Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white border-theme-primary/20 shadow-custom-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/5 rounded-lg">
              {getFileIcon(file.type)}
            </div>
            <div>
              <DialogTitle className="font-bold text-theme-dark">{file.name}</DialogTitle>
              <div className="flex items-center gap-3 text-sm text-theme-gray-dark">
                <span>{formatFileSize(file.size)}</span>
                <Badge variant="secondary" className="text-xs">
                  {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </Badge>
                <span>{file.uploadedAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-auto">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}