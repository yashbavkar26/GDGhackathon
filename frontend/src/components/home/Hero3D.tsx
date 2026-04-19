import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import FloatingLabels3D from "./FloatingLabels3D";

// Shared geometries for massive performance boost
const grainGeo = new THREE.CapsuleGeometry(0.05, 0.3, 4, 8);
const awnGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.8, 3);
awnGeo.translate(0, 0.4, 0); // Pivot at base

const leafGeo = new THREE.CylinderGeometry(0.01, 0.15, 2.5, 4);
leafGeo.translate(0, 1.25, 0); // Pivot at base

// Colors - Tuned for ultra-realistic golden wheat fields
const grainColor = new THREE.Color("#eab308");
const grainEmissive = new THREE.Color("#854d0e");
const activeGrainColor = new THREE.Color("#fef08a");
const activeGrainEmissive = new THREE.Color("#ca8a04");
const stemColor = new THREE.Color("#4caf50");
const stemEmissive = new THREE.Color("#1b5e20");

// Floating Dirt/Rock Base
const FloatingDirtBase = () => {
  const dirtGeo = useMemo(() => {
      // Create a wide, high-resolution cylinder (chunk of earth)
      const geometry = new THREE.CylinderGeometry(4.2, 3.5, 2.5, 128, 32, false);
      const positionAttribute = geometry.getAttribute('position');
      const vertex = new THREE.Vector3();
      
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        
        // Procedural rock/dirt noise synthesis
        const noiseX = Math.sin(vertex.x * 4) * Math.cos(vertex.y * 4) * Math.sin(vertex.z * 4) * 0.4;
        const noiseZ = Math.cos(vertex.x * 3) * Math.sin(vertex.y * 3) * 0.3;
        const jagged = (Math.random() - 0.5) * 0.3;

        vertex.x += noiseX + vertex.x * jagged;
        vertex.z += noiseZ + vertex.z * jagged;
        
        // Jagged uneven rocky bottom
        if (vertex.y < 0) {
           vertex.y -= Math.random() * 1.5; // Stalactite-like dirt clods pulling down
        } else {
           // Bumpy realistic top surface
           vertex.y += (Math.random() - 0.5) * 0.3;
        }
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      geometry.computeVertexNormals();
      return geometry;
  }, []);

  return (
    <group position={[0, -4.5, 0]}>
      {/* Main Core Chunk of Dirt / Rock */}
      <mesh geometry={dirtGeo} receiveShadow castShadow>
         <meshStandardMaterial color="#302013" roughness={1} metalness={0.05} />
      </mesh>
      
      {/* Top green lush layer overlapping the top edge */}
      <mesh geometry={dirtGeo} position={[0, 0.4, 0]} scale={[1.01, 0.35, 1.01]} receiveShadow>
         <meshStandardMaterial color="#2d4217" roughness={0.9} metalness={0.05} />
      </mesh>
    </group>
  );
};

// Procedural single wheat stalk with high density
const WheatStalk = ({ position, rotation, scale, delayVal }: { position: [number, number, number], rotation: [number, number, number], scale: number, delayVal: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Generate dense grains and awns (hairs)
  const { grains, awns } = useMemo(() => {
    const gArr = [];
    const aArr = [];
    const numGrains = 120; // Massive increase for density
    
    // Distribute grains along stem using a fibonacci-like spiral
    for (let i = 0; i < numGrains; i++) {
      const t = i / numGrains; // 0 to 1
      const y = t * 4; // Height of the head

      const angle = i * Math.PI * 0.85;

      // Make the crop cleaner at the bottom, bulky and rich at the top
      const bulge = Math.sin(t * Math.PI);
      const taper = Math.pow(t, 0.4); // Thins out the bottom significantly
      const radius = bulge * taper * 0.16 + 0.03;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Complex tilt: lean outwards, rotate tangent to the stem
      const rotX = Math.PI / 4;
      const rotY = -angle + Math.PI / 2;
      const rotZ = Math.PI / 6.5;

      gArr.push({ position: [x, y, z] as [number, number, number], rotation: [rotX, rotY, rotZ] as [number, number, number] });

      // Add awn (the thin spike extension of wheat)
      aArr.push({
        position: [x * 1.2, y + 0.1, z * 1.2] as [number, number, number],
        rotation: [rotX - 0.1, rotY, rotZ - 0.1] as [number, number, number]
      });
    }
    return { grains: gArr, awns: aArr };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime + delayVal;
      // Gentle wind sway applied per stalk
      groupRef.current.rotation.z = rotation[2] + Math.sin(time * 0.6) * 0.06;
      groupRef.current.rotation.x = rotation[0] + Math.cos(time * 0.4) * 0.04;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main Stem */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 5, 8]} />
        <meshPhysicalMaterial
          color={stemColor}
          emissive={stemEmissive}
          emissiveIntensity={0.2}
          roughness={0.6}
          metalness={0.1}
          clearcoat={0.3}
        />
      </mesh>

      {/* Wheat Broad Leaves */}
      <mesh position={[0, -3.5, 0]} rotation={[0, 0, -Math.PI/3.5]} geometry={leafGeo}>
        <meshPhysicalMaterial color={stemColor} emissive={stemEmissive} emissiveIntensity={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[0, -2.5, 0]} rotation={[Math.PI/4, 2, Math.PI/4]} geometry={leafGeo}>
        <meshPhysicalMaterial color={stemColor} emissive={stemEmissive} emissiveIntensity={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI/5, Math.PI, -Math.PI/5]} geometry={leafGeo}>
        <meshPhysicalMaterial color={stemColor} emissive={stemEmissive} emissiveIntensity={0.1} roughness={0.7} />
      </mesh>

      {/* Wheat Head Segment */}
      <group position={[0, -0.5, 0]}>
        {grains.map((g, i) => (
          <mesh
            key={`grain-${i}`}
            position={g.position}
            rotation={g.rotation}
            geometry={grainGeo}
          >
            <meshPhysicalMaterial
              color={hovered ? activeGrainColor : grainColor}
              emissive={hovered ? activeGrainEmissive : grainEmissive}
              emissiveIntensity={hovered ? 0.6 : 0.2}
              roughness={0.25}
              metalness={0.6}
              clearcoat={hovered ? 1 : 0.5}
            />
          </mesh>
        ))}

        {awns.map((a, i) => (
          <mesh
            key={`awn-${i}`}
            position={a.position}
            rotation={a.rotation}
            geometry={awnGeo}
          >
            <meshPhysicalMaterial
              color={hovered ? activeGrainColor : grainColor}
              emissive={hovered ? activeGrainEmissive : grainEmissive}
              emissiveIntensity={hovered ? 0.3 : 0.1}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* Dynamic hover illumination */}
      {hovered && (
        <pointLight position={[0, 1.5, 0]} distance={5} intensity={2} color="#fbbf24" />
      )}
    </group>
  );
};

// Continuous 360 Full Rotating Cluster built onto the rock
const RotatingCropSystem = () => {
  const clusterRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (clusterRef.current) {
      // 360 degrees continuous medium smooth rotation
      clusterRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={clusterRef}>
      {/* The Floating Rock Base */}
      <FloatingDirtBase />

      {/* The Wheat Planting */}
      <WheatStalk position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.95} delayVal={0} />
      <WheatStalk position={[0.45, -0.2, -0.4]} rotation={[0.15, 0, 0.25]} scale={0.72} delayVal={1.5} />
      <WheatStalk position={[-0.5, -0.1, 0.3]} rotation={[-0.1, 0, -0.2]} scale={0.78} delayVal={3.2} />

      {/* Soft spotlight green glow coming from inside the crop */}
      <pointLight position={[0, -2, 0]} distance={10} intensity={1} color="#10b981" />
    </group>
  );
};

// Global background particles floating everywhere randomly
const GlobalParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    // Huge particle count to fill entire view securely behind EVERYTHING
    const pos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000 * 3; i += 3) {
      // Massive space spreading everywhere independently
      pos[i] = (Math.random() - 0.5) * 140 - 20;   // X spread (shifted left)
      pos[i + 1] = (Math.random() - 0.5) * 100;    // Y spread
      pos[i + 2] = (Math.random() - 0.5) * 60 - 10; // Z spread (pushed to the background parallax layer)
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Faster medium-pace drifting
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.035;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.02;
      
      // Floating parallax relative to camera interaction
      pointsRef.current.position.x = state.pointer.x * 0.5;
      pointsRef.current.position.y = state.pointer.y * 0.5;
    }
  });

  return (
    <Points ref={pointsRef} positions={particles} stride={3}>
      <PointMaterial
        transparent
        // Bigger, bolder glowing molecules
        color="#e0fce9"
        size={0.25}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.6}
      />
    </Points>
  );
};

// Holographic bottom rings centered strictly natively
const HolographicRings = () => {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef1.current) ringRef1.current.rotation.z = t * 0.8;
    if (ringRef2.current) ringRef2.current.rotation.z = -t * 0.4;
  });

  return (
      // Adjusted lower holographic base explicitly directly underneath hanging dirt roots
      <group position={[0, -8.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef1}>
        <ringGeometry args={[4.2, 4.25, 64]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ringRef2} position={[0, 0, -0.05]}>
        <ringGeometry args={[3.2, 3.25, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.4} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[4.2, 64]} />
        <meshBasicMaterial color="#064e3b" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// Mouse camera Rig for slight depth/parallax response
const CameraRig = () => {
  useFrame((state) => {
    const targetX = state.pointer.x * 1.5;
    const targetY = state.pointer.y * 1.5;

    state.camera.position.x += (targetX - state.camera.position.x) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;
    state.camera.lookAt(2, 0, 0); 
  });
  return null;
};

const Hero3D = () => {
  return (
    // Absolute position container covers full screen naturally
    <div className="absolute inset-0 z-0 overflow-visible pointer-events-none sm:pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
        <CameraRig />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} intensity={1.5} color="#34d399" />
        <directionalLight position={[-10, -5, -5]} intensity={0.6} color="#022c22" />

        {/* Global background particles spanning everywhere safely under text elements */}
        <group position={[0,0,-4]}>
            <GlobalParticles />
        </group>

        {/* Center-Right Wheat Container aligned directly via 3D coordinates. Scaled to 0.85 and fixed at Y=0.4 to prevent top clipping while keeping base fully visible */}
        <group position={[3.5, 0.8, 0]} scale={0.75}>
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.6}>
            <RotatingCropSystem />
            <HolographicRings />
          </Float>
        </group>

        {/* Keeping labels floating around the entire setup exactly as they are */}
        <FloatingLabels3D />

        <Environment preset="night" />

        {/* Soft shadow bed underneath the entire floating island complex */}
        <ContactShadows
          position={[3.5, -4.5, 0]}
          opacity={0.8}
          scale={25}
          blur={2.5}
          far={6}
          color="#000000"
        />
      </Canvas>
    </div>
  );
};

export default Hero3D;
