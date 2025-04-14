import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const Diagnosis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    // TODO: Implement diagnosis logic
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">OCT Scan Analysis</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="scan-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <label
              htmlFor="scan-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-gray-600 mb-2">
                {selectedFile ? selectedFile.name : 'Upload your OCT scan'}
              </span>
              <span className="text-sm text-gray-500">
                Click to select or drag and drop
              </span>
            </label>
          </div>
          
          <button
            onClick={handleDiagnose}
            disabled={!selectedFile || isAnalyzing}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Diagnose'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Doctor's Report</h2>
            <p className="text-gray-600">
              Detailed medical analysis will appear here after processing the scan.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient's Report</h2>
            <p className="text-gray-600">
              A simplified, easy-to-understand report will appear here after processing the scan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;