import React from 'react';
import { AlertCircle } from 'lucide-react';

const DebugPanel = ({ info }) => {
    if (!info) return null;

    return (
    <div className="mt-4 p-3 bg-gray-100 rounded-lg border">
        <div className="flex items-center space-x-2 mb-2">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Debug Info:</span>
        </div>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-white p-2 rounded border max-h-40 overflow-y-auto">
        {info}
        </pre>
    </div>
    );
};

export default DebugPanel;