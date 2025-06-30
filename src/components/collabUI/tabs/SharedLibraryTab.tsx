import React, { useState } from 'react';
import { Upload, Download, FileText, File, Image, Eye, Clock, Search, Filter, BookOpen, Star, Tag, Folder, Grid, List } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FilePreview } from '@/components/common/FilePreview';
import { RoomFile, Participant } from '@/hooks/useRoom';
import { cn } from '@/lib/utils';

interface SharedLibraryTabProps {
  files: RoomFile[];
  participants?: Participant[];
  onUploadFile?: (file: File) => void;
  onDownloadFile?: (fileId: string) => void;
}

export function SharedLibraryTab({ 
  files, 
  participants = [], 
  onUploadFile, 
  onDownloadFile 
}: SharedLibraryTabProps) {
  const [selectedFile, setSelectedFile] = useState<RoomFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  
  // File categories based on file types
  const fileTypes = {
    'all': { label: 'All Files', count: files.length },
    'document': { label: 'Documents', count: files.filter(f => f.type.includes('pdf') || f.type.includes('doc')).length },
    'image': { label: 'Images', count: files.filter(f => f.type.startsWith('image/')).length },
    'presentation': { label: 'Presentations', count: files.filter(f => f.type.includes('presentation') || f.type.includes('ppt')).length },
    'spreadsheet': { label: 'Spreadsheets', count: files.filter(f => f.type.includes('sheet') || f.type.includes('excel') || f.type.includes('csv')).length },
    'other': { label: 'Other', count: files.filter(f => 
      !f.type.includes('pdf') && 
      !f.type.includes('doc') && 
      !f.type.startsWith('image/') && 
      !f.type.includes('presentation') && 
      !f.type.includes('ppt') && 
      !f.type.includes('sheet') && 
      !f.type.includes('excel') && 
      !f.type.includes('csv')
    ).length }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-theme-primary" />;
    if (type.includes('pdf') || type.includes('doc')) return <FileText className="w-5 h-5 text-theme-red" />;
    if (type.includes('presentation') || type.includes('ppt')) return <FileText className="w-5 h-5 text-theme-yellow" />;
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return <FileText className="w-5 h-5 text-theme-emerald" />;
    return <File className="w-5 h-5 text-gray" />;
  };

  const getFileType = (type: string): string => {
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf') || type.includes('doc')) return 'document';
    if (type.includes('presentation') || type.includes('ppt')) return 'presentation';
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return 'spreadsheet';
    return 'other';
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(dateObj);
  };

  const handlePreview = (file: RoomFile) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };
  
  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0 && onUploadFile) {
        onUploadFile(target.files[0]);
      }
    };
    input.click();
  };

  const handleDownload = (fileId: string) => {
    if (onDownloadFile) {
      onDownloadFile(fileId);
    } else {
      // Fallback to opening the URL in a new tab
      const file = files.find(f => f.id === fileId);
      if (file && file.url) {
        window.open(file.url, '_blank');
      }
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || getFileType(file.type) === filterType;
    return matchesSearch && matchesType;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'recent':
      default:
        const dateA = a.uploadedAt instanceof Date ? a.uploadedAt.getTime() : new Date(a.uploadedAt).getTime();
        const dateB = b.uploadedAt instanceof Date ? b.uploadedAt.getTime() : new Date(b.uploadedAt).getTime();
        return dateB - dateA;
    }
  });

  const getParticipantById = (userId: string) => {
    return participants.find(p => p.id === userId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col h-full animated-bg">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-dark/30">
        <h3 className="font-bold text-white">Shared Library</h3>
        <Button 
          size="sm" 
          onClick={handleUpload}
          className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>
      
      <div className="p-4 border-b border-white/10 bg-dark/20">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="pl-10 border-white/10 bg-dark/50 text-white"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] border-white/10 bg-dark/50 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(fileTypes).map(([type, { label, count }]) => (
                <SelectItem key={type} value={type}>
                  {label} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] border-white/10 bg-dark/50 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-none h-9 px-3",
                viewMode === 'grid' ? "bg-theme-primary/20 text-theme-primary" : "text-gray"
              )}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-none h-9 px-3",
                viewMode === 'list' ? "bg-theme-primary/20 text-theme-primary" : "text-gray"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {sortedFiles.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray" />
              <h3 className="font-semibold text-white mb-2">No files found</h3>
              <p className="text-gray mb-6">
                {searchTerm || filterType !== 'all' ? 
                  'Try adjusting your search or filters' : 
                  'Upload files to share with your team'}
              </p>
              <Button 
                onClick={handleUpload}
                className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
              >
                <Upload className="w-4 h-4" />
                Upload First File
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedFiles.map((file) => {
                const uploader = getParticipantById(file.uploadedBy);
                return (
                  <div
                    key={file.id}
                    className="flex flex-col p-5 border border-white/10 rounded-xl hover:bg-theme-primary/10 hover:border-theme-primary/30 transition-all duration-200 bg-dark/30 backdrop-blur-glass shadow-custom"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/10 rounded-lg shadow-custom">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">
                          {file.name}
                        </h4>
                        <div className="text-xs text-gray">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-gray">
                        {uploader && (
                          <>
                            <Avatar className="w-5 h-5 ring-1 ring-theme-primary/20 shadow-custom">
                              <AvatarImage src={uploader.avatar} alt={uploader.name} />
                              <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                                {getInitials(uploader.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[80px]">{uploader.name}</span>
                          </>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(file.uploadedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-7 h-7 p-0 hover:bg-theme-primary/10 text-gray hover:text-theme-primary"
                          onClick={() => handlePreview(file)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-7 h-7 p-0 hover:bg-theme-primary/10 text-gray hover:text-theme-primary"
                          onClick={() => handleDownload(file.id)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedFiles.map((file) => {
                const uploader = getParticipantById(file.uploadedBy);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-5 border border-white/10 rounded-xl hover:bg-theme-primary/10 hover:border-theme-primary/30 transition-all duration-200 bg-dark/30 backdrop-blur-glass shadow-custom"
                  >
                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/10 rounded-lg shadow-custom">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-white truncate">
                          {file.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border-theme-primary/30">
                          {getFileType(file.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray">
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
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-9 h-9 p-0 hover:bg-theme-primary/10 text-gray hover:text-theme-primary"
                        onClick={() => handlePreview(file)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-9 h-9 p-0 hover:bg-theme-primary/10 text-gray hover:text-theme-primary"
                        onClick={() => handleDownload(file.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

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