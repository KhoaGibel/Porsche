import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import './TrackMap.css';
 
// Simplified Nürburgring path (Nordschleife outline — stylized)
const TRACK_PATH = `
  M 400 80
  C 480 60, 560 80, 600 120
  C 640 160, 650 220, 630 270
  C 610 320, 560 350, 520 380
  C 480 410, 460 460, 470 510
  C 480 560, 520 590, 560 600
  C 600 610, 650 590, 680 560
  C 710 530, 720 480, 700 440
  C 680 400, 640 380, 620 350
  C 600 320, 610 280, 640 260
  C 670 240, 710 250, 730 280
  C 750 310, 740 360, 720 390
  C 700 420, 680 450, 680 490
  C 680 530, 700 560, 730 570
  C 760 580, 800 560, 820 530
  C 840 500, 840 450, 820 420
  C 800 390, 760 380, 740 350
  C 720 320, 720 270, 740 240
  C 760 210, 800 210, 830 230
  C 860 250, 870 290, 850 320
  C 830 350, 790 360, 770 390
  C 750 420, 760 470, 790 490
  C 820 510, 860 500, 880 470
  C 900 440, 890 390, 860 370
  C 830 350, 790 350, 770 320
  C 750 290, 760 240, 790 220
  C 820 200, 860 210, 880 240
  C 900 270, 890 320, 860 340
  C 830 360, 790 350, 770 370
  C 750 390, 760 440, 790 460
  C 820 480, 860 470, 880 440
  C 900 410, 880 360, 860 340
  C 840 320, 800 330, 780 360
  C 760 390, 770 440, 800 460
  C 540 520, 420 500, 380 460
  C 340 420, 340 360, 360 310
  C 380 260, 420 240, 440 200
  C 460 160, 440 110, 400 80
  Z
`;
 
const MILESTONES = [
  { pct: 0.05,  x: 400, y: 80,  label: 'Start', time: '0:00.000' },
  { pct: 0.2,   x: 640, y: 230, label: 'Hatzenbach', time: '0:52.3' },
  { pct: 0.4,   x: 690, y: 480, label: 'Flugplatz', time: '1:44.7' },
  { pct: 0.6,   x: 820, y: 440, label: 'Karussell', time: '2:38.1' },
  { pct: 0.85,  x: 860, y: 340, label: 'Brünnchen', time: '3:12.4' },
  { pct: 1.0,   x: 400, y: 80,  label: 'Finish', time: '6:49.3 🏆' },
];
 
export default function TrackMap() {
  const sectionRef = useRef(null);
  const pathRef    = useRef(null);
  const dotRef     = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [activeMilestone, setActiveMilestone] = useState(null);
  const isInView = useInView(sectionRef, { margin: '-20%' });
 
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
 
  // Xe chạy theo scroll
  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    setPathLength(len);
  }, []);
 
  // Update vị trí dot theo scroll
  useEffect(() => {
    if (!pathRef.current || !dotRef.current || pathLength === 0) return;
 
    const unsubscribe = scrollYProgress.on('change', (v) => {
      const point = pathRef.current.getPointAtLength(v * pathLength);
      dotRef.current.setAttribute('cx', point.x);
      dotRef.current.setAttribute('cy', point.y);
 
      // Check milestone gần nhất
      const nearest = MILESTONES.reduce((prev, curr) =>
        Math.abs(curr.pct - v) < Math.abs(prev.pct - v) ? curr : prev
      );
      if (Math.abs(nearest.pct - v) < 0.08) {
        setActiveMilestone(nearest);
      } else {
        setActiveMilestone(null);
      }
    });
 
    return unsubscribe;
  }, [pathLength, scrollYProgress]);
 
  return (
    <section ref={sectionRef} className="track-section">
      {/* Sticky content khi scroll */}
      <div className="track-sticky">
 
        {/* Left: Info */}
        <div className="track-info">
          <motion.p className="track-eyebrow"
            initial={{ opacity:0, x:-20 }}
            animate={isInView ? { opacity:1, x:0 } : {}}
            transition={{ duration:0.7 }}
          >
            Nürburgring Nordschleife
          </motion.p>
          <motion.h2 className="track-title"
            initial={{ opacity:0, x:-20 }}
            animate={isInView ? { opacity:1, x:0 } : {}}
            transition={{ duration:0.7, delay:0.1 }}
          >
            20.8 km<br />Đường đua<br />huyền thoại
          </motion.h2>
          <motion.div className="track-record"
            initial={{ opacity:0 }}
            animate={isInView ? { opacity:1 } : {}}
            transition={{ duration:0.8, delay:0.4 }}
          >
            <p className="track-record-label">Kỷ lục GT3 RS</p>
            <p className="track-record-time">6:49.328</p>
            <p className="track-record-sub">911 GT3 RS — 2022</p>
          </motion.div>
 
          {/* Milestone active */}
          {activeMilestone && (
            <motion.div className="track-milestone"
              key={activeMilestone.label}
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }}
              transition={{ duration:0.3 }}
            >
              <span className="track-milestone-dot" />
              <div>
                <p className="track-milestone-name">{activeMilestone.label}</p>
                <p className="track-milestone-time">{activeMilestone.time}</p>
              </div>
            </motion.div>
          )}
 
          <motion.p className="track-scroll-hint"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ↓ Cuộn để lái thử
          </motion.p>
        </div>
 
        {/* Right: SVG track */}
        <div className="track-svg-wrap">
          <svg
            viewBox="320 50 620 580"
            className="track-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Track glow */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="dotglow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
 
            {/* Track outline mờ */}
            <path
              d={TRACK_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
              strokeLinecap="round"
            />
 
            {/* Track progress — đỏ */}
            <path
              ref={pathRef}
              d={TRACK_PATH}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={0}
              style={{
                strokeDashoffset: useTransform(
                  scrollYProgress,
                  [0, 1],
                  [pathLength, 0]
                ),
              }}
              filter="url(#glow)"
            />
 
            {/* Milestone dots */}
            {MILESTONES.slice(0, -1).map((m, i) => (
              <circle key={i}
                cx={m.x} cy={m.y} r="4"
                fill="rgba(255,255,255,0.2)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
            ))}
 
            {/* Car dot */}
            <circle
              ref={dotRef}
              cx={400} cy={80} r="7"
              fill="#dc2626"
              filter="url(#dotglow)"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}