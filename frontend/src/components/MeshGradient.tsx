import { motion } from 'framer-motion';

export default function MeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F7F6F2] pointer-events-none">
      
      {/* Orb 1: Top Left - Primary Navy */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-15"
        style={{ backgroundColor: '#0A1E3D' }}
      />

      {/* Orb 2: Bottom Right - Accent Gold */}
      <motion.div
        animate={{
          x: [0, -150, 50, 0],
          y: [0, -100, -50, 0],
          scale: [1, 1.1, 1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-30"
        style={{ backgroundColor: '#C8A46B' }}
      />

      {/* Orb 3: Center - Deep Gold */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
          scale: [0.8, 1.3, 0.8, 0.8],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"
        style={{ backgroundColor: '#A88245' }}
      />

      {/* Noise Texture Overlay for that earthy paper feel */}
      <div 
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
    </div>
  );
}
