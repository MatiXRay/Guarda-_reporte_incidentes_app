export function GuardaLogo({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="70 0 610 400"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <style>{`
          @keyframes flash {
            0%, 45%, 55%, 100% { opacity: 1; }
            48%, 52% { opacity: 0.2; }
          }
          @keyframes beam-left {
            0%, 100% { opacity: 0.9; transform: rotate(-30deg); }
            50% { opacity: 0.2; transform: rotate(-55deg); }
          }
          @keyframes beam-right {
            0%, 100% { opacity: 0.2; transform: rotate(30deg); }
            50% { opacity: 0.9; transform: rotate(55deg); }
          }
          @keyframes wave1 { 0% { r:30; opacity:.6 } 100% { r:75;  opacity:0 } }
          @keyframes wave2 { 0% { r:30; opacity:.4 } 100% { r:90;  opacity:0 } }
          @keyframes wave3 { 0% { r:30; opacity:.2 } 100% { r:105; opacity:0 } }
          @keyframes bar-blink { 0%,100% { opacity:1 } 50% { opacity:.3 } }
          @keyframes text-in {
            0%   { opacity:0; transform:translateX(-10px) }
            100% { opacity:1; transform:translateX(0) }
          }

          .g-wave1 { animation: wave1 1.8s ease-out infinite; fill:none; stroke:#EF9F27; stroke-width:2; }
          .g-wave2 { animation: wave2 1.8s ease-out .3s infinite; fill:none; stroke:#EF9F27; stroke-width:1.5; }
          .g-wave3 { animation: wave3 1.8s ease-out .6s infinite; fill:none; stroke:#FAC775; stroke-width:1; }
          .g-beam-l { animation: beam-left  1.2s ease-in-out infinite; transform-origin: 200px 175px; }
          .g-beam-r { animation: beam-right 1.2s ease-in-out infinite; transform-origin: 200px 175px; }
          .g-bar1 { animation: bar-blink 1.2s ease-in-out infinite; }
          .g-bar2 { animation: bar-blink 1.2s ease-in-out .2s infinite; }
          .g-bar3 { animation: bar-blink 1.2s ease-in-out .4s infinite; }
          .g-text { animation: text-in 0.7s ease-out both; }
        `}</style>
            </defs>

            <circle className="g-wave1" cx="200" cy="175" r="30" />
            <circle className="g-wave2" cx="200" cy="175" r="30" />
            <circle className="g-wave3" cx="200" cy="175" r="30" />

            <rect x="162" y="220" width="76" height="14" rx="4" fill="#444441" />
            <rect x="152" y="232" width="96" height="10" rx="4" fill="#2C2C2A" />
            <rect x="168" y="185" width="64" height="40" rx="6" fill="#444441" />

            <g className="g-beam-l">
                <path d="M200 175 L155 130 L170 120 Z" fill="#E24B4A" opacity="0.5" />
            </g>
            <g className="g-beam-r">
                <path d="M200 175 L245 130 L230 120 Z" fill="#E24B4A" opacity="0.5" />
            </g>

            <g className="g-siren-light">
                <circle cx="200" cy="175" r="28" fill="#E24B4A" />
                <circle cx="200" cy="175" r="20" fill="#F09595" />
                <circle cx="200" cy="175" r="12" fill="#FCEBEB" />
            </g>

            <rect className="g-bar1" x="240" y="215" width="8" height="20" rx="2" fill="#EF9F27" />
            <rect className="g-bar2" x="252" y="208" width="8" height="27" rx="2" fill="#EF9F27" />
            <rect className="g-bar3" x="264" y="200" width="8" height="35" rx="2" fill="#EF9F27" />

            <g className="g-text">
                <text
                    style={{ fontFamily: 'inherit', fontWeight: 500, fontSize: '80px', fill: '#FFFFFF' }}
                    x="300" y="195"
                    dominantBaseline="middle"
                >
                    Guarda!
                </text>
                <text
                    style={{ fontFamily: 'inherit', fontWeight: 400, fontSize: '22px', fill: 'rgba(255,255,255,0.65)', letterSpacing: '3px' }}
                    x="302" y="260"
                >
                    REPORTE CIUDADANO
                </text>
            </g>
        </svg>
    )
}