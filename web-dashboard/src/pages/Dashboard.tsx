import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  const getLeadsPathWithStatus = (status?: string): string => {
    if (!status) {
      return '/leads';
    }
    return `/leads?status=${encodeURIComponent(status)}`;
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, onClick: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
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
            <div
              className="stat-card clickable-card"
              onClick={() => navigate('/leads')}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => handleCardKeyDown(event, () => navigate('/leads'))}
            >
              <h3>Total Leads</h3>
              <div className="value">{data.summary?.totalLeads || 0}</div>
            </div>
            <div
              className="stat-card clickable-card"
              onClick={() => navigate(getLeadsPathWithStatus('Enrolled'))}
              role="button"
              tabIndex={0}
              onKeyDown={(event) =>
                handleCardKeyDown(event, () =>
                  navigate(getLeadsPathWithStatus('Enrolled'))
                )
              }
            >
              <h3>Enrolled Leads</h3>
              <div className="value">{data.summary?.enrolledLeads || 0}</div>
            </div>
            <div
              className="stat-card clickable-card"
              onClick={() => navigate('/franchises')}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => handleCardKeyDown(event, () => navigate('/franchises'))}
            >
              <h3>Total Franchises</h3>
              <div className="value">{data.summary?.totalFranchises || 0}</div>
            </div>
          </div>

          <div
            className="card clickable-section-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/leads')}
            onKeyDown={(event) => handleCardKeyDown(event, () => navigate('/leads'))}
          >
            <h2 className="card-title">Leads by Status</h2>
            <div className="status-chart">
              {data.leadsByStatus?.map((status) => (
                <div
                  key={status._id}
                    className="status-item clickable-status-item"
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(getLeadsPathWithStatus(status._id));
                    }}
                    onKeyDown={(event) =>
                      handleCardKeyDown(event, () =>
                        navigate(getLeadsPathWithStatus(status._id))
                      )
                    }
                  >
                  <span className="status-name">{status._id}</span>
                  <span className="status-count">{status.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="card clickable-section-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/commissions')}
            onKeyDown={(event) => handleCardKeyDown(event, () => navigate('/commissions'))}
          >
            <h2 className="card-title">Commission Summary</h2>
            <div className="commission-summary">
              {data.commissions?.map((comm) => (
                <div
                  key={comm._id}
                  className="commission-item clickable-commission-item"
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate('/commissions', { state: { prefillStatus: comm._id } });
                  }}
                  onKeyDown={(event) =>
                    handleCardKeyDown(event, () =>
                      navigate('/commissions', { state: { prefillStatus: comm._id } })
                    )
                  }
                >
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
