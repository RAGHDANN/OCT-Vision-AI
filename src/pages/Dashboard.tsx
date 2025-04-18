import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuthStore } from '../store/authStore';
import { Calendar, Download, Eye, FileText, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [octImages, setOctImages] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [selectedScans, setSelectedScans] = useState({ scan1: null, scan2: null });
  const [healthReports, setHealthReports] = useState([]);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [editedMedicalHistory, setEditedMedicalHistory] = useState(null);
  const [showCustomConditionInput, setShowCustomConditionInput] = useState(false);
  const [showCustomChronicInput, setShowCustomChronicInput] = useState(false);
  const [showCustomEyeConditionInput, setShowCustomEyeConditionInput] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch OCT images
      const { data: images, error: imagesError } = await supabase
        .from('oct_images')
        .select('*')
        .order('upload_date', { ascending: false });
      
      if (imagesError) throw imagesError;
      setOctImages(images || []);

      // Fetch predictions
      const { data: diseaseData, error: predictionsError } = await supabase
        .from('disease_predictions')
        .select(`
          *,
          oct_images (*)
        `)
        .order('prediction_date', { ascending: false });
      
      if (predictionsError) throw predictionsError;
      setPredictions(diseaseData || []);

      // Fetch medical history - Modified to handle no records
      const { data: history, error: historyError } = await supabase
        .from('medical_histories')
        .select('*')
        .limit(1);
      
      if (historyError) throw historyError;
      setMedicalHistory(history && history.length > 0 ? history[0] : null);

      // Fetch health reports
      const { data: reports, error: reportsError } = await supabase
        .from('health_reports')
        .select('*')
        .order('report_date', { ascending: false });
      
      if (reportsError) throw reportsError;
      setHealthReports(reports || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveMedicalHistory = async () => {
    try {
      setSaving(true);
      // Save medical history logic here
      setIsEditingHistory(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getProgressionStatus = () => {
    if (predictions.length < 2) return 'Not enough data';
    
    const latestPrediction = predictions[0];
    const previousPrediction = predictions[1];
    
    if (latestPrediction.confidence_score > previousPrediction.confidence_score) {
      return 'Worsening';
    } else if (latestPrediction.confidence_score < previousPrediction.confidence_score) {
      return 'Improving';
    }
    return 'Stable';
  };

  const chartData = {
    labels: predictions.map(p => new Date(p.prediction_date).toLocaleDateString()),
    datasets: [{
      label: 'Confidence Score',
      data: predictions.map(p => p.confidence_score),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const downloadDashboardAsPDF = async () => {
    const dashboardElement = document.getElementById('dashboard-content'); // Target the dashboard content
    if (!dashboardElement) return;

    try {
      // Use html2canvas to capture the dashboard as an image
      const canvas = await html2canvas(dashboardElement);
      const imgData = canvas.toDataURL('image/png');

      // Create a PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('dashboard.pdf'); // Save the PDF
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" id="dashboard-content">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Disease Status</h2>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{getProgressionStatus()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Latest Scan</h2>
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600">
            {octImages[0]?.upload_date
              ? new Date(octImages[0].upload_date).toLocaleDateString()
              : 'No scans yet'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Next Follow-up</h2>
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600">
            {healthReports[0]?.follow_up_date
              ? new Date(healthReports[0].follow_up_date).toLocaleDateString()
              : 'Not scheduled'}
          </p>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Medical History</h2>
          <FileText className="h-6 w-6 text-blue-600" />
        </div>

        {isEditingHistory ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMedicalHistory();
            }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Existing Conditions */}
              <div>
                <label className="font-medium text-gray-700 mb-2 block">Existing Conditions</label>
                <select
                  value={editedMedicalHistory?.existing_conditions || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'Other') {
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        existing_conditions: '',
                      });
                      setShowCustomConditionInput(true);
                    } else {
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        existing_conditions: value,
                      });
                      setShowCustomConditionInput(false);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Hypertension">Hypertension</option>
                  <option value="Asthma">Asthma</option>
                  <option value="Heart Disease">Heart Disease</option>
                  <option value="Other">Other</option>
                </select>

                {showCustomConditionInput && (
                  <input
                    type="text"
                    placeholder="Enter your condition"
                    value={editedMedicalHistory?.existing_conditions || ''}
                    onChange={(e) =>
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        existing_conditions: e.target.value,
                      })
                    }
                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Chronic Diseases */}
              <div>
                <label className="font-medium text-gray-700 mb-2 block">Chronic Diseases</label>
                <select
                  value={editedMedicalHistory?.chronic_diseases || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'Other') {
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        chronic_diseases: '',
                      });
                      setShowCustomChronicInput(true);
                    } else {
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        chronic_diseases: value,
                      });
                      setShowCustomChronicInput(false);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="Glaucoma">Glaucoma</option>
                  <option value="Cataracts">Cataracts</option>
                  <option value="Macular Degeneration">Macular Degeneration</option>
                  <option value="Other">Other</option>
                </select>

                {showCustomChronicInput && (
                  <input
                    type="text"
                    placeholder="Enter your condition"
                    value={editedMedicalHistory?.chronic_diseases || ''}
                    onChange={(e) =>
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        chronic_diseases: e.target.value,
                      })
                    }
                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Previous Eye Conditions */}
              <div>
                <label className="font-medium text-gray-700 mb-2 block">Previous Eye Conditions</label>
                <select
                  value={editedMedicalHistory?.previous_eye_conditions || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'Other') {
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        previous_eye_conditions: '',
                      });
                      setShowCustomEyeConditionInput(true);
                    } else {
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        previous_eye_conditions: value,
                      });
                      setShowCustomEyeConditionInput(false);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="Dry Eye Syndrome">Dry Eye Syndrome</option>
                  <option value="Retinal Detachment">Retinal Detachment</option>
                  <option value="Conjunctivitis">Conjunctivitis</option>
                  <option value="Other">Other</option>
                </select>

                {showCustomEyeConditionInput && (
                  <input
                    type="text"
                    placeholder="Enter your condition"
                    value={editedMedicalHistory?.previous_eye_conditions || ''}
                    onChange={(e) =>
                      setEditedMedicalHistory({
                        ...editedMedicalHistory,
                        previous_eye_conditions: e.target.value,
                      })
                    }
                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Last Checkup */}
              <div>
                <label className="font-medium text-gray-700 mb-2 block">Last Checkup</label>
                <input
                  type="date"
                  value={
                    editedMedicalHistory?.last_checkup_date
                      ? new Date(editedMedicalHistory.last_checkup_date).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setEditedMedicalHistory({
                      ...editedMedicalHistory,
                      last_checkup_date: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsEditingHistory(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Existing Conditions</h3>
              <p
                className="text-gray-600 cursor-pointer hover:text-blue-600 transition"
                onClick={() => {
                  setEditedMedicalHistory(medicalHistory);
                  setIsEditingHistory(true);
                }}
              >
                {medicalHistory?.existing_conditions || 'None reported'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Chronic Diseases</h3>
              <p
                className="text-gray-600 cursor-pointer hover:text-blue-600 transition"
                onClick={() => {
                  setEditedMedicalHistory(medicalHistory);
                  setIsEditingHistory(true);
                }}
              >
                {medicalHistory?.chronic_diseases || 'None reported'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Previous Eye Conditions</h3>
              <p
                className="text-gray-600 cursor-pointer hover:text-blue-600 transition"
                onClick={() => {
                  setEditedMedicalHistory(medicalHistory);
                  setIsEditingHistory(true);
                }}
              >
                {medicalHistory?.previous_eye_conditions || 'None reported'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Last Checkup</h3>
              <p
                className="text-gray-600 cursor-pointer hover:text-blue-600 transition"
                onClick={() => {
                  setEditedMedicalHistory(medicalHistory);
                  setIsEditingHistory(true);
                }}
              >
                {medicalHistory?.last_checkup_date
                  ? new Date(medicalHistory.last_checkup_date).toLocaleDateString()
                  : 'No record'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* OCT Scans Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">OCT Scan History</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {octImages.map((scan) => (
            <div key={scan.id} className="border rounded-lg p-4">
              <img
                src={scan.image_path}
                alt={`OCT Scan from ${new Date(scan.upload_date).toLocaleDateString()}`}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {new Date(scan.upload_date).toLocaleDateString()}
                </p>
                <button
                  onClick={() => window.open(scan.image_path, '_blank')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disease Progression Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Disease Progression</h2>
        <div className="h-64">
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 1
              }
            }
          }} />
        </div>
      </div>

      {/* Previous Diagnoses */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Previous Diagnoses</h2>
          <Clock className="h-6 w-6 text-blue-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disease Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {predictions.map((prediction) => (
                <tr key={prediction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(prediction.prediction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prediction.disease_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prediction.severity_level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(prediction.confidence_score * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {/* TODO: View report */}}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Download report */}}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Follow-up Reminders */}
      {healthReports[0]?.requires_immediate_attention && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Immediate attention required. Please contact your healthcare provider.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Download Dashboard Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={downloadDashboardAsPDF}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Download className="h-5 w-5" />
          <span>Download Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;