import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';
import './LeadsPage.css';

interface Lead {
  _id: string;
  studentName: string;
  phone: string;
  city: string;
  qualification: string;
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

const LeadsPage: React.FC = () => {
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
    status: '',
    city: '',
    searchTerm: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, [pagination.page, filters]);

  const fetchLeads = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminAPI.getLeads({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setLeads(response.data.leads);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to load leads');
      console.error(err);
    } finally {
      setLoading(false);
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
                      <button
                        className="btn btn-primary"
                        onClick={() => handleLeadClick(lead._id)}
                      >
                        View
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
    </div>
  );
};

export default LeadsPage;
