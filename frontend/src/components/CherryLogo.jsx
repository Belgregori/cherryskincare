function CherryLogo() {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="cherry-logo"
    >
      {/* Cereza izquierda - con gradiente suave */}
      <defs>
        <linearGradient id="cherryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C94A5A" stopOpacity="1" />
          <stop offset="100%" stopColor="#D16C7C" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      
      <circle 
        cx="14" 
        cy="20" 
        r="7.5" 
        fill="url(#cherryGradient)"
        className="cherry-left"
      />
      
      {/* Cereza derecha */}
      <circle 
        cx="26" 
        cy="20" 
        r="7.5" 
        fill="url(#cherryGradient)"
        className="cherry-right"
      />
      
      {/* Tallo fino y suave */}
      <path 
        d="M 20 6 Q 18 4 16 6 Q 14 8 16 10" 
        stroke="#7A8F6A" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        className="cherry-stem"
        opacity="0.8"
      />
      
      {/* Hoja pequeña y delicada */}
      <ellipse 
        cx="17" 
        cy="8" 
        rx="2.5" 
        ry="1.5" 
        fill="#7A8F6A" 
        opacity="0.5"
        className="cherry-leaf"
      />
    </svg>
  );
}

export default CherryLogo;

