import React, { useRef, useState } from "react";
import { Paperclip, Video, File, Link as LinkIcon, Image as ImageIcon, FileText, Download, UploadCloud } from "lucide-react";
import { Button } from "../common/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useCollaboration } from "../../contexts/CollaborationContext";
import { toast } from "react-hot-toast";
import { FilePreviewModal } from "./FilePreviewModal";
import { SharedFile } from "../../contexts/CollaborationContext";

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
    const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        
        try {
            setIsUploading(true);
            toast.promise(uploadFile(selectedFile), {
                loading: `Uploading ${selectedFile.name}...`,
                success: `${selectedFile.name} uploaded successfully!`,
                error: `Failed to upload ${selectedFile.name}.`
            });
        } catch (error) {
            // The toast will handle the error message
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleDownload = (e: React.MouseEvent, url: string | undefined, fileName: string) => {
        e.stopPropagation();
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
    
    const handleFileClick = (file: SharedFile) => {
        setPreviewFile(file);
    };
    
    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-white flex-shrink-0">Shared Files ({files.length})</h3>
            <div className="space-y-2 pr-2 overflow-y-auto flex-1">
                {files.length === 0 ? (
                    <div className="text-center py-10">
                        <FileText className="mx-auto h-12 w-12 text-white/20" />
                        <p className="mt-4 text-sm text-white/60">No files shared yet.</p>
                        <p className="text-xs text-white/40">Upload a file to get started.</p>
                    </div>
                ) : (
                    files.map(file => (
                        <div 
                            key={file.id} 
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => handleFileClick(file)}
                        >
                            {getFileIcon(file.type)}
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white/90 truncate">{file.name}</p>
                                <p className="text-xs text-white/60">{file.size} - {file.date}</p>
                            </div>
                            <button 
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors opacity-70 hover:opacity-100"
                                onClick={(e) => handleDownload(e, file.downloadUrl, file.name)}
                                title="Download file"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-auto pt-4 border-t border-white/10 flex-shrink-0">
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
                    <UploadCloud className="mr-2 h-4 w-4" /> 
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
            </div>
            
            <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
        </div>
    );
}; 