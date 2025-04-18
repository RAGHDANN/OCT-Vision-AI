import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const Diagnosis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    // Simulate diagnosis logic
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true); // Show the results popup
    }, 2000);
  };

  const handleGenerateDoctorReport = () => {
    alert("Doctor's report generated!");
    // TODO: Implement logic to generate the doctor's report
  };

  const handleGeneratePatientReport = () => {
    alert("Patient's report generated!");
    // TODO: Implement logic to generate the patient's report
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Centered Title */}
      <div className="flex items-center justify-center h-20 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">OCT Scan Analysis</h1>
      </div>

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
      </div>

      {/* Results Popup */}
      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Diagnosis Results</h2>
            <p className="text-gray-600 mb-6">
              The results of the analysis will be displayed here.
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleGenerateDoctorReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Generate Doctor's Report
              </button>
              <button
                onClick={handleGeneratePatientReport}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Generate Patient Report
              </button>
            </div>
            <button
              onClick={() => setShowResults(false)}
              className="mt-4 w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;