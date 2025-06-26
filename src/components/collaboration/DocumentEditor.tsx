import React, { useState, useEffect, useRef } from 'react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { X, Save, Edit, Eye } from 'lucide-react';
import { SharedFile } from '../../contexts/CollaborationContext';

interface DocumentEditorProps {
  file: SharedFile | null;
  onClose: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ file, onClose }) => {
  const { socketRef, currentUser } = useCollaboration();
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [lastEditBy, setLastEditBy] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when file changes
    if (file) {
      setContent('');
      setIsEditing(false);
      
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

    return () => {
      if (socketRef.current) {
        socketRef.current.off('documentUpdate');
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
    
    // Could implement actual file saving to backend here
    console.log('Saving document:', file.id);
  };

  if (!file) return null;

  return (
    <Card variant="glass" className="fixed inset-4 z-50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white">{file.name}</h3>
          <p className="text-sm text-white/60">
            {lastEditBy ? `Last edited by ${lastEditBy}` : `Shared by ${file.user.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          {!isPdf && !isImage && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleEditMode}
                className="flex items-center gap-1"
              >
                {isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditing ? 'View' : 'Edit'}
              </Button>
              {isEditing && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSave}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              )}
            </>
          )}
          <Button 
            variant="danger" 
            size="sm" 
            onClick={onClose}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-black/20">
        {isPdf && file.downloadUrl && (
          <iframe 
            src={`${file.downloadUrl}#toolbar=0`} 
            className="w-full h-full" 
            title={file.name}
          />
        )}
        
        {isImage && file.downloadUrl && (
          <div className="flex items-center justify-center h-full">
            <img 
              src={file.downloadUrl} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain" 
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
    </Card>
  );
}; 