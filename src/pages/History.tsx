import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.ts';
import '../styles/History.css';

const History: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('feeding_history')
        .select('*')
        .order('time', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
      } else {
        setHistory(data || []);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item =>
    item.device_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="history-container">
      <h1>Feeding History</h1>
      <input
        type="text"
        placeholder="Search by device ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <table className="history-table">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Time</th>
            <th>Amount (g)</th>
          </tr>
        </thead>
        <tbody>
          {paginatedHistory.map((item, index) => (
            <tr key={index}>
              <td>{item.device_id}</td>
              <td>{new Date(item.time).toLocaleString()}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={page === currentPage ? 'active' : ''}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default History;