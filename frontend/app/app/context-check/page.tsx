import Link from 'next/link'

const rows = [['Service', 'Payment Service', 'Analytics Service'], ['Workload', 'Transactional', 'Read-heavy'], ['Schema', 'PostgreSQL selected', 'Flexible schema'], ['Consistency', 'Strong required', 'Strong not required']]

export default function ContextCheck() {
  return <main className="workspace-shell context-page"><aside className="context-side"><Link href="/" className="wordmark">RECALL</Link><Link href="/app" className="back-link">← Back to investigator</Link></aside><section className="context-main"><header className="workspace-topbar"><span>NovaPay / Context check</span><Link href="/">Home</Link></header><div className="context-content"><p className="workspace-eyebrow">Context check</p><h1>Compare history with the situation now.</h1><div className="context-banner"><strong>Historical evidence found, but the current context is different.</strong><span>The old decision informs the review; it doesn&apos;t settle it.</span></div><div className="comparison"><div className="comparison-head"><h2>From memory</h2><h2>Current situation</h2></div>{rows.map(([label, memory, current], index) => <div className={`comparison-row ${index === 0 || index === 2 || index === 3 ? 'mismatch' : ''}`} key={label}><span>{label}</span><p>{memory}</p><p>{current}</p></div>)}</div></div></section></main>
}
