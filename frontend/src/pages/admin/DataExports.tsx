import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { exportsApi } from '../../api';
import type { DataExport } from '../../types';

export default function DataExports() {
  const [exports, setExports] = useState<DataExport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    setLoading(true);
    try {
      const res = await exportsApi.list();
      if (res.data?.success) {
        setExports(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (id: string, fileName: string) => {
    const url = exportsApi.downloadUrl(id);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout title="Data Exports & Archives">
      <div className="container" style={{ maxWidth: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Data Exports & Archives</h2>
          <button className="btn btn-outline" onClick={fetchExports} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>

        <div className="card" style={{ marginBottom: 24, background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            <strong>Note:</strong> Auto-cleanup generates Excel archives 5 days before deletion. These files expire and are permanently deleted 2 days after the cleanup executes. Please download them while they are available.
          </p>
        </div>

        {exports.length === 0 && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <p>No exports available at the moment.</p>
          </div>
        )}

        {exports.length > 0 && (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Generated On</th>
                  <th>Scheduled Cleanup For</th>
                  <th>Expires On</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exports.map(exp => {
                  const isExpired = new Date(exp.expiresAt) < new Date();
                  return (
                    <tr key={exp.id}>
                      <td><strong>{exp.fileName}</strong></td>
                      <td>{new Date(exp.createdAt).toLocaleString()}</td>
                      <td>{new Date(exp.scheduledFor).toLocaleDateString()}</td>
                      <td>
                        <span style={{ color: isExpired ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                          {new Date(exp.expiresAt).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
                          {isExpired ? 'EXPIRED' : exp.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-sm btn-primary" 
                          disabled={isExpired}
                          onClick={() => downloadFile(exp.id, exp.fileName)}
                        >
                          ⬇ Download Excel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
