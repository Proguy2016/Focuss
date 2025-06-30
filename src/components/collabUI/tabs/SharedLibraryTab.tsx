import React, { useState } from 'react';
import { Upload, Download, FileText, File, Image, Eye, Clock, Search, Filter, BookOpen, Star, Tag, Folder, Grid, List } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FilePreview } from '@/components/common/FilePreview';
import { RoomFile } from '@/hooks/useRoom';
import { cn } from '@/lib/utils';

interface SharedLibraryTabProps {
  files: RoomFile[];
}

export function SharedLibraryTab({ files }: SharedLibraryTabProps) {
  const [selectedFile, setSelectedFile] = useState<RoomFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Enhanced library categories
  const categories = [
    { id: 'all', label: 'All Files', count: files.length },
    { id: 'documents', label: 'Documents', count: files.filter(f => f.type.includes('pdf') || f.type.includes('document')).length },
    { id: 'images', label: 'Images', count: files.filter(f => f.type.startsWith('image/')).length },
    { id: 'presentations', label: 'Presentations', count: files.filter(f => f.type.includes('presentation')).length },
    { id: 'spreadsheets', label: 'Spreadsheets', count: files.filter(f => f.type.includes('sheet')).length },
    { id: 'resources', label: 'Study Resources', count: Math.floor(files.length * 0.3) },
    { id: 'templates', label: 'Templates', count: Math.floor(files.length * 0.2) },
  ];

  // Enhanced files with library features
  const enhancedFiles = files.map(file => ({
    ...file,
    category: file.type.includes('pdf') ? 'documents' : 
              file.type.startsWith('image/') ? 'images' : 
              file.type.includes('presentation') ? 'presentations' :
              file.type.includes('sheet') ? 'spreadsheets' : 'resources',
    tags: ['study-material', 'shared', 'important'],
    rating: Math.floor(Math.random() * 5) + 1,
    downloads: Math.floor(Math.random() * 50) + 1,
    isFavorite: Math.random() > 0.7,
    description: 'Shared study material for the course project',
    subject: 'Computer Science',
    course: 'CS 101',
  }));

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
    if (type.includes('presentation')) return <FileText className="w-5 h-5 text-theme-yellow" />;
    if (type.includes('sheet')) return <FileText className="w-5 h-5 text-theme-emerald" />;
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

  const filteredFiles = enhancedFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'recent':
        return b.uploadedAt.getTime() - a.uploadedAt.getTime();
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Mock user data
  const users = {
    '1': { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    '3': { name: 'Elena Rodriguez', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={cn(
          "w-3 h-3",
          i < rating ? "text-theme-yellow fill-current" : "text-theme-gray"
        )} 
      />
    ));
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedFiles.map((file) => {
        const uploader = users[file.uploadedBy as keyof typeof users];
        
        return (
          <div
            key={file.id}
            className="group p-4 border border-gray-200/60 rounded-xl hover:shadow-custom transition-all duration-200 bg-white/80 backdrop-blur-glass notion-hover"
          >
            {/* File Preview */}
            <div className="relative mb-4">
              <div className="aspect-video bg-gradient-to-br from-theme-primary/10 to-theme-secondary/5 rounded-lg flex items-center justify-center border border-gray-200/60">
                {getFileIcon(file.type)}
              </div>
              {file.isFavorite && (
                <div className="absolute top-2 right-2">
                  <Star className="w-4 h-4 text-theme-yellow fill-current" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePreview(file)}
                  className="bg-white/90 hover:bg-white text-theme-dark"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            {/* File Info */}
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-theme-dark truncate group-hover:text-theme-primary transition-colors">
                  {file.name}
                </h4>
                <p className="text-xs text-theme-gray-dark line-clamp-2 leading-relaxed">
                  {file.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(file.rating)}</div>
                <span className="text-xs text-theme-gray-dark">({file.downloads} downloads)</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {file.course}
                </Badge>
                {file.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-theme-gray-dark">
                <div className="flex items-center gap-2">
                  {uploader && (
                    <>
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={uploader.avatar} alt={uploader.name} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                          {getInitials(uploader.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{uploader.name}</span>
                    </>
                  )}
                </div>
                <span>{formatFileSize(file.size)}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-theme-gray-dark">
                <Clock className="w-3 h-3" />
                <span>{formatDate(file.uploadedAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {sortedFiles.map((file) => {
        const uploader = users[file.uploadedBy as keyof typeof users];
        
        return (
          <div
            key={file.id}
            className="flex items-center gap-4 p-4 border border-gray-200/60 rounded-xl hover:bg-theme-primary/5 hover:border-theme-primary/30 transition-all duration-200 bg-white/80 backdrop-blur-glass"
          >
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/5 rounded-lg shadow-custom">
              {getFileIcon(file.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-theme-dark truncate">
                    {file.name}
                  </h4>
                  <p className="text-sm text-theme-gray-dark line-clamp-1">
                    {file.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {file.isFavorite && (
                    <Star className="w-4 h-4 text-theme-yellow fill-current" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {file.course}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-theme-gray-dark">
                  <div className="flex items-center gap-1">
                    <div className="flex">{renderStars(file.rating)}</div>
                    <span>({file.downloads})</span>
                  </div>
                  <span className="font-semibold">{formatFileSize(file.size)}</span>
                  {uploader && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={uploader.avatar} alt={uploader.name} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                          {getInitials(uploader.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{uploader.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(file.uploadedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-8 h-8 p-0 hover:bg-theme-primary/10 text-theme-gray-dark hover:text-theme-primary"
                    onClick={() => handlePreview(file)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-theme-primary/10 text-theme-gray-dark hover:text-theme-primary">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50/50">
      <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-theme-primary" />
          <div>
            <h3 className="font-bold text-theme-dark">Shared Library</h3>
            <p className="text-sm text-theme-gray-dark">Study materials, resources, and course files</p>
          </div>
        </div>
        <Button size="sm" className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow">
          <Upload className="w-4 h-4" />
          Upload Resource
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200/60 bg-white/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-gray-dark" />
              <Input
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-theme-primary/30 focus:border-theme-primary"
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">File Size</SelectItem>
              <SelectItem value="popular">Most Downloaded</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 bg-white border border-gray-200/60 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="w-8 h-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
              className="w-8 h-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.slice(1).map(category => (
            <Button
              key={category.id}
              variant={filterCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(category.id)}
              className={cn(
                "gap-2 h-8",
                filterCategory === category.id 
                  ? "bg-theme-primary text-white" 
                  : "border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary"
              )}
            >
              <Folder className="w-3 h-3" />
              {category.label}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6">
          {viewMode === 'grid' ? renderGridView() : renderListView()}
          
          {sortedFiles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-theme-gray" />
              <h3 className="font-semibold text-theme-dark mb-2">No files found</h3>
              <p className="text-theme-gray-dark mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button className="gap-2 bg-theme-primary hover:bg-theme-primary-dark text-white">
                <Upload className="w-4 h-4" />
                Upload First Resource
              </Button>
            </div>
          )}
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