import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import FloatingLabels3D from "./FloatingLabels3D";

// A glowing abstract 'plant' structure
const HologramPlant = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[2, 2]} />
        <meshPhysicalMaterial 
          color="#10b981" 
          emissive="#059669"
          emissiveIntensity={0.5}
          wireframe={true}
          transparent
          opacity={0.8}
        />
        
        {/* Core glowing sphere */}
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial 
            color="#047857"
            emissive="#10b981"
            emissiveIntensity={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </mesh>
      
      {/* Surrounding Labels */}
      <FloatingLabels3D />
    </Float>
  );
};

// Data Particles
const Particles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate random particles
  const particles = new Float32Array(500 * 3);
  for (let i = 0; i < 500 * 3; i++) {
    particles[i] = (Math.random() - 0.5) * 20;
  }
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 1;
    }
  });

  return (
    <Points ref={pointsRef} positions={particles} stride={3}>
      <PointMaterial 
        transparent 
        color="#34d399" 
        size={0.05} 
        sizeAttenuation={true} 
        depthWrite={false}
      />
    </Points>
  );
};

const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none sm:pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#34d399" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#059669" />
        
        <HologramPlant />
        <Particles />
        
        <Environment preset="city" />
        <ContactShadows 
          position={[0, -3.5, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2.5} 
          far={4} 
          color="#064e3b"
        />
      </Canvas>
    </div>
  );
};

export default Hero3D;
