"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Center, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type HeroMode = "idle" | "dragging" | "settling";

type LuxenMarkStageProps = {
  interactive?: boolean;
  reducedMotion?: boolean;
  onInteractionChange?: (isActive: boolean) => void;
};

type DragState = {
  pointerId: number | null;
  lastX: number;
  lastY: number;
  lastMoveAt: number;
  userYaw: number;
  userPitch: number;
  yawVelocity: number;
  pitchVelocity: number;
  releaseAt: number;
  spinYaw: number;
  frozenPitchBase: number;
  frozenRollBase: number;
};

function LuxenMarkMeshes() {
  const svg = useLoader(SVGLoader, "/branding/luxen-mark.svg");

  const { geometries, materials } = useMemo(() => {
    const nextGeometries: THREE.ExtrudeGeometry[] = [];
    const palette = [
      "#43dcf8",
      "#47d4f9",
      "#50c5fb",
      "#5aaeff",
      "#648eff",
      "#6c74ff",
      "#668dff",
      "#8469ff",
      "#d24cf7"
    ];

    const nextMaterials = palette.map((hex) => {
      const faceColor = new THREE.Color(hex);
      const sideColor = faceColor.clone().multiplyScalar(0.48);

      return [
        new THREE.MeshPhysicalMaterial({
          color: faceColor,
          roughness: 0.28,
          metalness: 0.1,
          clearcoat: 0.45,
          clearcoatRoughness: 0.12,
          reflectivity: 0.42,
          emissive: faceColor.clone().multiplyScalar(0.1),
          side: THREE.DoubleSide
        }),
        new THREE.MeshStandardMaterial({
          color: sideColor,
          roughness: 0.68,
          metalness: 0.02,
          side: THREE.DoubleSide
        })
      ] as THREE.Material[];
    });

    svg.paths.forEach((path) => {
      SVGLoader.createShapes(path).forEach((shape) => {
        nextGeometries.push(
          new THREE.ExtrudeGeometry(shape, {
            depth: 5,
            curveSegments: 10,
            bevelEnabled: true,
            bevelThickness: 0.34,
            bevelSize: 0.34,
            bevelSegments: 2
          })
        );
      });
    });

    return { geometries: nextGeometries, materials: nextMaterials };
  }, [svg.paths]);

  useEffect(() => {
    return () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.flat().forEach((material) => material.dispose());
    };
  }, [geometries, materials]);

  return (
    <Center>
      <group scale={[0.0161, -0.0161, 0.0161]}>
        {geometries.map((geometry, index) => (
          <mesh
            key={index}
            castShadow
            receiveShadow
            geometry={geometry}
            material={materials[index] ?? materials[materials.length - 1]}
          />
        ))}
      </group>
    </Center>
  );
}

type SceneRigProps = {
  mode: HeroMode;
  reducedMotion: boolean;
  dragStateRef: MutableRefObject<DragState>;
};

function SceneRig({ mode, reducedMotion, dragStateRef }: SceneRigProps) {
  const markRef = useRef<THREE.Group | null>(null);
  const previousModeRef = useRef<HeroMode>("idle");
  const frozenPosition = useMemo(() => new THREE.Vector3(), []);
  const idlePosition = useMemo(() => new THREE.Vector3(), []);
  const { camera } = useThree();

  const defaultCamera = useMemo(() => new THREE.Vector3(0, 0.08, 7.55), []);

  useEffect(() => {
    camera.position.copy(defaultCamera);
  }, [camera, defaultCamera]);

  useFrame((state, delta) => {
    const mark = markRef.current;
    if (!mark) {
      return;
    }

    const dragState = dragStateRef.current;
    const cycle = state.clock.getElapsedTime();
    const idlePitchBase = reducedMotion ? 0.048 : 0.055 + 0.012 * Math.sin(cycle * 0.42);
    const idleRollBase = reducedMotion ? -0.016 : -0.015 + 0.008 * Math.cos(cycle * 0.38);

    if (reducedMotion) {
      idlePosition.set(-0.02, 0, 0);
    } else {
      idlePosition.set(-0.02, 0.006 * Math.sin(cycle * 0.55), 0);
    }

    if (mode === "dragging" && previousModeRef.current !== "dragging") {
      frozenPosition.copy(mark.position);
      dragState.frozenPitchBase = idlePitchBase;
      dragState.frozenRollBase = idleRollBase;
    }

    if (mode === "dragging") {
      dragState.yawVelocity = THREE.MathUtils.lerp(dragState.yawVelocity, 0, Math.min(0.28, delta * 10));
      dragState.pitchVelocity = THREE.MathUtils.lerp(dragState.pitchVelocity, 0, Math.min(0.28, delta * 10));
    } else if (mode === "settling") {
      dragState.spinYaw += delta * 0.18;
      dragState.userYaw += dragState.yawVelocity;
      dragState.userPitch = THREE.MathUtils.clamp(dragState.userPitch + dragState.pitchVelocity, -0.72, 0.72);
      dragState.yawVelocity *= Math.pow(0.9, delta * 60);
      dragState.pitchVelocity *= Math.pow(0.88, delta * 60);
    } else {
      dragState.spinYaw += delta * 0.18;
      dragState.yawVelocity = THREE.MathUtils.lerp(dragState.yawVelocity, 0, Math.min(0.12, delta * 4));
      dragState.pitchVelocity = THREE.MathUtils.lerp(dragState.pitchVelocity, 0, Math.min(0.12, delta * 4));
    }

    const targetPosition = mode === "idle" ? idlePosition : frozenPosition;
    const positionBlend = mode === "dragging" ? Math.min(0.26, delta * 12) : Math.min(0.1, delta * 4);

    mark.position.lerp(targetPosition, positionBlend);

    if (mode === "idle") {
      mark.rotation.x = THREE.MathUtils.lerp(
        mark.rotation.x,
        idlePitchBase + dragState.userPitch,
        Math.min(0.08, delta * 4)
      );
      mark.rotation.y = THREE.MathUtils.lerp(
        mark.rotation.y,
        0.14 + dragState.spinYaw + dragState.userYaw,
        Math.min(0.08, delta * 4)
      );
      mark.rotation.z = THREE.MathUtils.lerp(
        mark.rotation.z,
        idleRollBase - dragState.userYaw * 0.035,
        Math.min(0.08, delta * 4)
      );
    } else {
      const targetX = dragState.frozenPitchBase + dragState.userPitch;
      const targetY = 0.14 + dragState.spinYaw + dragState.userYaw;
      const targetZ = dragState.frozenRollBase - dragState.userYaw * 0.035;
      if (mode === "dragging") {
        mark.rotation.x = targetX;
        mark.rotation.y = targetY;
        mark.rotation.z = targetZ;
      } else {
        const response = Math.min(0.16, delta * 7);
        mark.rotation.x = THREE.MathUtils.lerp(mark.rotation.x, targetX, response);
        mark.rotation.y = THREE.MathUtils.lerp(mark.rotation.y, targetY, response);
        mark.rotation.z = THREE.MathUtils.lerp(mark.rotation.z, targetZ, response);
      }
    }

    if (mode === "settling" && Math.abs(dragState.yawVelocity) < 0.0003 && Math.abs(dragState.pitchVelocity) < 0.0003) {
      dragState.yawVelocity = 0;
      dragState.pitchVelocity = 0;
    }

    camera.position.lerp(defaultCamera, Math.min(0.08, delta * 2.8));
    previousModeRef.current = mode;
  });

  return (
    <>
      <ambientLight intensity={1.18} color="#fbfcff" />
      <directionalLight castShadow intensity={1.7} position={[3.3, 4.2, 7.4]} color="#ffffff" />
      <pointLight intensity={8.8} distance={11} color="#49def9" position={[-3.2, 1.8, 5.2]} />
      <pointLight intensity={7.4} distance={11} color="#d347ff" position={[3.9, -1.1, 5.1]} />
      <spotLight intensity={4.4} color="#96abd7" position={[0, 6.8, 8.4]} angle={0.42} penumbra={1} />

      <group ref={markRef}>
        <Suspense fallback={null}>
          <LuxenMarkMeshes />
        </Suspense>
      </group>

      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.18}
        scale={6.6}
        blur={2.5}
        far={3.6}
        color="#74839a"
      />
    </>
  );
}

export function LuxenMarkStage({
  interactive = true,
  reducedMotion = false,
  onInteractionChange
}: LuxenMarkStageProps) {
  const [mode, setMode] = useState<HeroMode>("idle");
  const dragStateRef = useRef<DragState>({
    pointerId: null,
    lastX: 0,
    lastY: 0,
    lastMoveAt: 0,
    userYaw: 0,
    userPitch: 0,
    yawVelocity: 0,
    pitchVelocity: 0,
    releaseAt: 0,
    spinYaw: 0,
    frozenPitchBase: 0.055,
    frozenRollBase: -0.015
  });
  const returnTimeoutRef = useRef<number | null>(null);

  const clearReturnTimer = () => {
    if (returnTimeoutRef.current !== null) {
      window.clearTimeout(returnTimeoutRef.current);
      returnTimeoutRef.current = null;
    }
  };

  const settleBack = () => {
    clearReturnTimer();
    dragStateRef.current.pointerId = null;
    dragStateRef.current.releaseAt = performance.now();
    setMode("settling");
    onInteractionChange?.(false);
    returnTimeoutRef.current = window.setTimeout(() => {
      setMode("idle");
    }, 1800);
  };

  useEffect(() => {
    return () => clearReturnTimer();
  }, []);

  return (
    <div
      className="luxen-hero__canvas"
      data-mode={mode}
      onPointerDown={(event) => {
        if (!interactive) {
          return;
        }

        clearReturnTimer();
        dragStateRef.current.pointerId = event.pointerId;
        dragStateRef.current.lastX = event.clientX;
        dragStateRef.current.lastY = event.clientY;
        dragStateRef.current.lastMoveAt = performance.now();
        dragStateRef.current.yawVelocity = 0;
        dragStateRef.current.pitchVelocity = 0;
        event.currentTarget.setPointerCapture(event.pointerId);
        setMode("dragging");
        onInteractionChange?.(true);
      }}
      onPointerMove={(event) => {
        const dragState = dragStateRef.current;
        if (!interactive || dragState.pointerId !== event.pointerId) {
          return;
        }

        const deltaX = event.clientX - dragState.lastX;
        const deltaY = event.clientY - dragState.lastY;
        const now = performance.now();
        const dt = Math.max(8, now - dragState.lastMoveAt);
        dragState.lastX = event.clientX;
        dragState.lastY = event.clientY;
        dragState.lastMoveAt = now;
        dragState.userYaw += deltaX * 0.0062;
        dragState.userPitch = THREE.MathUtils.clamp(dragState.userPitch + deltaY * 0.0048, -0.72, 0.72);
        dragState.yawVelocity = (deltaX * 0.001) / dt * 16;
        dragState.pitchVelocity = (deltaY * 0.0008) / dt * 16;
      }}
      onPointerUp={(event) => {
        const dragState = dragStateRef.current;
        if (!interactive || dragState.pointerId !== event.pointerId) {
          return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }

        settleBack();
      }}
      onPointerCancel={(event) => {
        const dragState = dragStateRef.current;
        if (!interactive || dragState.pointerId !== event.pointerId) {
          return;
        }

        settleBack();
      }}
      onLostPointerCapture={() => {
        if (mode === "dragging") {
          settleBack();
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      role="presentation"
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.12, 7.2], fov: 26 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <SceneRig mode={mode} reducedMotion={reducedMotion} dragStateRef={dragStateRef} />
      </Canvas>
    </div>
  );
}
