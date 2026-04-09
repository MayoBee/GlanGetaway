import React, { useState, useEffect } from 'react';
import ImageUpload from '../../components/ImageUpload';
import axiosInstance from '../../lib/api-client';

const ApplyForResortOwner: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        const response = await axiosInstance.get('/api/role-promotion-requests');
        const requests = response.data;
        const pending = requests.find((req: any) => req.status === 'pending');
        setPendingRequest(pending);
      } catch (err) {
        console.error('Error fetching requests:', err);
      }
    };
    fetchPendingRequest();
  }, []);

  const handleSubmit = async () => {
    if (!imageFile || !description.trim()) {
      setError('Please provide both business permit and description.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const formData = new FormData();
    formData.append('businessPermit', imageFile);
    formData.append('description', description);
    try {
      await axiosInstance.post('/api/role-promotion-requests', formData);
      alert('Request submitted successfully!');
      setImageFile(null);
      setDescription('');
      // Refresh pending
      const response = await axiosInstance.get('/api/role-promotion-requests');
      const requests = response.data;
      const pending = requests.find((req: any) => req.status === 'pending');
      setPendingRequest(pending);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingRequest) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Apply for Resort Owner</h1>
        <p className="text-yellow-600">Your request is pending approval.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Apply for Resort Owner</h1>
      <div className="space-y-4">
        <ImageUpload
          label="Business Permit"
          onChange={() => {}}
          onFileChange={(file) => setImageFile(file)}
        />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
            placeholder="Describe your application..."
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
};

export default ApplyForResortOwner;