import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderOpen, File, Upload, Trash2, Download, Search,
  List, Grid, Settings, Plus, X, FolderPlus, FileText,
  RefreshCw, ChevronLeft, ArrowLeft, UploadCloud, LayoutGrid,
  MoreVertical, Folder, Loader2 as Loader
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LibraryItem {
  id: string;
  type: 'folder' | 'file';
  name: string;
  size?: string;
  modified: string;
  parentId?: string | null;
  url?: string; // For files, this is the Wasabi URL
  path?: string[];
  contentType?: string; // For files, the MIME type
}

const LibraryHeader = ({ onBack, currentFolder, onCreateFolder, onUpload }: { 
  onBack: () => void; 
  currentFolder: string | null;
  onCreateFolder: () => void;
  onUpload: () => void;
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {currentFolder && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
        <h1 className="text-2xl font-bold text-white">
          {currentFolder ? currentFolder : "My Library"}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input 
            type="text" 
            placeholder="Search files..."
            className="w-full h-9 rounded-md border border-slate-800 bg-slate-900/50 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition pl-9 pr-3 py-1"
          />
        </div>
        <Button variant="primary" size="sm" onClick={onUpload}>
          <UploadCloud className="w-4 h-4 mr-2" />
          Upload
        </Button>
        <Button variant="secondary" size="sm" onClick={onCreateFolder}>
          <Plus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>
    </div>
  );
};

const Breadcrumbs = ({ path, onNavigate }: { path: string[]; onNavigate: (index: number) => void }) => {
  return (
    <div className="flex items-center text-sm text-white/60 mb-4 overflow-x-auto">
      <span 
        className="hover:text-white cursor-pointer" 
        onClick={() => onNavigate(-1)}
      >
        My Library
      </span>
      
      {path.map((folder, index) => (
        <React.Fragment key={index}>
          <span className="mx-2">/</span>
          <span 
            className={`${index === path.length - 1 ? 'text-white' : 'hover:text-white cursor-pointer'}`}
            onClick={() => onNavigate(index)}
          >
            {folder}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

const FileItem = ({ file, onClick }: { file: LibraryItem; onClick: () => void }) => {
  const isFolder = file.type === 'folder';
  const Icon = isFolder ? FolderOpen : File;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="group"
      onClick={onClick}
    >
      <Card 
        variant="glass" 
        className="p-4 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer
                   hover:bg-primary-500/10 hover:border-primary-500/30 transition-all duration-200"
      >
        <Icon className={`w-12 h-12 ${isFolder ? 'text-primary-400' : 'text-slate-400'}`} />
        <p className="text-sm font-medium text-white truncate w-full">{file.name}</p>
        <p className="text-xs text-white/50">
          {isFolder ? '' : `${file.size} · `}{file.modified}
        </p>
      </Card>
    </motion.div>
  );
};

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<LibraryItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter files based on current folder
  const filteredFiles = files.filter(file => file.parentId === currentFolderId);

  // Log filtered files and current folder ID
  useEffect(() => {
    console.log('Current folder ID:', currentFolderId);
    console.log('Total files in state:', files.length);
    console.log('Filtered files for current folder:', filteredFiles.length);
  }, [filteredFiles.length, currentFolderId, files.length]);

  const handleFolderClick = (folder: LibraryItem) => {
    setCurrentPath([...currentPath, folder.name]);
    setCurrentFolderId(folder.id);
  };

  const handleBackClick = async () => {
    if (currentPath.length === 0) return;
    
    const newPath = [...currentPath];
    newPath.pop();
    setCurrentPath(newPath);
    
    setIsLoading(true);
    try {
      if (newPath.length === 0) {
        // Go back to root
        setCurrentFolderId(null);
      } else {
        // We need to find the parent folder's ID
        const pathString = '/' + newPath.join('/');
        const response = await api.get(`/api/library/path?path=${encodeURIComponent(pathString)}`);
        
        if (response.data && response.data.id) {
          setCurrentFolderId(response.data.id);
        } else {
          // If we can't find the folder, go back to root
          setCurrentFolderId(null);
          setCurrentPath([]);
        }
      }
    } catch (err) {
      console.error('Error navigating back:', err);
      setError('Failed to navigate. Returning to root.');
      setCurrentFolderId(null);
      setCurrentPath([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreadcrumbClick = async (index: number) => {
    try {
      setIsLoading(true);
      
      if (index === -1) {
        // Root level
        setCurrentPath([]);
        setCurrentFolderId(null);
      } else {
        const newPath = currentPath.slice(0, index + 1);
        setCurrentPath(newPath);
        
        // Find the folder ID by path
        const pathString = '/' + newPath.join('/');
        const response = await api.get(`/api/library/path?path=${encodeURIComponent(pathString)}`);
        
        if (response.data && response.data.id) {
          setCurrentFolderId(response.data.id);
        } else {
          throw new Error('Folder not found');
        }
      }
    } catch (err) {
      console.error('Error navigating to breadcrumb:', err);
      setError('Failed to navigate. Returning to root.');
      setCurrentPath([]);
      setCurrentFolderId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/library/folder', {
        name: newFolderName,
        parentId: currentFolderId || 'root',
        path: currentPath.length > 0 ? '/' + currentPath.join('/') : '/'
      });
      
      if (response.data && response.data.id) {
        // Add the new folder to our state
        const newFolder: LibraryItem = {
          id: response.data.id,
          type: 'folder',
          name: newFolderName,
          modified: new Date().toLocaleDateString(),
          parentId: currentFolderId,
          path: [...currentPath]
        };
        
        setFiles([...files, newFolder]);
      }
      
      setShowNewFolderModal(false);
      setNewFolderName('');
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newFiles: LibraryItem[] = [];
      
      for (const file of uploadedFiles) {
        // Set initial progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('parentId', currentFolderId || 'root');
        formData.append('path', currentPath.join('/'));
        
        console.log(`Uploading file to /up/upload with parentId: ${currentFolderId || 'root'}`);
        
        // Upload the file using the provided API endpoint
        const response = await api.post('/up/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
          }
        });
        
        console.log('Upload response:', response.data);
        
        // Add the newly uploaded file to our list
        if (response.data && response.data.id) {
          const newFile: LibraryItem = {
            id: response.data.id,
            type: 'file',
            name: file.name,
            size: formatSize(file.size),
            modified: new Date().toLocaleDateString(),
            parentId: currentFolderId,
            path: [...currentPath],
            contentType: file.type,
            url: `/up/file/${response.data.id}` // Store the file URL using the provided endpoint
          };
          
          newFiles.push(newFile);
        }
      }
      
      console.log(`${newFiles.length} files uploaded successfully`);
      
      // Update the files list with the new uploads
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
      }
      
      // Refresh library data from server
      await fetchLibraryData();
      
      setShowUploadModal(false);
      setUploadedFiles([]);
      setUploadProgress({});
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = async (file: LibraryItem) => {
    if (file.type === 'folder') {
      handleFolderClick(file);
      return;
    }
    
    // For PDFs, download and open in PDF viewer
    if (file.contentType === 'application/pdf' || file.name.endsWith('.pdf')) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Store the file info in localStorage for the PDF viewer
        localStorage.setItem('currentPdfName', file.name);
        localStorage.setItem('currentPdfUrl', `/up/file/${file.id}`);
        
        // Navigate to the PDF viewer with the file ID
        navigate(`/pdf-viewer/${file.id}`);
      } catch (err) {
        console.error('Error opening file:', err);
        setError('Failed to open file. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // For other file types, open the file directly
      window.open(`/up/file/${file.id}`, '_blank');
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  // Fetch library data function declaration
  const fetchLibraryData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = currentFolderId 
        ? `/api/library/folder/${currentFolderId}` 
        : '/api/library';
      
      console.log(`Fetching library data from ${endpoint}`);
      const response = await api.get(endpoint);
      console.log('Library API response:', response.data);
      
      if (response.data && response.data.items) {
        // Transform API data to our LibraryItem format if needed
        const libraryItems = response.data.items.map((item: any) => ({
          id: item.id,
          type: item.type,
          name: item.name,
          size: item.size ? formatSize(item.size) : undefined,
          modified: new Date(item.modifiedAt || item.createdAt).toLocaleDateString(),
          parentId: item.parentId,
          path: item.path ? item.path.split('/').filter(Boolean) : [],
          contentType: item.contentType,
          url: item.type === 'file' ? `/up/file/${item.id}` : undefined
        }));
        
        console.log('Transformed library items:', libraryItems);
        setFiles(libraryItems);
      } else {
        console.log('No items found in library response');
        setFiles([]);
      }
    } catch (err: any) {
      console.error('Error fetching library data:', err);
      // If we get a 404 for an empty library, just show an empty state
      if (err.response && err.response.status === 404) {
        console.log('404 response - showing empty state');
        setFiles([]);
      } else {
        setError('Failed to load library. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch files from API
  useEffect(() => {
    fetchLibraryData();
  }, [currentFolderId]);

  return (
    <div className="p-6 h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <LibraryHeader 
          onBack={handleBackClick} 
          currentFolder={currentPath.length ? currentPath[currentPath.length - 1] : null} 
          onCreateFolder={() => setShowNewFolderModal(true)}
          onUpload={handleUploadClick}
        />
        <Breadcrumbs path={currentPath} onNavigate={handleBreadcrumbClick} />
      </motion.div>
      
      <div className="flex items-center justify-end mb-4">
        <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'text-primary-400 bg-primary-500/10' : ''}`}>
          <LayoutGrid className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'text-primary-400 bg-primary-500/10' : ''}`}>
          <List className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-white/70 ml-2">Loading...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <FolderOpen className="w-16 h-16 mb-2" />
            <h3 className="text-lg font-medium mb-1">This folder is empty</h3>
            <p className="text-sm mb-4">Upload files or create folders to get started</p>
            <p className="text-xs mb-2">Total files: {files.length}, Filtered files: {filteredFiles.length}</p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleUploadClick}>
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowNewFolderModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </div>
          </div>
        ) : (
          <motion.div 
            className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6' : 'grid-cols-1 gap-2'}`}
          >
            {filteredFiles.map(file => (
              <FileItem 
                key={file.id} 
                file={file} 
                onClick={() => handleFileClick(file)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* New Folder Modal */}
      <Modal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        title="Create New Folder"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="folderName" className="block text-white/80 mb-1 text-sm">Folder Name</label>
            <input
              id="folderName"
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-800 bg-slate-900/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-none transition px-3 py-1"
              placeholder="Enter folder name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowNewFolderModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Files"
        size="md"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            <Button
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 flex flex-col items-center justify-center"
            >
              <UploadCloud className="w-10 h-10 text-primary-400 mb-2" />
              <p className="text-white">Click to select files or drag and drop</p>
              <p className="text-white/50 text-sm mt-1">PDF, DOCX, TXT, etc.</p>
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-white/80 text-sm">{uploadedFiles.length} file(s) selected</p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                    <div className="flex items-center">
                      <File className="w-4 h-4 text-white/70 mr-2" />
                      <p className="text-sm text-white truncate max-w-[180px]">{file.name}</p>
                    </div>
                    <p className="text-xs text-white/50">{formatSize(file.size)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadFiles} 
              disabled={uploadedFiles.length === 0 || isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Error Alert */}
      {error && (
        <motion.div 
          className="fixed bottom-4 right-4 bg-red-500/90 text-white p-4 rounded-lg shadow-lg flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <p>{error}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1" 
            onClick={() => setError(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Library; 