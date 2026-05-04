import { useState, useRef, useCallback } from 'react'
import './App.css'

const EMOTION_COLORS = {
  Happy:    '#FFD700',
  Sad:      '#6495ED',
  Angry:    '#FF6B6B',
  Fear:     '#9B59B6',
  Disgust:  '#2ECC71',
  Surprise: '#FF8C42',
  Neutral:  '#95A5A6',
}

const TECH_STACK = [
  { icon: '🧠', name: 'TensorFlow / Keras', desc: 'Deep learning model training & inference' },
  { icon: '⚡', name: 'FastAPI',             desc: 'High-performance Python REST backend'    },
  { icon: '⚛️', name: 'React + Vite',        desc: 'Lightning-fast modern frontend'          },
  { icon: '📷', name: 'OpenCV',              desc: 'Image preprocessing & face handling'     },
  { icon: '🔢', name: 'NumPy',               desc: 'Numerical computations & array ops'      },
  { icon: '🐍', name: 'Python',              desc: 'Core language powering the backend'      },
]

const FEATURES = [
  { icon: '😶', title: 'Expression Detection', desc: 'Classifies 7 emotions — Happy, Sad, Angry, Fear, Disgust, Surprise, Neutral — with full probability distribution.' },
  { icon: '🎂', title: 'Age Estimation',        desc: 'Predicts the estimated age of the person from the image using a dedicated regression output head.'               },
  { icon: '⚧',  title: 'Gender Prediction',     desc: 'Binary Male / Female classification with confidence score displayed on an interactive split bar.'               },
  { icon: '🚨', title: 'Suspicion Flagging',    desc: 'Composite score derived from multiple output heads to flag potentially suspicious or distressed behaviour.'     },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function App() {
  const [imageURL,  setImageURL]  = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [dragging,  setDragging]  = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImageURL(URL.createObjectURL(file))
    setImageFile(file)
    setResult(null)
    setError(null)
  }, [])

  const onInputChange = (e)  => handleFile(e.target.files[0])
  const onDrop        = (e)  => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }
  const onDragOver    = (e)  => { e.preventDefault(); setDragging(true) }
  const onDragLeave   = ()   => setDragging(false)

  const analyse = async () => {
    if (!imageFile) return
    setLoading(true); setError(null); setResult(null)
    const form = new FormData()
    form.append('file', imageFile)
    try {
      const res = await fetch('/predict', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || 'Server error')
      }
      setResult(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-logo">FaceAI</div>
        <div className="nav-links">
          <button onClick={() => scrollTo('about')}>About</button>
          <button onClick={() => scrollTo('tech')}>Technology</button>
          <button onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-cta" onClick={() => scrollTo('demo')}>Try Demo</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" id="home">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">AI-Powered Face Analysis</div>
          <h1 className="hero-title">
            Read Every<br />
            <span className="gradient-text">Face</span>
          </h1>
          <p className="hero-subtitle">
            Real-time expression, age, gender &amp; suspicion detection<br />
            powered by a custom multi-task deep learning model.
          </p>
          <button className="btn-hero" onClick={() => scrollTo('demo')}>
            Try It Now →
          </button>
        </div>
        <div className="scroll-hint" onClick={() => scrollTo('about')}>
          <span>Scroll</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ── About ── */}
      <section className="section" id="about">
        <div className="section-inner">
          <div className="section-tag">About</div>
          <h2 className="section-title">What is FaceAI?</h2>
          <p className="section-body">
            FaceAI is a multi-task deep learning system that simultaneously analyses facial
            images to detect emotion, estimate age, predict gender, and flag suspicious
            behaviour — all from a single neural network. Built with a custom CNN architecture
            trained on thousands of annotated face samples.
          </p>
          <div className="stat-row">
            <div className="stat"><span className="stat-num">7</span><span className="stat-label">Emotions</span></div>
            <div className="stat"><span className="stat-num">4</span><span className="stat-label">Output Heads</span></div>
            <div className="stat"><span className="stat-num">96×96</span><span className="stat-label">Input Size</span></div>
            <div className="stat"><span className="stat-num">M4</span><span className="stat-label">Model</span></div>
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      <section className="section alt" id="tech">
        <div className="section-inner">
          <div className="section-tag">Stack</div>
          <h2 className="section-title">Technology Used</h2>
          <div className="tech-grid">
            {TECH_STACK.map(t => (
              <div className="tech-card" key={t.name}>
                <div className="tech-icon">{t.icon}</div>
                <div className="tech-name">{t.name}</div>
                <div className="tech-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-tag">Capabilities</div>
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo ── */}
      <section className="section alt" id="demo">
        <div className="section-inner">
          <div className="section-tag">Live Demo</div>
          <h2 className="section-title">Try the Model</h2>
          <p className="section-body">Upload a face image and let the AI analyse it in real time.</p>

          <div className="demo-layout">

            <div className="upload-col">
              <div
                className={`drop-zone${dragging ? ' dragging' : ''}${imageURL ? ' has-image' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onInputChange}
                />
                {imageURL
                  ? <img src={imageURL} alt="uploaded face" className="preview-img" />
                  : (
                    <div className="drop-hint">
                      <span className="upload-arrow">↑</span>
                      <p>Drop image here</p>
                      <p className="small">or click to browse</p>
                    </div>
                  )
                }
              </div>

              <button className="btn-analyse" onClick={analyse} disabled={!imageFile || loading}>
                {loading ? <span className="spinner" /> : '⚡ Analyse Face'}
              </button>

              {error && <div className="error-box">⚠ {error}</div>}
            </div>

            {result && (
              <div className="results-col">
                <Results data={result} />
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>FaceAI — Built with React + FastAPI + Keras</p>
      </footer>
    </div>
  )
}

function Results({ data }) {
  return (
    <div className="cards">
      {data.expression  && <ExpressionCard expr={data.expression}   />}
      {data.age != null  && <AgeCard        age={data.age}           />}
      {data.gender       && <GenderCard     gender={data.gender}     />}
      {data.suspicion    && <SuspicionCard  susp={data.suspicion}    />}
    </div>
  )
}

function ExpressionCard({ expr }) {
  const color = EMOTION_COLORS[expr.label] ?? '#e0e3ff'
  const probs = Object.entries(expr.probabilities).sort((a, b) => b[1] - a[1])
  return (
    <div className="card">
      <div className="card-header" style={{ borderColor: color }}>
        <span className="card-icon">😶</span>
        <span className="card-title">Expression</span>
      </div>
      <div className="card-label" style={{ color }}>{expr.label}</div>
      <div className="card-sub">{(expr.confidence * 100).toFixed(1)}% confidence</div>
      <div className="bar-list">
        {probs.map(([emo, prob]) => (
          <div key={emo} className="bar-row">
            <span className="bar-name">{emo}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(prob * 100).toFixed(1)}%`, background: EMOTION_COLORS[emo] ?? '#888' }} />
            </div>
            <span className="bar-pct">{(prob * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgeCard({ age }) {
  return (
    <div className="card">
      <div className="card-header" style={{ borderColor: '#00d4ff' }}>
        <span className="card-icon">🎂</span>
        <span className="card-title">Estimated Age</span>
      </div>
      <div className="age-number">{Math.round(age)}</div>
      <div className="card-sub">years old</div>
    </div>
  )
}

function GenderCard({ gender }) {
  const isMale = gender.label === 'Male'
  const color  = isMale ? '#6fa3ef' : '#ef9fc4'
  return (
    <div className="card">
      <div className="card-header" style={{ borderColor: color }}>
        <span className="card-icon">{isMale ? '♂' : '♀'}</span>
        <span className="card-title">Gender</span>
      </div>
      <div className="card-label" style={{ color }}>{gender.label}</div>
      <div className="gender-bar-wrap">
        <span className="small">Male</span>
        <div className="gender-track">
          <div className="gender-fill male"   style={{ width: `${((1 - gender.raw) * 100).toFixed(0)}%` }} />
          <div className="gender-fill female" style={{ width: `${(gender.raw * 100).toFixed(0)}%`       }} />
        </div>
        <span className="small">Female</span>
      </div>
    </div>
  )
}

function SuspicionCard({ susp }) {
  const isSusp = susp.label === 'Suspicious'
  const pct    = (susp.score * 100).toFixed(1)
  const color  = isSusp ? '#FF6B6B' : '#2ECC71'
  return (
    <div className="card">
      <div className="card-header" style={{ borderColor: color }}>
        <span className="card-icon">{isSusp ? '🚨' : '✅'}</span>
        <span className="card-title">Suspicion</span>
      </div>
      <div className="card-label" style={{ color }}>{susp.label}</div>
      <div className="susp-track">
        <div className="susp-fill" style={{ width: `${pct}%`, background: color }} />
        <div className="susp-threshold" style={{ left: `${(susp.threshold * 100).toFixed(0)}%` }} title={`Threshold ${(susp.threshold * 100).toFixed(0)}%`} />
      </div>
      <div className="card-sub">Score: {pct}%</div>
    </div>
  )
}
