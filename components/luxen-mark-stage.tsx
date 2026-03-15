"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Center, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

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
  yawVelocity: number;
  pitchVelocity: number;
  orientation: THREE.Quaternion;
};

const LOGO_IMAGE_SIZE = 500;
const LOGO_EXTRUDE_DEPTH = 10;
const LOGO_SCALE = 0.024;
const LOGO_SHAPES = [
  [
    [247, 156],
    [252, 157],
    [252, 172],
    [234, 188],
    [228, 187],
    [222, 183],
    [221, 178]
  ],
  [
    [261, 165],
    [276, 177],
    [276, 264],
    [239, 297],
    [233, 299],
    [233, 281],
    [261, 259],
    [261, 250],
    [251, 258],
    [236, 271],
    [232, 271],
    [197, 242],
    [197, 225],
    [203, 227],
    [232, 253],
    [259, 233]
  ],
  [
    [250, 182],
    [252, 201],
    [233, 217],
    [216, 204],
    [213, 202],
    [213, 186],
    [217, 186],
    [232, 198]
  ],
  [
    [286, 188],
    [290, 188],
    [301, 198],
    [301, 272],
    [242, 321],
    [233, 327],
    [233, 309],
    [286, 265]
  ],
  [
    [197, 198],
    [202, 199],
    [231, 225],
    [252, 210],
    [253, 227],
    [231, 244],
    [197, 215]
  ],
  [
    [298, 282],
    [301, 282],
    [301, 300],
    [250, 344],
    [247, 326]
  ]
] as const;
const WORLD_Y = new THREE.Vector3(0, 1, 0);
const LOCAL_X = new THREE.Vector3(1, 0, 0);
const TEMP_WORLD_ROTATION = new THREE.Quaternion();
const TEMP_LOCAL_ROTATION = new THREE.Quaternion();

function createDefaultOrientation() {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0.34, -0.02));
}

function applyWorldRotation(target: THREE.Quaternion, angle: number, axis: THREE.Vector3) {
  TEMP_WORLD_ROTATION.setFromAxisAngle(axis, angle);
  target.premultiply(TEMP_WORLD_ROTATION).normalize();
}

function applyLocalRotation(target: THREE.Quaternion, angle: number, axis: THREE.Vector3) {
  TEMP_LOCAL_ROTATION.setFromAxisAngle(axis, angle);
  target.multiply(TEMP_LOCAL_ROTATION).normalize();
}

function buildShapeGeometry(points: readonly (readonly [number, number])[]) {
  const shape = new THREE.Shape();

  points.forEach(([x, y], index) => {
    const py = -y;
    if (index === 0) {
      shape.moveTo(x, py);
    } else {
      shape.lineTo(x, py);
    }
  });
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: LOGO_EXTRUDE_DEPTH,
    curveSegments: 1,
    bevelEnabled: false
  });

  geometry.translate(0, 0, -LOGO_EXTRUDE_DEPTH / 2);

  const positions = geometry.attributes.position;
  const uv = new Float32Array(positions.count * 2);

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    uv[index * 2] = x / LOGO_IMAGE_SIZE;
    uv[index * 2 + 1] = 1 + y / LOGO_IMAGE_SIZE;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.computeVertexNormals();

  return geometry;
}

function LuxenMarkMeshes({ reducedMotion }: { reducedMotion: boolean }) {
  const texture = useLoader(THREE.TextureLoader, "/branding/luxen-mark.png");
  const { gl } = useThree();

  const anisotropy = gl.capabilities.getMaxAnisotropy();
  const logoTexture = useMemo(() => {
    const next = texture.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.wrapS = THREE.ClampToEdgeWrapping;
    next.wrapT = THREE.ClampToEdgeWrapping;
    next.needsUpdate = true;
    return next;
  }, [texture]);
  const geometries = useMemo(() => LOGO_SHAPES.map((shape) => buildShapeGeometry(shape)), []);

  useEffect(() => {
    logoTexture.anisotropy = Math.min(8, anisotropy);
    logoTexture.needsUpdate = true;
  }, [anisotropy, logoTexture]);

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: logoTexture,
        alphaMap: logoTexture,
        transparent: true,
        alphaTest: 0.06,
        roughness: 0.36,
        metalness: 0.02,
        emissive: new THREE.Color("#0e1522"),
        emissiveIntensity: reducedMotion ? 0.08 : 0.12
      }),
    [logoTexture, reducedMotion]
  );

  const sideMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#243148"),
        roughness: 0.74,
        metalness: 0.02,
        emissive: new THREE.Color("#111827"),
        emissiveIntensity: 0.06
      }),
    []
  );

  useEffect(() => {
    return () => {
      logoTexture.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      frontMaterial.dispose();
      sideMaterial.dispose();
    };
  }, [frontMaterial, geometries, logoTexture, sideMaterial]);

  return (
    <Center>
      <group scale={[LOGO_SCALE, LOGO_SCALE, LOGO_SCALE]}>
        {geometries.map((geometry, index) => (
          <mesh key={index} geometry={geometry} material={[frontMaterial, sideMaterial]} castShadow receiveShadow />
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
  const { camera } = useThree();
  const idleSpin = reducedMotion ? 0 : 0.28;
  const defaultCamera = useMemo(() => new THREE.Vector3(0, 0.1, 8.7), []);

  useEffect(() => {
    camera.position.copy(defaultCamera);
  }, [camera, defaultCamera]);

  useFrame((state, delta) => {
    const mark = markRef.current;
    if (!mark) {
      return;
    }

    const dragState = dragStateRef.current;

    if (mode === "settling") {
      applyWorldRotation(dragState.orientation, (idleSpin + dragState.yawVelocity) * delta, WORLD_Y);
      applyLocalRotation(dragState.orientation, dragState.pitchVelocity * delta, LOCAL_X);
      dragState.yawVelocity *= Math.exp(-3.6 * delta);
      dragState.pitchVelocity *= Math.exp(-4.2 * delta);
    } else if (mode === "idle" && !reducedMotion) {
      applyWorldRotation(dragState.orientation, idleSpin * delta, WORLD_Y);
      applyLocalRotation(dragState.orientation, 0.016 * Math.sin(state.clock.elapsedTime * 0.75) * delta, LOCAL_X);
    }

    mark.quaternion.copy(dragState.orientation);
    camera.position.lerp(defaultCamera, Math.min(0.1, delta * 3));
  });

  return (
    <>
      <ambientLight intensity={1.34} color="#ffffff" />
      <directionalLight castShadow intensity={1.05} color="#ffffff" position={[4.2, 5, 8.5]} />
      <pointLight intensity={0.7} distance={9} color="#6ccfff" position={[-3.4, 1.6, 4.8]} />
      <pointLight intensity={0.55} distance={8} color="#d56cff" position={[3.1, -0.9, 4.4]} />

      <group ref={markRef}>
        <Suspense fallback={null}>
          <LuxenMarkMeshes reducedMotion={reducedMotion} />
        </Suspense>
      </group>

      <ContactShadows
        position={[0, -2.7, 0]}
        opacity={0.12}
        scale={6.4}
        blur={2.8}
        far={4}
        color="#7a879c"
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
    yawVelocity: 0,
    pitchVelocity: 0,
    orientation: createDefaultOrientation()
  });
  const settleTimerRef = useRef<number | null>(null);

  const clearSettleTimer = () => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  };

  const enterIdle = () => {
    clearSettleTimer();
    settleTimerRef.current = window.setTimeout(() => setMode("idle"), 950);
  };

  const finishDrag = () => {
    clearSettleTimer();
    dragStateRef.current.pointerId = null;
    setMode("settling");
    onInteractionChange?.(false);
    enterIdle();
  };

  useEffect(() => {
    return () => clearSettleTimer();
  }, []);

  return (
    <div
      className="luxen-hero__canvas"
      data-mode={mode}
      onPointerDown={(event) => {
        if (!interactive) {
          return;
        }

        clearSettleTimer();
        const dragState = dragStateRef.current;
        dragState.pointerId = event.pointerId;
        dragState.lastX = event.clientX;
        dragState.lastY = event.clientY;
        dragState.lastMoveAt = performance.now();
        dragState.yawVelocity = 0;
        dragState.pitchVelocity = 0;
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
        const dt = Math.max(16, now - dragState.lastMoveAt) / 1000;
        dragState.lastX = event.clientX;
        dragState.lastY = event.clientY;
        dragState.lastMoveAt = now;

        applyWorldRotation(dragState.orientation, deltaX * 0.0105, WORLD_Y);
        applyLocalRotation(dragState.orientation, deltaY * 0.0092, LOCAL_X);

        dragState.yawVelocity = THREE.MathUtils.clamp((deltaX * 0.0105) / dt, -1.75, 1.75);
        dragState.pitchVelocity = THREE.MathUtils.clamp((deltaY * 0.0092) / dt, -1.35, 1.35);
      }}
      onPointerUp={(event) => {
        const dragState = dragStateRef.current;
        if (!interactive || dragState.pointerId !== event.pointerId) {
          return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }

        finishDrag();
      }}
      onPointerCancel={(event) => {
        const dragState = dragStateRef.current;
        if (!interactive || dragState.pointerId !== event.pointerId) {
          return;
        }

        finishDrag();
      }}
      onLostPointerCapture={() => {
        if (mode === "dragging") {
          finishDrag();
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      role="presentation"
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.1, 8.7], fov: 28 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <SceneRig mode={mode} reducedMotion={reducedMotion} dragStateRef={dragStateRef} />
      </Canvas>
    </div>
  );
}
