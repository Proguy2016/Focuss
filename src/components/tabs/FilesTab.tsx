import React, { useState } from 'react';
import { Upload, Download, FileText, File, Image, Eye, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FilePreview } from '@/components/common/FilePreview';
import { RoomFile } from '@/hooks/useRoom';

interface FilesTabProps {
  files: RoomFile[];
}

export function FilesTab({ files }: FilesTabProps) {
  const [selectedFile, setSelectedFile] = useState<RoomFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-theme-primary" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-theme-red" />;
    return <File className="w-5 h-5 text-theme-gray-dark" />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const handlePreview = (file: RoomFile) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  // Mock user data
  const users = {
    '1': { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    '3': { name: 'Elena Rodriguez', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Enhanced mock files with versions
  const enhancedFiles = files.map(file => ({
    ...file,
    versions: [
      { version: '1.0', date: new Date(Date.now() - 86400000), size: file.size * 0.8 },
      { version: '1.1', date: new Date(Date.now() - 43200000), size: file.size * 0.9 },
      { version: '1.2', date: file.uploadedAt, size: file.size },
    ]
  }));

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50/50">
      <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50">
        <h3 className="font-bold text-theme-dark">Files</h3>
        <Button size="sm" className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow">
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="grid gap-3">
            {enhancedFiles.map((file) => {
              const uploader = users[file.uploadedBy as keyof typeof users];
              const latestVersion = file.versions[file.versions.length - 1];
              
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-5 border border-gray-200/60 rounded-xl hover:bg-theme-primary/5 hover:border-theme-primary/30 transition-all duration-200 bg-white/80 backdrop-blur-glass shadow-custom"
                >
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/5 rounded-lg shadow-custom">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-theme-dark truncate">
                        {file.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border-theme-primary/30">
                        v{latestVersion.version}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-theme-gray-dark">
                      <span className="font-semibold">{formatFileSize(file.size)}</span>
                      <div className="flex items-center gap-2">
                        {uploader && (
                          <>
                            <Avatar className="w-5 h-5 ring-1 ring-theme-primary/20 shadow-custom">
                              <AvatarImage src={uploader.avatar} alt={uploader.name} />
                              <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                                {getInitials(uploader.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{uploader.name}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {file.versions.length} versions
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-9 h-9 p-0 hover:bg-theme-primary/10 text-theme-gray-dark hover:text-theme-primary"
                      onClick={() => handlePreview(file)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-theme-primary/10 text-theme-gray-dark hover:text-theme-primary">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}