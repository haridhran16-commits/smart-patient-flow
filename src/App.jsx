import { useMemo, useState } from 'react'

const baseQueues = {
  blood: { name: 'Blood Test', icon: '🩸', waiting: 2, wait: 12, time: '10:42 AM', location: 'Diagnostics, Floor 1', duration: 15 },
  mri: { name: 'MRI Scan', icon: '◉', waiting: 5, wait: 35, time: '11:15 AM', location: 'Imaging Centre, Floor 2', duration: 30 },
}

const questions = {
  "What's next?": 'Your next step is the Blood Test. You have 2 people ahead and an estimated wait of 12 minutes.',
  'How long do I have to wait?': 'Your Blood Test is expected to be ready at 10:42 AM — approximately 12 minutes from now.',
  'Where is my next test?': 'Your Blood Test is at Diagnostics, Floor 1. Follow the blue signs from the main waiting area.',
  'Can I take a break?': 'Yes. You have about 25 minutes of free time before your next scheduled step. Use the break planner below.',
  'When do I meet the doctor again?': 'Dr. Mehta will review your reports after the MRI. Your estimated review is at 12:00 PM.',
}

function App() {
  const [page, setPage] = useState('home')
  const [consultation, setConsultation] = useState('waiting')
  const [journeyGenerated, setJourneyGenerated] = useState(false)
  const [queues, setQueues] = useState(baseQueues)
  const [bloodDone, setBloodDone] = useState(false)
  const [mriDone, setMriDone] = useState(false)
  const [reportReady, setReportReady] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const [breakMessage, setBreakMessage] = useState('')
  const [assistantReply, setAssistantReply] = useState('Hi Rahul! I can help you understand your hospital journey today.')

  const nextStep = reviewDone ? 'Journey Completed' : !journeyGenerated ? 'Doctor Consultation' : !bloodDone ? 'Blood Test' : !mriDone ? 'MRI Scan' : !reportReady ? 'Report Processing' : 'Doctor Review'
  const currentQueue = !bloodDone ? queues.blood : queues.mri
  const recommendation = useMemo(() => {
    const bloodFinish = queues.blood.waiting * 6 + queues.blood.duration
    const mriFinish = queues.mri.waiting * 7 + queues.mri.duration
    return bloodFinish <= mriFinish ? 'Blood Test → MRI Scan' : 'MRI Scan → Blood Test'
  }, [queues])

  const completeBlood = () => { setBloodDone(true); setQueues(q => ({ ...q, blood: { ...q.blood, waiting: Math.max(0, q.blood.waiting - 1) } })) }
  const completeMri = () => setMriDone(true)
  const serve = key => setQueues(q => ({ ...q, [key]: { ...q[key], waiting: Math.max(0, q[key].waiting - 1), wait: Math.max(0, q[key].wait - (key === 'blood' ? 6 : 7)) } }))

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setPage('home')}><span className="brand-mark">✚</span> Smart Patient Flow</button>
      <nav>
        <button className={page === 'patient' ? 'active' : ''} onClick={() => setPage('patient')}>Patient</button>
        <button className={page === 'doctor' ? 'active' : ''} onClick={() => setPage('doctor')}>Doctor</button>
        <button className={page === 'queue' ? 'active' : ''} onClick={() => setPage('queue')}>Queues</button>
      </nav>
    </header>
    {page === 'home' && <Home go={setPage} />}
    {page === 'patient' && <Patient {...{ consultation, journeyGenerated, bloodDone, mriDone, reportReady, reviewDone, nextStep, currentQueue, breakMessage, setBreakMessage, assistantReply, setAssistantReply, completeBlood, completeMri }} />}
    {page === 'doctor' && <Doctor {...{ consultation, setConsultation, journeyGenerated, setJourneyGenerated, recommendation, bloodDone, mriDone, reportReady, setReportReady, reviewDone, setReviewDone }} />}
    {page === 'queue' && <Queues queues={queues} serve={serve} />}
  </div>
}

function Home({ go }) { return <main className="landing"><div className="eyebrow">HEALTHCARE JOURNEY ORCHESTRATION</div><h1>One patient.<br/><em>One journey.</em><br/>Zero guesswork.</h1><p>Smart Patient Flow coordinates consultations, diagnostic queues and follow-ups into one intelligent patient journey.</p><div className="hero-actions"><button className="primary" onClick={() => go('patient')}>View Rahul's journey <span>→</span></button><button className="secondary" onClick={() => go('doctor')}>Open Doctor Dashboard</button></div><div className="mini-stats"><div><b>12 min</b><span>Blood test wait</span></div><div><b>2</b><span>People ahead</span></div><div><b>~90 min</b><span>Full journey</span></div></div></main> }

function Patient(p) { const steps = [
  ['Appointment', true, '10:30 AM'], ['Doctor Consultation', p.consultation === 'completed', 'Dr. Mehta'], ['Blood Test', p.bloodDone, p.currentQueue.location], ['MRI Scan', p.mriDone, 'Imaging Centre, Floor 2'], ['Report Ready', p.reportReady, 'Diagnostic report'], ['Doctor Review', p.reviewDone, 'Dr. Mehta'],
]; const currentIndex = p.reviewDone ? -1 : steps.findIndex((s, i) => !s[1] && (i === 0 || steps[i - 1][1])); return <main className="dashboard">
  <div className="page-heading"><div><div className="eyebrow">PATIENT PORTAL</div><h2>Good Morning, Rahul <span>👋</span></h2><p>Dr. Mehta · Appointment at 10:30 AM</p></div><div className={'status-pill ' + (p.reviewDone ? 'success' : '')}>{p.reviewDone ? '✓ Journey Completed' : '● Today’s appointment'}</div></div>
  {p.journeyGenerated && !p.reviewDone && <section className="recommendation"><div className="sparkle">✦</div><div><span>SMART RECOMMENDATION</span><h3>{p.bloodDone ? (p.mriDone ? 'Your report is being prepared' : 'Next: MRI Scan') : 'Blood Test → MRI Scan'}</h3><p>{p.bloodDone ? 'Your Blood Test is complete. Please proceed to the MRI scan.' : 'Blood Test has the shorter wait and can be completed before your MRI slot.'}</p></div><b>{p.bloodDone ? '11:15 AM' : '10:42 AM'}</b></section>}
  {p.reviewDone ? <section className="completion"><div>✓</div><h2>Journey Completed</h2><p>Rahul’s consultation, tests, report and doctor review are complete.</p></section> : <div className="patient-grid"><section className="card status-card"><div className="card-label">CURRENT STATUS</div><h3>{p.consultation === 'waiting' ? 'Waiting for doctor' : p.consultation === 'started' ? 'Consultation in progress' : p.nextStep}</h3><p>{p.journeyGenerated ? 'Your journey is actively coordinated.' : 'Please proceed to the doctor consultation.'}</p><div className="next-box"><span>NEXT STEP</span><b>{p.nextStep}</b>{p.journeyGenerated && !p.bloodDone && <small>{p.currentQueue.wait} min estimated wait · {p.currentQueue.waiting} people ahead</small>}</div>{p.journeyGenerated && !p.bloodDone && <button className="primary full" onClick={p.completeBlood}>Mark Blood Test Complete</button>}{p.bloodDone && !p.mriDone && <button className="primary full" onClick={p.completeMri}>Mark MRI Complete</button>}</section>
    <section className="card timeline-card"><div className="card-label">YOUR JOURNEY TIMELINE</div><div className="timeline">{steps.map((s, i) => <div className={'timeline-item ' + (s[1] ? 'done' : i === currentIndex ? 'current' : '')} key={s[0]}><div className="dot">{s[1] ? '✓' : i === currentIndex ? '●' : '○'}</div><div><b>{s[0]}</b><span>{s[2]}</span></div></div>)}</div></section></div>}
  {p.journeyGenerated && !p.reviewDone && <div className="lower-grid"><section className="card break-card"><div className="card-label">FLEXIBLE WAITING</div><h3>Need a break?</h3><p>{p.breakMessage || 'You have approximately 25 minutes of free time before your next scheduled step.'}</p><button className="secondary" onClick={() => p.setBreakMessage('30 minute break requested. Your MRI slot remains 11:15 AM.')}>Take 30 min break</button><button className="secondary" onClick={() => p.setBreakMessage('Break requested. Your next available MRI slot has been recalculated to 12:20 PM.')}>Take 1 hour break</button></section><Assistant reply={p.assistantReply} setReply={p.setAssistantReply} /></div>}
</main> }

function Assistant({ reply, setReply }) { return <section className="card assistant"><div className="assistant-title"><span>✦</span><div><b>CareFlow Assistant</b><small>Journey help, not medical advice</small></div></div><div className="assistant-reply">{reply}</div><div className="question-list">{Object.keys(questions).map(q => <button key={q} onClick={() => setReply(questions[q])}>{q}</button>)}</div></section> }

function Doctor(p) { return <main className="dashboard"><div className="page-heading"><div><div className="eyebrow">CLINICIAN WORKSPACE</div><h2>Dr. Mehta's Dashboard</h2><p>Monday · 3 patients scheduled today</p></div><div className="status-pill">● Clinic open</div></div><div className="doctor-grid"><section className="card patients"><div className="card-label">TODAY'S PATIENTS</div>{[['Rahul Sharma','10:30 AM'],['Priya Kumar','10:45 AM'],['Arjun Rao','11:00 AM']].map((a,i) => <div className={'patient-row '+(i===0?'selected':'')} key={a[0]}><div className="avatar">{a[0][0]}</div><div><b>{a[0]}</b><span>{a[1]}</span></div><em>{i === 0 ? (p.reviewDone ? 'Completed' : p.consultation === 'waiting' ? 'Waiting' : 'In progress') : 'Waiting'}</em></div>)}</section><section className="card doctor-action"><div className="card-label">PATIENT: RAHUL SHARMA</div>{p.consultation === 'waiting' && <><h3>Ready for consultation</h3><p>Appointment confirmed for 10:30 AM.</p><button className="primary" onClick={() => p.setConsultation('started')}>Start Consultation</button></>}{p.consultation === 'started' && <><h3>Consultation in progress</h3><p>Complete the consultation to select diagnostic tests.</p><button className="primary" onClick={() => p.setConsultation('completed')}>Complete Consultation</button></>}{p.consultation === 'completed' && !p.journeyGenerated && <><h3>Order Tests</h3><label className="check"><input type="checkbox" defaultChecked /> Blood Test</label><label className="check"><input type="checkbox" defaultChecked /> MRI Scan</label><button className="primary" onClick={() => p.setJourneyGenerated(true)}>Generate Patient Journey</button></>}{p.journeyGenerated && !p.mriDone && <Recommendation recommendation={p.recommendation} />}{p.mriDone && !p.reportReady && <><h3>MRI completed</h3><p>The diagnostic team can now publish the report.</p><button className="primary" onClick={() => p.setReportReady(true)}>Mark MRI Report Ready</button></>}{p.reportReady && !p.reviewDone && <><div className="report-ready">✓ MRI REPORT READY</div><h3>Rahul Sharma is ready for doctor review.</h3><button className="primary" onClick={() => p.setReviewDone(true)}>Complete Review</button></>}{p.reviewDone && <div className="completion small"><div>✓</div><h2>Review Complete</h2><p>Rahul's patient journey has been completed successfully.</p></div>}</section></div></main> }

function Recommendation({ recommendation }) { return <div className="recommendation doctor-rec"><div className="sparkle">✦</div><div><span>JOURNEY OPTIMIZED</span><h3>{recommendation}</h3><p>Blood Test: 10:42 AM · MRI: 11:15 AM · Doctor Review: 12:00 PM</p><b>Estimated total journey: ~90 min</b></div></div> }

function Queues({ queues, serve }) { return <main className="dashboard"><div className="page-heading"><div><div className="eyebrow">OPERATIONS VIEW</div><h2>Diagnostic Queues</h2><p>Simulated live capacity across diagnostic services</p></div><div className="status-pill success">● All services open</div></div><div className="queue-grid">{Object.entries(queues).map(([key,q]) => <section className="card queue-card" key={key}><div className="queue-icon">{q.icon}</div><div><div className="card-label">DIAGNOSTIC SERVICE</div><h3>{q.name}</h3></div><div className="open">● Open</div><div className="queue-metrics"><div><b>{q.waiting}</b><span>People waiting</span></div><div><b>{q.wait} <small>min</small></b><span>Estimated wait</span></div><div><b>{q.time}</b><span>Next available</span></div></div><button className="primary full" onClick={() => serve(key)}>Serve Next</button></section>)}</div></main> }

export default App
