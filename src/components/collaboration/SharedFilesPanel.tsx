import React, { useRef, useState } from "react";
import { Paperclip, Video, File, Link as LinkIcon, Image as ImageIcon, FileText, Download } from "lucide-react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useCollaboration } from "../../contexts/CollaborationContext";
import { toast } from "react-hot-toast";
import { IntegratedFileViewer } from "./IntegratedFileViewer";

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf': return <FileText className="h-6 w-6 text-red-400" />;
        case 'link': return <LinkIcon className="h-6 w-6 text-blue-400" />;
        case 'image': return <ImageIcon className="h-6 w-6 text-purple-400" />;
        case 'video': return <Video className="h-6 w-6 text-orange-400" />;
        default: return <File className="h-6 w-6 text-gray-400" />;
    }
};

export const SharedFilesPanel: React.FC = () => {
    const { files, uploadFile } = useCollaboration();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<typeof files[0] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        
        try {
            setIsUploading(true);
            await uploadFile(selectedFile);
            toast.success(`${selectedFile.name} uploaded successfully`);
        } catch (error) {
            console.error('File upload error:', error);
            toast.error(`Failed to upload ${selectedFile.name}`);
        } finally {
            setIsUploading(false);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleDownload = (e: React.MouseEvent, url: string | undefined, fileName: string) => {
        e.stopPropagation(); // Prevent opening the editor when clicking download
        
        if (!url) {
            toast.error("Download URL not available");
            return;
        }
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleFileClick = (file: typeof files[0]) => {
        setSelectedFile(file);
    };
    
    const handleCloseViewer = () => {
        setSelectedFile(null);
    };
    
    return (
        <div className="h-full flex flex-col">
            <Card variant="glass" className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold mb-4 text-white">Shared Files ({files.length})</h3>
                <div className="space-y-3 pr-2 overflow-y-auto flex-1">
                    {files.length === 0 ? (
                        <p className="text-white/60 text-sm text-center py-4">No files shared yet</p>
                    ) : (
                        files.map(file => (
                            <div 
                                key={file.id} 
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                                onClick={() => handleFileClick(file)}
                            >
                                {getFileIcon(file.type)}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white/90 truncate">{file.name}</p>
                                    <p className="text-xs text-white/60">{file.size} - {file.date}</p>
                                </div>
                                <button 
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                    onClick={(e) => handleDownload(e, file.downloadUrl, file.name)}
                                    title="Download file"
                                >
                                    <Download className="h-4 w-4 text-white/70" />
                                </button>
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={file.user.avatar} />
                                    <AvatarFallback>{file.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-auto pt-4 border-t border-white/10">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/*,application/pdf,video/*,text/*"
                    />
                    <Button 
                        variant="secondary" 
                        className="w-full" 
                        onClick={handleUploadClick}
                        disabled={isUploading}
                    >
                        <Paperclip className="mr-2 h-4 w-4" /> 
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                </div>
            </Card>
            
            {selectedFile && (
                <div className="mt-4 flex-1">
                    <IntegratedFileViewer file={selectedFile} onClose={handleCloseViewer} />
                </div>
            )}
        </div>
    );
}; 