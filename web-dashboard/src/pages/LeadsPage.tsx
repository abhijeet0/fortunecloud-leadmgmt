import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../api';
import './LeadsPage.css';

interface Lead {
  _id: string;
  studentName: string;
  phone: string;
  city: string;
  qualification: string;
  stream?: string;
  yearOfPassing?: number;
  email?: string;
  remarks?: string;
  currentStatus: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Filters {
  status: string;
  city: string;
  searchTerm: string;
}

interface LeadFormData {
  studentName: string;
  phone: string;
  city: string;
  qualification: string;
  stream: string;
  yearOfPassing: string;
  email: string;
  remarks: string;
}

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatusFromQuery = searchParams.get('status')?.trim() || '';
  const initialStatusFromState =
    (location.state as { prefillStatus?: string } | null)?.prefillStatus || '';
  const initialStatus = initialStatusFromQuery || initialStatusFromState;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    status: initialStatus,
    city: '',
    searchTerm: '',
  });
  const fetchSequenceRef = useRef(0);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusData, setStatusData] = useState({
    newStatus: '',
    remarks: '',
  });
  const [editData, setEditData] = useState<LeadFormData>({
    studentName: '',
    phone: '',
    city: '',
    qualification: '',
    stream: '',
    yearOfPassing: '',
    email: '',
    remarks: '',
  });

  useEffect(() => {
    fetchLeads();
  }, [pagination.page, filters]);

  useEffect(() => {
    const statusFromQuery = searchParams.get('status')?.trim() || '';
    const prefillStatusFromState =
      (location.state as { prefillStatus?: string } | null)?.prefillStatus || '';
    const targetStatus = statusFromQuery || prefillStatusFromState;
    if (!targetStatus || targetStatus === filters.status) return;

    setFilters((prev) => ({ ...prev, status: targetStatus }));
    setPagination((prev) => ({ ...prev, page: 1 }));

    if (!statusFromQuery && prefillStatusFromState) {
      navigate(`${location.pathname}?status=${encodeURIComponent(prefillStatusFromState)}`, {
        replace: true,
        state: null,
      });
    }
  }, [filters.status, location.pathname, location.state, navigate, searchParams]);

  useEffect(() => {
    if (filters.status) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('status', filters.status);
        return next;
      }, { replace: true });
    } else if (searchParams.get('status')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('status');
        return next;
      }, { replace: true });
    }
  }, [filters.status, searchParams, setSearchParams]);

  const fetchLeads = async (): Promise<void> => {
    const requestId = ++fetchSequenceRef.current;

    try {
      setLoading(true);
      const response = await adminAPI.getLeads({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      // Prevent stale responses from overriding newer filtered results.
      if (requestId !== fetchSequenceRef.current) {
        return;
      }

      setLeads(response.data.leads);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      if (requestId !== fetchSequenceRef.current) {
        return;
      }
      setError('Failed to load leads');
      console.error(err);
    } finally {
      if (requestId === fetchSequenceRef.current) {
        setLoading(false);
      }
    }
  };

  const handleUpdateStatus = (lead: Lead) => {
    setSelectedLead(lead);
    setStatusData({
      newStatus: lead.currentStatus,
      remarks: '',
    });
    setShowStatusModal(true);
  };

  const handleEditLead = (lead: Lead): void => {
    setSelectedLead(lead);
    setEditData({
      studentName: lead.studentName || '',
      phone: lead.phone || '',
      city: lead.city || '',
      qualification: lead.qualification || '',
      stream: lead.stream || '',
      yearOfPassing: lead.yearOfPassing ? String(lead.yearOfPassing) : '',
      email: lead.email || '',
      remarks: lead.remarks || '',
    });
    setShowEditModal(true);
  };

  const submitStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await adminAPI.updateLeadStatus(selectedLead._id, statusData);
      setShowStatusModal(false);
      fetchLeads();
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Failed to update status');
    }
  };

  const submitLeadEdit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await adminAPI.updateLead(selectedLead._id, {
        studentName: editData.studentName.trim(),
        phone: editData.phone.trim(),
        city: editData.city.trim(),
        qualification: editData.qualification.trim(),
        stream: editData.stream.trim(),
        yearOfPassing: editData.yearOfPassing.trim(),
        email: editData.email.trim(),
        remarks: editData.remarks.trim(),
      });
      setShowEditModal(false);
      await fetchLeads();
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Failed to update lead');
    }
  };

  const handleDeleteLead = async (lead: Lead): Promise<void> => {
    const confirmed = window.confirm(
      `Delete lead "${lead.studentName}"? This will also remove related status history and commission records.`
    );
    if (!confirmed) return;

    try {
      await adminAPI.deleteLead(lead._id);
      await fetchLeads();
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Failed to delete lead');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, searchTerm: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleLeadClick = (leadId: string): void => {
    navigate(`/leads/${leadId}`);
  };

  const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      Enrolled: 'badge-success',
      HOT: 'badge-danger',
      WARM: 'badge-warning',
      COLD: 'badge-info',
      'Lead acknowledged': 'badge-info',
      Visited: 'badge-warning',
    };
    return statusMap[status] || 'badge-info';
  };

  return (
    <div className="leads-page">
      <div className="page-header">
        <h1>Lead Management</h1>
        <p>View and manage all student leads</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name or phone..."
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleSearch}
          />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Lead acknowledged">Lead Acknowledged</option>
            <option value="HOT">HOT</option>
            <option value="WARM">WARM</option>
            <option value="Unspoken">Unspoken</option>
            <option value="COLD">COLD</option>
            <option value="Visited">Visited</option>
            <option value="Enrolled">Enrolled</option>
          </select>
          <input
            type="text"
            placeholder="Filter by city..."
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
          />
        </div>

        {loading ? (
          <div className="loading">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">No leads found</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Qualification</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.studentName}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.city}</td>
                    <td>{lead.qualification}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(lead.currentStatus)}`}>
                        {lead.currentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleLeadClick(lead._id)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditLead(lead)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateStatus(lead)}
                        >
                          Status
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteLead(lead)}
                        >
                          Delete
                        </button>
                      </div>
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

      {showStatusModal && selectedLead && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update Status</h2>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <form onSubmit={submitStatusUpdate}>
              <div className="form-group">
                <label>Student Name</label>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {selectedLead.studentName}
                </p>
              </div>
              <div className="form-group">
                <label>New Status</label>
                <select
                  value={statusData.newStatus}
                  onChange={(e) => setStatusData(prev => ({ ...prev, newStatus: e.target.value }))}
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
                  value={statusData.remarks}
                  onChange={(e) => setStatusData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter status update remarks..."
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedLead && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Lead</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={submitLeadEdit}>
              <div className="form-group">
                <label>Student Name</label>
                <input
                  value={editData.studentName}
                  onChange={(e) => setEditData((prev) => ({ ...prev, studentName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={editData.phone}
                  onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  value={editData.city}
                  onChange={(e) => setEditData((prev) => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <input
                  value={editData.qualification}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, qualification: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Stream</label>
                <input
                  value={editData.stream}
                  onChange={(e) => setEditData((prev) => ({ ...prev, stream: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year Of Passing</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={editData.yearOfPassing}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, yearOfPassing: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={editData.remarks}
                  onChange={(e) => setEditData((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
