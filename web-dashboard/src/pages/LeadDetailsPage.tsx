import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';
import './LeadDetailsPage.css';

interface Lead {
  _id: string;
  studentName: string;
  phone: string;
  email?: string;
  city: string;
  qualification: string;
  stream: string;
  yearOfPassing?: number;
  currentStatus: string;
}

interface HistoryItem {
  _id: string;
  newStatus: string;
  previousStatus?: string;
  remarks?: string;
  createdAt: string;
}

interface Commission {
  _id: string;
  admissionAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: string;
}

interface FormData {
  newStatus: string;
  remarks: string;
}

interface EnrollmentData {
  admissionAmount: string;
}

const LeadDetailsPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commission, setCommission] = useState<Commission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    newStatus: 'Lead acknowledged',
    remarks: '',
  });
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    admissionAmount: '',
  });

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchLeadDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminAPI.getLeadDetails(leadId!);
      setLead(response.data.lead);
      setHistory(response.data.history || []);
      setCommission(response.data.commission || null);
      setFormData((prev) => ({ ...prev, newStatus: response.data.lead.currentStatus }));
      setError('');
    } catch (err) {
      setError('Failed to load lead details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await adminAPI.updateLeadStatus(leadId!, {
        newStatus: formData.newStatus,
        remarks: formData.remarks,
      });
      setShowModal(false);
      await fetchLeadDetails();
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const handleEnrollment = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await adminAPI.createEnrollment({
        leadId,
        admissionAmount: parseFloat(enrollmentData.admissionAmount),
      });
      setShowEnrollmentModal(false);
      setEnrollmentData({ admissionAmount: '' });
      await fetchLeadDetails();
    } catch (err) {
      setError('Failed to create enrollment');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading lead details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!lead) return <div className="error">Lead not found</div>;

  return (
    <div className="lead-details">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/leads')}>
          ← Back
        </button>
        <h1>{lead.studentName}</h1>
      </div>

      <div className="details-grid">
        <div className="card">
          <h2 className="card-title">Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Student Name</label>
              <p>{lead.studentName}</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>{lead.phone}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{lead.email || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>City</label>
              <p>{lead.city}</p>
            </div>
            <div className="info-item">
              <label>Qualification</label>
              <p>{lead.qualification}</p>
            </div>
            <div className="info-item">
              <label>Stream</label>
              <p>{lead.stream}</p>
            </div>
            <div className="info-item">
              <label>Year of Passing</label>
              <p>{lead.yearOfPassing || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Current Status</label>
              <p>
                <span className="badge badge-success">{lead.currentStatus}</span>
              </p>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Update Status
            </button>
            {lead.currentStatus !== 'Enrolled' && (
              <button
                className="btn btn-success"
                onClick={() => setShowEnrollmentModal(true)}
              >
                Create Enrollment
              </button>
            )}
          </div>
        </div>

        {commission && (
          <div className="card">
            <h2 className="card-title">Commission Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Admission Amount</label>
                <p>₹{commission.admissionAmount?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Commission Percentage</label>
                <p>{commission.commissionPercentage}%</p>
              </div>
              <div className="info-item">
                <label>Commission Amount</label>
                <p>₹{commission.commissionAmount?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>
                  <span
                    className={`badge ${
                      commission.status === 'Paid'
                        ? 'badge-success'
                        : commission.status === 'Approved'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                  >
                    {commission.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Status History</h2>
        {history.length === 0 ? (
          <p>No status history</p>
        ) : (
          <div className="timeline">
            {history.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>{item.newStatus}</strong>
                    <span className="timeline-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {item.remarks && <p className="timeline-remarks">{item.remarks}</p>}
                  {item.previousStatus && (
                    <p className="timeline-previous">From: {item.previousStatus}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update Lead Status</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label>New Status</label>
                <select
                  value={formData.newStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, newStatus: e.target.value }))
                  }
                  required
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Lead acknowledged">Lead Acknowledged</option>
                  <option value="HOT">HOT</option>
                  <option value="WARM">WARM</option>
                  <option value="Unspoken">Unspoken</option>
                  <option value="COLD">COLD</option>
                  <option value="Visited">Visited</option>
                  <option value="Enrolled">Enrolled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                  }
                  placeholder="Add remarks about this status change"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEnrollmentModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Enrollment</h2>
              <button
                className="modal-close"
                onClick={() => setShowEnrollmentModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEnrollment}>
              <div className="form-group">
                <label>Admission Amount</label>
                <input
                  type="number"
                  value={enrollmentData.admissionAmount}
                  onChange={(e) =>
                    setEnrollmentData((prev) => ({
                      ...prev,
                      admissionAmount: e.target.value,
                    }))
                  }
                  placeholder="Enter admission amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEnrollmentModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Create Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailsPage;
