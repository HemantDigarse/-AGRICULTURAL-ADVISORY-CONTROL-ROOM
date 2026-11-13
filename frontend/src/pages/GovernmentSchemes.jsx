import React, { useEffect, useState } from 'react';
import { Landmark, Upload, Search } from 'lucide-react';
import SchemeCard from '../components/SchemeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AlertBanner from '../components/AlertBanner';
import { getSchemes, getDashboardStats } from '../services/api';
import api from '../services/api';

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadMsg, setUploadMsg] = useState(null);

  // Fetch all schemes from DB
  useEffect(() => {
    api.get('/schemes/')
      .then((res) => {
        const data = res.data;
        setSchemes(data.schemes || []);
      })
      .catch(() => setSchemes([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('name', file.name.replace(/\.[^.]+$/, ''));
      formData.append('description', `Uploaded document: ${file.name}`);
      formData.append('document', file);
      await api.post('/schemes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg({ type: 'success', text: `"${file.name}" uploaded successfully.` });
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.message });
    }
  };

  const filtered = schemes.filter((s) =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading schemes..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Landmark className="w-6 h-6 text-green-700" />
        <h1 className="text-2xl font-bold text-gray-900">Government Schemes</h1>
      </div>

      {uploadMsg && (
        <AlertBanner
          variant={uploadMsg.type === 'success' ? 'success' : 'error'}
          message={uploadMsg.text}
          onClose={() => setUploadMsg(null)}
        />
      )}

      {/* Search and upload */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Upload Document
          <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Scheme cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((scheme) => (
            <SchemeCard key={scheme.id || scheme.name} scheme={scheme} />
          ))}
        </div>
      ) : (
        <EmptyState title="No schemes found" message="No matching government schemes." icon={Landmark} />
      )}
    </div>
  );
}

