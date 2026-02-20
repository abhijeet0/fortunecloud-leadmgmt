import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';
import './FranchisesPage.css';

interface Franchise {
  _id: string;
  franchiseName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  leadsSubmitted: number;
  commissionPercentage: number;
  createdAt: string;
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
  isVerified: string;
  searchTerm: string;
}

interface FranchiseFormData {
  franchiseName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  status: 'active' | 'inactive' | 'suspended';
  isVerified: string;
  commissionPercentage: string;
}

const FranchisesPage: React.FC = () => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
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
    isVerified: '',
    searchTerm: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [formData, setFormData] = useState<FranchiseFormData>({
    franchiseName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    status: 'active',
    isVerified: 'true',
    commissionPercentage: '10',
  });

  useEffect(() => {
    fetchFranchises();
  }, [pagination.page, filters]);

  const fetchFranchises = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminAPI.getFranchises({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setFranchises(response.data.franchises);
      setPagination(response.data.pagination);
      setError('');
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Failed to load franchises');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEditClick = (franchise: Franchise): void => {
    setSelectedFranchise(franchise);
    setFormData({
      franchiseName: franchise.franchiseName,
      ownerName: franchise.ownerName,
      email: franchise.email,
      phone: franchise.phone,
      city: franchise.city,
      status: franchise.status,
      isVerified: String(franchise.isVerified),
      commissionPercentage: String(franchise.commissionPercentage),
    });
    setShowEditModal(true);
  };

  const handleDeleteFranchise = async (franchise: Franchise): Promise<void> => {
    const confirmed = window.confirm(
      `Delete franchise "${franchise.franchiseName}"? This also removes all related leads, commissions, and notifications.`
    );
    if (!confirmed) return;

    try {
      await adminAPI.deleteFranchise(franchise._id);
      await fetchFranchises();
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Failed to delete franchise');
    }
  };

  const handleUpdateFranchise = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedFranchise) return;

    try {
      await adminAPI.updateFranchise(selectedFranchise._id, {
        franchiseName: formData.franchiseName.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        status: formData.status,
        isVerified: formData.isVerified === 'true',
        commissionPercentage: Number(formData.commissionPercentage),
      });
      setShowEditModal(false);
      await fetchFranchises();
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Failed to update franchise');
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'badge-success',
      inactive: 'badge-warning',
      suspended: 'badge-danger',
    };
    return statusMap[status] || 'badge-info';
  };

  const getVerificationBadgeClass = (isVerified: boolean): string =>
    isVerified ? 'badge-success' : 'badge-warning';

  return (
    <div className="franchises-page">
      <div className="page-header">
        <h1>Franchise Management</h1>
        <p>View, update and delete franchises</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by franchise, owner, email or phone..."
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
          />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select name="isVerified" value={filters.isVerified} onChange={handleFilterChange}>
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
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
          <div className="loading">Loading franchises...</div>
        ) : franchises.length === 0 ? (
          <div className="empty-state">No franchises found</div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="franchise-table">
                <thead>
                  <tr>
                    <th>Franchise Name</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Leads</th>
                    <th>Commission %</th>
                    <th className="action-col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {franchises.map((franchise) => (
                    <tr key={franchise._id}>
                      <td>{franchise.franchiseName}</td>
                      <td>{franchise.ownerName}</td>
                      <td>{franchise.email}</td>
                      <td>{franchise.phone}</td>
                      <td>{franchise.city}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(franchise.status)}`}>
                          {franchise.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getVerificationBadgeClass(franchise.isVerified)}`}>
                          {franchise.isVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{franchise.leadsSubmitted || 0}</td>
                      <td>{franchise.commissionPercentage}%</td>
                      <td className="action-col">
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleEditClick(franchise)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteFranchise(franchise)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      {showEditModal && selectedFranchise && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Franchise</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateFranchise}>
              <div className="form-group">
                <label>Franchise Name</label>
                <input
                  value={formData.franchiseName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, franchiseName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Owner Name</label>
                <input
                  value={formData.ownerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as 'active' | 'inactive' | 'suspended',
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="form-group">
                <label>Verified</label>
                <select
                  value={formData.isVerified}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isVerified: e.target.value }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Commission Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commissionPercentage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, commissionPercentage: e.target.value }))
                  }
                  required
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
                  Update Franchise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchisesPage;
