import React, { useEffect, useState } from 'react';
import { commissionAPI } from '../api';
import './CommissionsPage.css';

interface Commission {
  _id: string;
  franchiseId?: { franchiseName: string };
  leadId?: { studentName: string };
  admissionAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: string;
  remarks?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Filters {
  status: string;
}

interface FormData {
  status: string;
  remarks: string;
}

const CommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    status: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState<FormData>({
    status: 'Pending',
    remarks: '',
  });

  useEffect(() => {
    fetchCommissions();
  }, [pagination.page, filters]);

  const fetchCommissions = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await commissionAPI.getCommissions({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setCommissions(response.data.commissions);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to load commissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEditClick = (commission: Commission): void => {
    setSelectedCommission(commission);
    setFormData({
      status: commission.status,
      remarks: commission.remarks || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await commissionAPI.updateStatus(selectedCommission!._id, formData);
      setShowModal(false);
      await fetchCommissions();
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Failed to update commission');
      console.error(err);
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    if (status === 'Paid') return 'badge-success';
    if (status === 'Approved') return 'badge-warning';
    return 'badge-info';
  };

  return (
    <div className="commissions-page">
      <div className="page-header">
        <h1>Commission Management</h1>
        <p>Manage franchise commissions</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="filter-group">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading commissions...</div>
        ) : commissions.length === 0 ? (
          <div className="empty-state">No commissions found</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Franchise</th>
                  <th>Student Name</th>
                  <th>Admission Amount</th>
                  <th>Commission %</th>
                  <th>Commission Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission._id}>
                    <td>{commission.franchiseId?.franchiseName || 'N/A'}</td>
                    <td>{commission.leadId?.studentName || 'N/A'}</td>
                    <td>₹{commission.admissionAmount?.toLocaleString() || 0}</td>
                    <td>{commission.commissionPercentage}%</td>
                    <td>₹{commission.commissionAmount?.toLocaleString() || 0}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(commission.status)}`}>
                        {commission.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditClick(commission)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={page === pagination.page ? 'active' : ''}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                >
                  {page}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && selectedCommission && (
        <div className={`modal ${showModal ? 'show' : ''}`} onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Commission Status</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                  }
                  placeholder="Add remarks about this commission"
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
                  Update Commission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionsPage;
