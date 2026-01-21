import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';
import './Dashboard.css';

interface DashboardData {
  summary?: {
    totalLeads: number;
    enrolledLeads: number;
    totalFranchises: number;
  };
  leadsByStatus?: Array<{
    _id: string;
    count: number;
  }>;
  commissions?: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to Fortune Cloud Admin Dashboard</p>
      </div>

      {data && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Leads</h3>
              <div className="value">{data.summary?.totalLeads || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Enrolled Leads</h3>
              <div className="value">{data.summary?.enrolledLeads || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Total Franchises</h3>
              <div className="value">{data.summary?.totalFranchises || 0}</div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Leads by Status</h2>
            <div className="status-chart">
              {data.leadsByStatus?.map((status) => (
                <div key={status._id} className="status-item">
                  <span className="status-name">{status._id}</span>
                  <span className="status-count">{status.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Commission Summary</h2>
            <div className="commission-summary">
              {data.commissions?.map((comm) => (
                <div key={comm._id} className="commission-item">
                  <div>
                    <strong>{comm._id}</strong>
                    <p className="text-muted">
                      Total Amount: ₹{comm.totalAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <span className="commission-badge">{comm.count} Commissions</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
