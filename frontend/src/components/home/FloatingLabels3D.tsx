import React from "react";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";

const Label = ({ position, title, value, delay }: { position: [number, number, number], title: string, value: string, delay: number }) => {
  return (
    <Html position={position} center className="pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-green-500/30 whitespace-nowrap"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-medium text-white/70">{title}:</span>
        <span className="text-xs font-bold text-white">{value}</span>
      </motion.div>
    </Html>
  );
};

const FloatingLabels3D = () => {
  return (
    <group>
      <Label position={[-3, 2, 0]} title="Humidity" value="78%" delay={1.2} />
      <Label position={[3, 1.5, 0]} title="Pest Risk" value="Low" delay={1.4} />
      <Label position={[-2.5, -1, 1]} title="Rain Chance" value="43%" delay={1.6} />
      <Label position={[2.5, -0.5, 1]} title="Soil Health" value="Good" delay={1.8} />
      
      <Html position={[0, -2.5, 2]} center className="pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] whitespace-nowrap"
        >
          <span className="text-xs font-bold tracking-widest text-green-300 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping absolute" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 relative" />
            AI Monitoring Active
          </span>
        </motion.div>
      </Html>
    </group>
  );
};

export default FloatingLabels3D;
