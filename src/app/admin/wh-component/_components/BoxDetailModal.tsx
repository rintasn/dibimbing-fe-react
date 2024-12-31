import React, { useState } from 'react';

interface BoxDetail {
  created_at: string;
  id_box: string;
  no_wo: string;
  status_matching: string;
  updated_at: string;
  pn: string;
  pn_sequence: number;
}

interface BoxDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  boxDetails: BoxDetail[];
}

const BoxDetailModal: React.FC<BoxDetailModalProps> = ({ isOpen, onClose, boxDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  // Filter box details based on the search term
  const filteredBoxDetails = boxDetails.filter(detail =>
    detail.pn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.no_wo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-4 bg-white rounded shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Box Details</h2>
        
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by PN or No WO"
          className="w-full p-2 mb-4 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Scrollable Area for Box Details */}
        <div className="overflow-y-auto max-h-60">
          {filteredBoxDetails.length > 0 ? (
            filteredBoxDetails.map((detail) => (
              <div key={detail.pn} className="mb-4">
                <p><strong>PN:</strong> {detail.pn}</p>
                <p><strong>No WO:</strong> {detail.no_wo}</p>
                <p><strong>Status Matching:</strong> {detail.status_matching}</p>
                <p><strong>Created At:</strong> {new Date(detail.created_at).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(detail.updated_at).toLocaleString()}</p>
                <hr />
              </div>
            ))
          ) : (
            <p>No details available.</p>
          )}
        </div>

        <button onClick={onClose} className="mt-4 text-red-500">Close</button>
      </div>
    </div>
  );
};

export default BoxDetailModal;
