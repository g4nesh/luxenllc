"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
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

const MARK_BOUNDS = {
  width: 104 / 500,
  height: 188 / 500,
  x: 197 / 500,
  y: 156 / 500
};

const MARK_ASPECT = 104 / 188;
const MARK_HEIGHT = 4.36;
const MARK_WIDTH = MARK_HEIGHT * MARK_ASPECT;
const DEPTH_LAYERS = [-0.08, -0.045, -0.02];
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

function CroppedMark({ reducedMotion }: { reducedMotion: boolean }) {
  const texture = useLoader(THREE.TextureLoader, "/branding/luxen-mark.png");
  const { gl } = useThree();

  const croppedTexture = useMemo(() => {
    const next = texture.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.wrapS = THREE.ClampToEdgeWrapping;
    next.wrapT = THREE.ClampToEdgeWrapping;
    next.repeat.set(MARK_BOUNDS.width, MARK_BOUNDS.height);
    next.offset.set(MARK_BOUNDS.x, 1 - MARK_BOUNDS.y - MARK_BOUNDS.height);
    next.needsUpdate = true;
    return next;
  }, [texture]);

  const plane = useMemo(() => new THREE.PlaneGeometry(MARK_WIDTH, MARK_HEIGHT), []);
  const shadowPlane = useMemo(() => new THREE.PlaneGeometry(MARK_WIDTH * 1.04, MARK_HEIGHT * 1.04), []);

  const anisotropy = gl.capabilities.getMaxAnisotropy();

  useEffect(() => {
    croppedTexture.anisotropy = Math.min(8, anisotropy);
    croppedTexture.needsUpdate = true;
  }, [anisotropy, croppedTexture]);

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: croppedTexture,
        alphaMap: croppedTexture,
        transparent: true,
        alphaTest: 0.06,
        depthWrite: false,
        toneMapped: false,
        side: THREE.FrontSide
      }),
    [croppedTexture]
  );

  const backMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: croppedTexture,
        alphaMap: croppedTexture,
        transparent: true,
        alphaTest: 0.06,
        depthWrite: false,
        opacity: reducedMotion ? 0.42 : 0.5,
        color: new THREE.Color("#43598f"),
        toneMapped: false,
        side: THREE.FrontSide
      }),
    [croppedTexture, reducedMotion]
  );

  const depthMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: croppedTexture,
        alphaMap: croppedTexture,
        transparent: true,
        alphaTest: 0.06,
        depthWrite: false,
        opacity: 0.14,
        color: new THREE.Color("#32486d"),
        toneMapped: false,
        side: THREE.DoubleSide
      }),
    [croppedTexture]
  );

  const shadowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: croppedTexture,
        alphaMap: croppedTexture,
        transparent: true,
        depthWrite: false,
        opacity: reducedMotion ? 0.035 : 0.06,
        color: new THREE.Color("#48639a"),
        toneMapped: false,
        side: THREE.DoubleSide
      }),
    [croppedTexture, reducedMotion]
  );

  useEffect(() => {
    return () => {
      plane.dispose();
      shadowPlane.dispose();
      croppedTexture.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      depthMaterial.dispose();
      shadowMaterial.dispose();
    };
  }, [backMaterial, croppedTexture, depthMaterial, frontMaterial, plane, shadowMaterial, shadowPlane]);

  return (
    <group position={[-0.22, 0.08, 0]}>
      <mesh geometry={shadowPlane} material={shadowMaterial} position={[0.05, -0.04, -0.18]} renderOrder={0} />

      {DEPTH_LAYERS.map((z, index) => (
        <mesh
          key={z}
          geometry={plane}
          material={depthMaterial}
          position={[0, 0, z]}
          renderOrder={1 + index}
        />
      ))}

      <mesh geometry={plane} material={backMaterial} position={[0, 0, -0.095]} rotation={[0, Math.PI, 0]} renderOrder={8} />
      <mesh geometry={plane} material={frontMaterial} position={[0, 0, 0.11]} renderOrder={9} />
    </group>
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
      <group ref={markRef}>
        <Suspense fallback={null}>
          <CroppedMark reducedMotion={reducedMotion} />
        </Suspense>
      </group>
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
