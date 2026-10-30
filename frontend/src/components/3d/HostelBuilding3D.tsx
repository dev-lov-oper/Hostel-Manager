import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HostelBuilding3DProps {
  onFloorSelect?: (floor: number) => void;
  selectedFloor?: number | null;
  interactive?: boolean;
}

export const HostelBuilding3D: React.FC<HostelBuilding3DProps> = ({
  onFloorSelect,
  selectedFloor = null,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFloorHover, setActiveFloorHover] = useState<number | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080b11, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(14, 12, 16);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 1.8);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const violetLight = new THREE.DirectionalLight(0x8b5cf6, 1.6);
    violetLight.position.set(-15, 18, -10);
    scene.add(violetLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 25);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Root Group
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    // Campus Base Ground Plane with grid texture
    const groundGeo = new THREE.CylinderGeometry(14, 14, 0.4, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    buildingGroup.add(ground);

    // Glowing base ring
    const ringGeo = new THREE.RingGeometry(12, 12.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    buildingGroup.add(ring);

    // Building Floors (4 levels)
    const floorMeshes: THREE.Mesh[] = [];
    const floorCount = 4;
    const floorHeight = 1.6;
    const buildingWidth = 7;
    const buildingDepth = 7;

    for (let i = 0; i < floorCount; i++) {
      const y = i * (floorHeight + 0.15) + 0.8;
      const floorGroup = new THREE.Group();
      floorGroup.userData = { floorNumber: i + 1 };

      // Concrete slab
      const slabGeo = new THREE.BoxGeometry(buildingWidth + 0.5, 0.2, buildingDepth + 0.5);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.5,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = y - floorHeight / 2;
      floorGroup.add(slab);

      // Glass core
      const floorGeo = new THREE.BoxGeometry(buildingWidth, floorHeight, buildingDepth);
      const floorMat = new THREE.MeshPhysicalMaterial({
        color: i % 2 === 0 ? 0x0284c7 : 0x7c3aed,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.6,
        ior: 1.5,
        thickness: 0.5,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.y = y;
      floorMesh.userData = { floorNumber: i + 1 };
      floorGroup.add(floorMesh);
      floorMeshes.push(floorMesh);

      // Interior glowing rooms blocks
      const roomColors = [0x06b6d4, 0x8b5cf6, 0x10b981, 0x38bdf8];
      const offsets = [
        [-1.8, -1.8], [1.8, -1.8],
        [-1.8, 1.8], [1.8, 1.8],
      ];
      offsets.forEach((pos, roomIdx) => {
        const roomBox = new THREE.BoxGeometry(2.2, floorHeight * 0.75, 2.2);
        const roomMat = new THREE.MeshStandardMaterial({
          color: roomColors[(i + roomIdx) % roomColors.length],
          emissive: roomColors[(i + roomIdx) % roomColors.length],
          emissiveIntensity: 0.3,
          roughness: 0.3,
        });
        const roomMesh = new THREE.Mesh(roomBox, roomMat);
        roomMesh.position.set(pos[0], y, pos[1]);
        floorGroup.add(roomMesh);
      });

      // Exterior structural pillars
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, floorHeight, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const cornerPositions = [
        [-buildingWidth / 2, y, -buildingDepth / 2],
        [buildingWidth / 2, y, -buildingDepth / 2],
        [-buildingWidth / 2, y, buildingDepth / 2],
        [buildingWidth / 2, y, buildingDepth / 2],
      ];
      cornerPositions.forEach(([px, py, pz]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, py, pz);
        floorGroup.add(pillar);
      });

      buildingGroup.add(floorGroup);
    }

    // Terrace Roof Structure
    const roofY = floorCount * (floorHeight + 0.15) + 0.8;
    const roofGeo = new THREE.BoxGeometry(buildingWidth + 0.6, 0.25, buildingDepth + 0.6);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = roofY;
    buildingGroup.add(roof);

    // Terrace Pergola / Solar Canopy
    const canopyGeo = new THREE.BoxGeometry(buildingWidth * 0.7, 0.1, buildingDepth * 0.7);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.8,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = roofY + 1.2;
    buildingGroup.add(canopy);

    // Raycaster for floor selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floorMeshes);
      if (intersects.length > 0) {
        const floorNum = intersects[0].object.userData.floorNumber;
        setActiveFloorHover(floorNum);
      } else {
        setActiveFloorHover(null);
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!interactive) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floorMeshes);
      if (intersects.length > 0) {
        const floorNum = intersects[0].object.userData.floorNumber;
        if (onFloorSelect) onFloorSelect(floorNum);
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // Mouse Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      setIsRotating(false);
    };
    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => setIsRotating(true), 3000);
    };
    const onMouseMoveDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      buildingGroup.rotation.y += deltaX * 0.008;
      prevMouseX = e.clientX;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMoveDrag);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto rotation
      if (isRotating) {
        buildingGroup.rotation.y += 0.004;
      }

      // Floating canopy animation
      canopy.position.y = roofY + 1.2 + Math.sin(elapsedTime * 1.5) * 0.08;

      // Highlight selected or hovered floor
      floorMeshes.forEach((mesh) => {
        const fNum = mesh.userData.floorNumber;
        const isSelected = selectedFloor === fNum;
        const isHovered = activeFloorHover === fNum;
        const mat = mesh.material as THREE.MeshPhysicalMaterial;

        if (isSelected) {
          mat.opacity = 0.8;
          mat.color.setHex(0x06b6d4);
        } else if (isHovered) {
          mat.opacity = 0.6;
          mat.color.setHex(0x8b5cf6);
        } else {
          mat.opacity = 0.35;
          mat.color.setHex(fNum % 2 === 0 ? 0x0284c7 : 0x7c3aed);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMoveDrag);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedFloor, activeFloorHover, isRotating, interactive, onFloorSelect]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden glass-panel border border-white/10 group">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Badges */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          <span className="font-mono text-slate-200">Interactive 3D Hostel</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-400 font-mono">
          {activeFloorHover ? (
            <span className="text-brand-cyan">Floor {activeFloorHover} Hovered • Click to inspect</span>
          ) : selectedFloor ? (
            <span className="text-brand-sky">Floor {selectedFloor} Selected</span>
          ) : (
            <span>Drag to rotate • Click floor to inspect</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((f) => (
            <button
              key={f}
              onClick={() => onFloorSelect && onFloorSelect(f)}
              className={`pointer-events-auto w-7 h-7 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedFloor === f
                  ? 'bg-brand-cyan text-slate-900 shadow-glow-cyan font-bold'
                  : 'bg-white/[0.06] hover:bg-white/[0.15] text-slate-300'
              }`}
            >
              F{f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
