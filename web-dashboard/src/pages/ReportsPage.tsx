import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';
import './ReportsPage.css';

interface StatusItem {
  _id: string;
  count: number;
}

interface FranchiseItem {
  _id: string;
  franchiseName: string;
  count: number;
  enrolled: number;
}

interface CommissionItem {
  _id: string;
  count: number;
  totalAmount: number;
}

const ReportsPage: React.FC = () => {
  const [leadsByStatus, setLeadsByStatus] = useState<StatusItem[]>([]);
  const [leadsByFranchise, setLeadsByFranchise] = useState<FranchiseItem[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (): Promise<void> => {
    try {
      setLoading(true);
      const [statusRes, franchiseRes, commissionRes] = await Promise.all([
        adminAPI.getReports.leadsByStatus(),
        adminAPI.getReports.leadsByFranchise(),
        adminAPI.getReports.commissionSummary(),
      ]);

      setLeadsByStatus(statusRes.data || []);
      setLeadsByFranchise(franchiseRes.data || []);
      setCommissionSummary(commissionRes.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports</h1>
        <p>View analytics and reports</p>
      </div>

      <div className="card">
        <h2 className="card-title">Leads by Status</h2>
        {leadsByStatus.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {leadsByStatus.map((item) => {
                const total = leadsByStatus.reduce((sum, i) => sum + i.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(2);
                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{item._id}</strong>
                    </td>
                    <td>{item.count}</td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress" style={{ width: `${percentage}%` }}></div>
                      </div>
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Leads by Franchise</h2>
        {leadsByFranchise.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Franchise Name</th>
                <th>Total Leads</th>
                <th>Enrolled</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {leadsByFranchise.map((item) => {
                const rate =
                  item.count > 0 ? ((item.enrolled / item.count) * 100).toFixed(2) : '0';
                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.franchiseName || 'Unknown'}</strong>
                    </td>
                    <td>{item.count}</td>
                    <td>{item.enrolled}</td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress" style={{ width: `${rate}%` }}></div>
                      </div>
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Commission Summary</h2>
        {commissionSummary.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Total Amount</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {commissionSummary.map((item) => {
                const total = commissionSummary.reduce((sum, i) => sum + i.totalAmount, 0);
                const percentage =
                  total > 0 ? ((item.totalAmount / total) * 100).toFixed(2) : '0';
                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{item._id}</strong>
                    </td>
                    <td>{item.count}</td>
                    <td>₹{item.totalAmount?.toLocaleString() || 0}</td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress" style={{ width: `${percentage}%` }}></div>
                      </div>
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
