import React from 'react';
import { Button } from '../common/Button';
import { Download, Upload, Trash2 } from 'lucide-react';

interface DataSettingsProps {
    onExport: () => void;
    onDelete: () => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({ onExport, onDelete }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Data & Privacy</h2>
            
            <div className="p-4 border border-dashed border-yellow-500/50 bg-yellow-500/10 rounded-lg">
                <h4 className="font-semibold text-yellow-300">Export Your Data</h4>
                <p className="text-sm text-yellow-400/80 mt-1">
                    Download all your tasks, sessions, and other data in a single JSON file.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={onExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                </Button>
            </div>

            <div className="p-4 border border-dashed border-red-500/50 bg-red-500/10 rounded-lg">
                <h4 className="font-semibold text-red-300">Delete Account</h4>
                <p className="text-sm text-red-400/80 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="danger" size="sm" className="mt-4" onClick={onDelete}>
                     <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                </Button>
            </div>
        </div>
    );
}; 