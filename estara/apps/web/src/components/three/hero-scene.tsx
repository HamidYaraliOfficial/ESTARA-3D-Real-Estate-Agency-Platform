"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * A lightweight, GPU-friendly city of boxes standing in for real buildings.
 * Height, color and position are procedurally generated once so the scene
 * stays cheap to render on low-end devices.
 */
function Building({
  position,
  height,
  color,
}: {
  position: [number, number, number];
  height: number;
  color: string;
}) {
  return (
    <mesh position={[position[0], height / 2, position[2]]} castShadow receiveShadow>
      <boxGeometry args={[0.8, height, 0.8]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </mesh>
  );
}

function CityGrid() {
  const buildings = useRef(
    Array.from({ length: 60 }, (_, i) => {
      const angle = (i / 60) * Math.PI * 2;
      const radius = 4 + (i % 5) * 1.6;
      return {
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [
          number,
          number,
          number,
        ],
        height: 0.8 + Math.random() * 3.4,
        color: i % 7 === 0 ? "#2563eb" : "#94a3b8",
      };
    }),
  ).current;

  return (
    <group>
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
    </group>
  );
}

/**
 * Reads document scroll progress (0 -> 1 across the hero section) and
 * animates the camera path with GSAP so movement stays smooth and
 * interruptible, rather than snapping frame-to-frame.
 */
function ScrollCameraRig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.2, 0));
  const smoothed = useRef({ y: 6, z: 14, tiltX: -0.35 });

  useFrame(() => {
    const p = progressRef.current;
    // Camera rises and pulls back as the user scrolls, then dives toward
    // street level — a simple three-keyframe path is enough to feel
    // cinematic without a full animation timeline library on the GPU side.
    const y = THREE.MathUtils.lerp(6, 1.6, p);
    const z = THREE.MathUtils.lerp(14, 4, p);
    const tiltX = THREE.MathUtils.lerp(-0.55, -0.08, p);

    smoothed.current.y = THREE.MathUtils.lerp(smoothed.current.y, y, 0.08);
    smoothed.current.z = THREE.MathUtils.lerp(smoothed.current.z, z, 0.08);
    smoothed.current.tiltX = THREE.MathUtils.lerp(smoothed.current.tiltX, tiltX, 0.08);

    camera.position.set(0, smoothed.current.y, smoothed.current.z);
    camera.rotation.x = smoothed.current.tiltX;
    camera.lookAt(target.current);
  });

  return null;
}

export function HeroScene() {
  const progressRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);

    if (mql.matches) return;

    const section = document.getElementById("hero-scroll-track");
    if (!section) return;

    const ctx = gsap.context(() => {
      const update = () => {
        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        progressRef.current = total > 0 ? scrolled / total : 0;
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
      return () => window.removeEventListener("scroll", update);
    });

    return () => ctx.revert();
  }, []);

  if (reducedMotion) {
    // Progressive enhancement: fall back to a static image-like gradient
    // instead of running the 3D scene on devices that asked for less motion.
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-accent/20 to-background" />
    );
  }

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 6, 14], fov: 45 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0b0f1a"]} />
      <fog attach="fog" args={["#0b0f1a", 8, 26]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <CityGrid />
      </Float>
      <Sparkles count={80} scale={12} size={2} speed={0.3} color="#93c5fd" />
      <Environment preset="city" />
      <ScrollCameraRig progressRef={progressRef} />
    </Canvas>
  );
}
