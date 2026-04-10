import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [mentees, setMentees] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [meetingType, setMeetingType] = useState('individual');
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState('signup');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importedMentorsList, setImportedMentorsList] = useState(null);

  const [mentors, setMentors] = useState([
    {
      id: 1,
      name: 'Yanli Wang',
      bio: 'hey',
      availability: 'Monday & Wednesday, 1-5 PM',
      individualCapacity: 2,
      groupCapacity: 1
    },
    {
      id: 2,
      name: 'Lydia Ridgway',
      bio: 'Most wonderful being',
      availability: 'Tuesday & Thursday, 9 AM-12 PM',
      individualCapacity: 2,
      groupCapacity: 2
    },
    {
      id: 3,
      name: 'Lily Huang',
      bio: 'Most lovely being',
      availability: 'Tuesday & Thursday, 9 AM-12 PM',
      individualCapacity: 2,
      groupCapacity: 2
    }
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mentorshipSignups');
    if (saved) {
      try {
        setMentees(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
    
    const savedMentors = localStorage.getItem('mentors');
    if (savedMentors) {
      try {
        setMentors(JSON.parse(savedMentors));
      } catch (e) {
        console.error('Failed to load mentors', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('mentorshipSignups', JSON.stringify(mentees));
  }, [mentees]);

  useEffect(() => {
    localStorage.setItem('mentors', JSON.stringify(mentors));
  }, [mentors]);

  // CSV Parsing
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const nameIdx = headers.findIndex(h => h.toLowerCase().includes('name'));
    const bioIdx = headers.findIndex(h => h.toLowerCase().includes('bio'));
    const availIdx = headers.findIndex(h => h.toLowerCase().includes('availability'));
    const indivIdx = headers.findIndex(h => h.toLowerCase().includes('individual'));
    const groupIdx = headers.findIndex(h => h.toLowerCase().includes('group'));

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle CSV with quoted fields
      const parts = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '"') {
          inQuotes = !inQuotes;
        } else if (line[j] === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += line[j];
        }
      }
      parts.push(current.trim());

      const mentor = {
        id: i,
        name: parts[nameIdx]?.replace(/"/g, '').trim() || '',
        bio: parts[bioIdx]?.replace(/"/g, '').trim() || '',
        availability: parts[availIdx]?.replace(/"/g, '').trim() || '',
        individualCapacity: parseInt(parts[indivIdx]?.replace(/"/g, '').trim()) || 2,
        groupCapacity: parseInt(parts[groupIdx]?.replace(/"/g, '').trim()) || 1
      };

      if (mentor.name) {
        parsed.push(mentor);
      }
    }
    return parsed;
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result;
        if (typeof csv !== 'string') return;
        
        const parsed = parseCSV(csv);
        setImportedMentorsList(parsed);
      } catch (error) {
        alert('Error parsing CSV: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImportMentors = (parsedMentors) => {
    const withIds = parsedMentors.map((m, idx) => ({ ...m, id: idx + 1 }));
    setMentors(withIds);
    setImportedMentorsList(null);
    setShowImportForm(false);
    alert(`Successfully imported ${withIds.length} mentors!`);
  };

  // Form handling
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !selectedMentor) return;

    // Check if the SELECTED meeting type is full
    if (isFull(selectedMentor, meetingType)) {
      alert(`Sorry, this mentor's ${meetingType} sessions are full. Please choose a different mentor or meeting type.`);
      return;
    }

    const newMentee = {
      id: Date.now(),
      name,
      email,
      mentorId: selectedMentor,
      mentorName: mentors.find(m => m.id === selectedMentor).name,
      meetingType,
      timestamp: new Date().toLocaleDateString()
    };

    setMentees([...mentees, newMentee]);
    setName('');
    setEmail('');
    setSelectedMentor(null);
    setMeetingType('individual');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setAdminPassword('');
    } else {
      alert('Wrong password');
    }
  };

  // Capacity tracking
  const getMenteeCount = (mentorId, type) => {
    return mentees.filter(m => m.mentorId === mentorId && m.meetingType === type).length;
  };

  const isFull = (mentorId, type) => {
    const mentor = mentors.find(m => m.id === mentorId);
    const capacity = type === 'individual' ? mentor.individualCapacity : mentor.groupCapacity;
    return getMenteeCount(mentorId, type) >= capacity;
  };

  const downloadCSV = () => {
    const headers = ['Mentee Name', 'Mentee Email', 'Mentor Name', 'Meeting Type', 'Date Signed Up'];
    const rows = mentees.map(m => [m.name, m.email, m.mentorName, m.meetingType, m.timestamp]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mentorship-matches.csv';
    a.click();
  };

  const deleteMentee = (id) => {
    if (window.confirm('Are you sure?')) {
      setMentees(mentees.filter(m => m.id !== id));
    }
  };

  // Signup View
  if (view === 'signup' && !isAdmin) {
    return (
      <div className="container">
        <header className="header">
          <h1>Find a Mentor for your Eightfold Path program</h1>
          {/* <p></p> */}
        </header>

        <div className="content">
          {/* Important Info Box */}
          <div style={{
            background: '#e8f4f8',
            border: '1px solid #b3d9e8',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 12px', color: '#01579b', fontSize: '16px', fontWeight: 600 }}>
              📋 Meeting Types
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 6px', color: '#0277bd', fontSize: '14px', fontWeight: 600 }}>
                  👤 Individual Sessions
                </p>
                <p style={{ margin: '0', color: '#0277bd', fontSize: '13px', lineHeight: '1.5' }}>
                  one-on-one meeting with the mentor.
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 6px', color: '#0277bd', fontSize: '14px', fontWeight: 600 }}>
                  👥 Group Sessions
                </p>
                <p style={{ margin: '0', color: '#0277bd', fontSize: '13px', lineHeight: '1.5' }}>
                  Up to 6 mentees meet together with the mentor.
                </p>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <section className="section">
            <h2>Sign up as a mentee</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Which type of meeting do you prefer?</label>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ cursor: 'pointer', fontWeight: 'normal', display: 'inline-flex', alignItems: 'flex-start', gap: '4px' }}>
                      <input
                        type="radio"
                        name="meetingType"
                        value="individual"
                        checked={meetingType === 'individual'}
                        onChange={(e) => setMeetingType(e.target.value)}
                        style={{ cursor: 'pointer', marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#333' }}>Individual</div>                    
                      </div>
                    </label>
                  </div>
                  
                  <div>
                    <label style={{ cursor: 'pointer', fontWeight: 'normal', display: 'inline-flex', alignItems: 'flex-start', gap: '4px' }}>
                      <input
                        type="radio"
                        name="meetingType"
                        value="group"
                        checked={meetingType === 'group'}
                        onChange={(e) => setMeetingType(e.target.value)}
                        style={{ cursor: 'pointer', marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#333' }}>Group</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Choose a mentor</label>
                <select
                  value={selectedMentor || ''}
                  onChange={(e) => setSelectedMentor(e.target.value ? parseInt(e.target.value) : null)}
                  required
                >
                  <option value="">-- Select a mentor --</option>
                  {mentors.map(m => {
                    const indivCount = getMenteeCount(m.id, 'individual');
                    const groupCount = getMenteeCount(m.id, 'group');
                    const bothFull = (indivCount >= m.individualCapacity) && (groupCount >= m.groupCapacity);

                    return (
                      <option key={m.id} value={m.id} disabled={bothFull}>
                        {m.name} {bothFull ? '(FULLY BOOKED)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button 
                type="submit"
                disabled={selectedMentor && isFull(selectedMentor, meetingType)}
                style={{ 
                  opacity: selectedMentor && isFull(selectedMentor, meetingType) ? 0.5 : 1,
                  cursor: selectedMentor && isFull(selectedMentor, meetingType) ? 'not-allowed' : 'pointer'
                }}
              >
                {selectedMentor && isFull(selectedMentor, meetingType) 
                  ? `❌ This ${meetingType} slot is FULL` 
                  : 'Sign up'}
              </button>
            </form>

            {submitted && (
              <div className="success-message">
                ✓ Signed up! Your mentor will reach out to schedule a time.
              </div>
            )}
          </section>

          {/* Mentor Cards */}
          <section className="section">
            <h2>Available mentors</h2>
            <div className="mentor-grid">
              {mentors.map(mentor => {
                const indivCount = getMenteeCount(mentor.id, 'individual');
                const groupCount = getMenteeCount(mentor.id, 'group');
                const indivFull = indivCount >= mentor.individualCapacity;
                const groupFull = groupCount >= mentor.groupCapacity;
                
                return (
                  <div key={mentor.id} className="mentor-card">
                    <h3>{mentor.name}</h3>
                    <p className="mentor-bio">{mentor.bio}</p>
                    <p className="mentor-availability">
                      <strong>📅 Available:</strong> {mentor.availability}
                    </p>

                    {/* Individual Sessions */}
                    <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>👤 Individual</span>
                        <span style={{
                          background: indivFull ? '#ffebee' : '#e8f5e9',
                          color: indivFull ? '#c62828' : '#2e7d32',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          {indivCount}/{mentor.individualCapacity}
                        </span>
                      </div>
                      <div className="capacity-bar">
                        <div
                          className="capacity-fill"
                          style={{
                            width: `${(indivCount / mentor.individualCapacity) * 100}%`,
                            background: indivFull ? '#d73a49' : '#28a745'
                          }}
                        />
                      </div>
                    </div>

                    {/* Group Sessions */}
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>👥 Group (6/group)</span>
                        <span style={{
                          background: groupFull ? '#ffebee' : '#e8f5e9',
                          color: groupFull ? '#c62828' : '#2e7d32',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          {groupCount}/{mentor.groupCapacity}
                        </span>
                      </div>
                      <div className="capacity-bar">
                        <div
                          className="capacity-fill"
                          style={{
                            width: `${(groupCount / mentor.groupCapacity) * 100}%`,
                            background: groupFull ? '#d73a49' : '#28a745'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Admin Link */}
          <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <button 
              onClick={() => setView('admin')}
              style={{ background: '#6c757d', border: '1px solid #5a6268' }}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Login
  if (!isAdmin && view === 'admin') {
    return (
      <div className="container">
        <header className="header">
          <h1>Admin Login</h1>
        </header>
        <div className="content">
          <section className="section" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <form onSubmit={handleAdminLogin} className="form">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
              </div>
              <button type="submit">Login</button>
            </form>
          </section>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              onClick={() => setView('signup')}
              style={{ background: '#6c757d', border: '1px solid #5a6268' }}
            >
              Back to signup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="container">
      <header className="header">
        <h1>Admin Dashboard</h1>
        <p>View all matches and manage signups</p>
      </header>

      <div className="content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowImportForm(!showImportForm)}>
            {showImportForm ? '✕ Cancel' : '📥 Import CSV'}
          </button>
          <button onClick={downloadCSV}>📥 Download CSV</button>
          <button 
            onClick={() => { setIsAdmin(false); setView('signup'); }}
            style={{ background: '#6c757d', border: '1px solid #5a6268' }}
          >
            ← Back
          </button>
          <button 
            onClick={() => { if (window.confirm('Clear all signups?')) setMentees([]); }}
            style={{ background: '#d73a49', border: '1px solid #cb2431' }}
          >
            🗑️ Clear all
          </button>
        </div>

        {/* CSV Import Form */}
        {showImportForm && (
          <section className="section">
            <h2>Import mentors from CSV</h2>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '1rem' }}>
              Upload a CSV file with columns: Name, Bio, Availability, Capacity for individual meeting, Capacity for group meeting
            </p>
            <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '2rem' }}>
              <div className="form-group">
                <label>Select CSV file</label>
                <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ padding: '8px' }} />
              </div>

              {importedMentorsList && importedMentorsList.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '16px', marginTop: '1.5rem', marginBottom: '1rem' }}>
                    Preview ({importedMentorsList.length} mentors)
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Bio</th>
                          <th>Availability</th>
                          <th>Individual</th>
                          <th>Group</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importedMentorsList.map((mentor) => (
                          <tr key={mentor.id}>
                            <td>{mentor.name}</td>
                            <td>{mentor.bio}</td>
                            <td>{mentor.availability}</td>
                            <td>{mentor.individualCapacity}</td>
                            <td>{mentor.groupCapacity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button 
                    onClick={() => handleImportMentors(importedMentorsList)}
                    style={{ width: '100%' }}
                  >
                    ✓ Import mentors
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Signups Table */}
        <section className="section">
          <h2>Current signups ({mentees.length})</h2>
          {mentees.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No signups yet</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Mentee</th>
                    <th>Email</th>
                    <th>Mentor</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mentees.map((mentee) => (
                    <tr key={mentee.id}>
                      <td>{mentee.name}</td>
                      <td>{mentee.email}</td>
                      <td>{mentee.mentorName}</td>
                      <td>
                        <span style={{
                          background: mentee.meetingType === 'individual' ? '#e8f5e9' : '#e3f2fd',
                          color: mentee.meetingType === 'individual' ? '#2e7d32' : '#1565c0',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {mentee.meetingType}
                        </span>
                      </td>
                      <td>{mentee.timestamp}</td>
                      <td>
                        <button 
                          onClick={() => deleteMentee(mentee.id)}
                          style={{ 
                            background: '#d73a49', 
                            border: '1px solid #cb2431',
                            padding: '6px 12px',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Mentor Summary */}
        <section className="section">
          <h2>Mentor capacity summary</h2>
          <div className="mentor-grid">
            {mentors.map(mentor => {
              const indivCount = getMenteeCount(mentor.id, 'individual');
              const groupCount = getMenteeCount(mentor.id, 'group');
              return (
                <div key={mentor.id} className="mentor-card">
                  <h3>{mentor.name}</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
                      👤 Individual: <strong>{indivCount}/{mentor.individualCapacity}</strong>
                    </p>
                    <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
                      👥 Group: <strong>{groupCount}/{mentor.groupCapacity}</strong>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
