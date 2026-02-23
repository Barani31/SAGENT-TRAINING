import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api';

export default function ApplyNow() {
  const { user } = useAuth();
  const [step, setStep]       = useState(1); // 1=course, 2=details, 3=payment, 4=done
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [appId, setAppId]     = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [details, setDetails] = useState({ docType: '', grade: '', subjects: '' });
  const [payment, setPayment] = useState({ paymentMode: 'Online', deadline: '' });

  useEffect(() => {
    fetch(`${BASE}/courses`).then(r => r.json()).then(setCourses).catch(() => {});
  }, []);

  const submitApplication = async () => {
    if (!selected) { setError('Please select a course.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Pending',
          appliedDate: new Date().toISOString().split('T')[0],
          student: { studentId: user.studentId },
          course:  { courseId: selected.courseId },
        }),
      });
      const data = await res.json();
      setAppId(data.applicationId);

      if (details.docType) {
        await fetch(`${BASE}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docType: details.docType,
            uploadedDate: new Date().toISOString().split('T')[0],
            application: { applicationId: data.applicationId },
          }),
        });
      }
      setStep(3);
    } catch {
      setError('Failed to submit application. Please try again.');
    }
    setLoading(false);
  };

  const submitPayment = async () => {
    if (!payment.deadline) { setError('Please set a payment deadline.'); return; }
    setLoading(true); setError('');
    try {
      // Save as UNPAID so student can pay from the Payments page
      await fetch(`${BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMode: payment.paymentMode,
          status: 'UNPAID',
          paymentDate: null,
          deadline: payment.deadline,
          application: { applicationId: appId },
        }),
      });
      setStep(4);
      setSuccess(true);
    } catch {
      setError('Payment record creation failed. Please try again.');
    }
    setLoading(false);
  };

  const reset = () => {
    setStep(1); setSelected(null); setAppId(null);
    setError(''); setSuccess(false);
    setDetails({ docType: '', grade: '', subjects: '' });
    setPayment({ paymentMode: 'Online', deadline: '' });
  };

  const steps = ['Select Course', 'Application Details', 'Payment', 'Complete'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">New Application</h1>
        <p className="page-subtitle">Apply for a course in a few simple steps</p>
      </div>

      {/* Step Indicator */}
      <div className="steps" style={{ marginBottom: 28 }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`step ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`}>
              <div className="step-circle">{step > i+1 ? '✓' : i+1}</div>
              <span className="step-label">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`step-line ${step > i+1 ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Step 1 — Select Course */}
      {step === 1 && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h2 className="card-title">Available Courses</h2></div>
            {courses.length === 0
              ? <div className="empty-state"><div className="empty-icon">📚</div><p>No courses available. Ask an officer to add courses.</p></div>
              : (
              <div className="course-grid">
                {courses.map(c => (
                  <div key={c.courseId}
                    className={`course-card ${selected?.courseId === c.courseId ? 'selected' : ''}`}
                    onClick={() => setSelected(c)}>
                    <div className="course-name">{c.name}</div>
                    <div className="course-fee">₹{c.fee?.toLocaleString()}</div>
                    <div className="course-meta">
                      {c.duration && <span>⏱ {c.duration}</span>}
                      {c.structure && <span style={{ marginLeft: 12 }}>📐 {c.structure}</span>}
                    </div>
                    {selected?.courseId === c.courseId && (
                      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary" disabled={!selected} onClick={() => { setError(''); setStep(2); }}>
            Continue →
          </button>
          {!selected && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>Select a course above to continue</p>}
        </div>
      )}

      {/* Step 2 — Application Details */}
      {step === 2 && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-header">
            <h2 className="card-title">Application Details</h2>
          </div>
          <div style={{ background: 'var(--gray-100)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Selected Course</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>{selected?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--gold)' }}>₹{selected?.fee?.toLocaleString()}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Document Type (optional)</label>
            <select className="form-input" value={details.docType} onChange={e => setDetails(p => ({ ...p, docType: e.target.value }))}>
              <option value="">Select document</option>
              <option value="Marksheet">Marksheet</option>
              <option value="Aadhar Card">Aadhar Card</option>
              <option value="ID Proof">ID Proof</option>
              <option value="Transfer Certificate">Transfer Certificate</option>
              <option value="Character Certificate">Character Certificate</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Previous Grade / Percentage</label>
            <input className="form-input" placeholder="e.g. 85% or A+" value={details.grade}
              onChange={e => setDetails(p => ({ ...p, grade: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Subjects Studied</label>
            <input className="form-input" placeholder="e.g. Maths, Physics, Chemistry" value={details.subjects}
              onChange={e => setDetails(p => ({ ...p, subjects: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={submitApplication} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Payment Setup */}
      {step === 3 && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-header">
            <h2 className="card-title">Payment Setup</h2>
          </div>
          <div style={{ background: 'var(--green-bg)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--green)' }}>
            ✅ Application #{appId} submitted successfully!
          </div>
          <div style={{ background: 'var(--gray-100)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Amount Due</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display, serif' }}>
              ₹{selected?.fee?.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{selected?.name}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Payment Mode</label>
            <select className="form-input" value={payment.paymentMode} onChange={e => setPayment(p => ({ ...p, paymentMode: e.target.value }))}>
              <option value="Online">Online</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Deadline</label>
            <input className="form-input" type="date" value={payment.deadline}
              onChange={e => setPayment(p => ({ ...p, deadline: e.target.value }))} required />
          </div>
          <div style={{ background: 'var(--orange-bg)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--orange)' }}>
            ⚠️ Payment will be saved as <strong>Unpaid</strong>. Go to <strong>Payments</strong> page to complete your payment.
          </div>
          <button className="btn btn-primary" onClick={submitPayment} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Saving...' : 'Save & Continue →'}
          </button>
        </div>
      )}

      {/* Step 4 — Done */}
      {step === 4 && (
        <div className="card" style={{ maxWidth: 480, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Application Submitted!</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 8 }}>
            Your application <strong>#{appId}</strong> for <strong>{selected?.name}</strong> has been submitted.
          </p>
          <p style={{ color: 'var(--gray-400)', fontSize: 13, marginBottom: 28 }}>
            Go to the <strong>Payments</strong> page to complete your payment. The admissions officer will review your application after payment.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={reset}>Apply for Another Course</button>
          </div>
        </div>
      )}
    </div>
  );
}
