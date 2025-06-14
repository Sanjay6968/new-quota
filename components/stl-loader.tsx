import React, { ChangeEvent, DragEvent, useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls, useHelper } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { BufferGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import ModalSTLViewer from './ModalSTLViewer';
import Select from 'react-select';

export interface STLViewerProps {
  fileUrl: string | null;
  onDimensionsCalculated: (dimensions: string) => void;
  onVolumeCalculated: (volume: string) => void;
}

interface RotatingMeshProps {
  geometry: THREE.BufferGeometry;
}

const unitOptions = [
  { value: 'mm', label: 'Millimeters (mm)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'in', label: 'Inches (in)' }
];

const unitConversion = {
  mm: 1,
  cm: 0.1,
  in: 0.0393701
};

const RotatingMesh: React.FC<RotatingMeshProps> = ({ geometry }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // To rotate the model enable useFrame hook
  // useFrame(() => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.001;
  //   }
  // });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color={'lightgray'} roughness={0.45} />
    </mesh>
  );
};

const STLViewer: React.FC<STLViewerProps> = ({ fileUrl, onDimensionsCalculated, onVolumeCalculated }) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [unit, setUnit] = useState<'mm' | 'cm' | 'in'>('mm');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Volume Calculation Function
  const calcVolume = (geometry: THREE.BufferGeometry) => {
    let totalVolume = 0;
    const vertices = geometry.attributes.position.array;
    const faces = geometry.index ? geometry.index.array : null;

    const getVertex = (idx: number) => {
      return new THREE.Vector3(vertices[idx * 3], vertices[idx * 3 + 1], vertices[idx * 3 + 2]);
    };

    const len = faces ? faces.length : vertices.length / 3;
    for (let i = 0; i < len; i += 3) {
      const idxA = faces ? faces[i] : i;
      const idxB = faces ? faces[i + 1] : i + 1;
      const idxC = faces ? faces[i + 2] : i + 2;

      const a = getVertex(idxA);
      const b = getVertex(idxB);
      const c = getVertex(idxC);

      const v321 = c.x * b.y * a.z;
      const v231 = b.x * c.y * a.z;
      const v312 = c.x * a.y * b.z;
      const v132 = a.x * c.y * b.z;
      const v213 = b.x * a.y * c.z;
      const v123 = a.x * b.y * c.z;

      totalVolume += (-v321 + v231 + v312 - v132 - v213 + v123) / 6;
    }

    return Math.abs(totalVolume);
  };

  useEffect(() => {
    if (fileUrl) {
      const loader = new STLLoader();
      loader.load(
        fileUrl,
        (loadedGeometry) => {
          loadedGeometry.computeBoundingBox();

          if (!loadedGeometry.boundingBox) {
            console.error('BoundingBox is null');
            return;
          }

          const boundingBox = loadedGeometry.boundingBox;
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const maxDimension = Math.max(size.x, size.y, size.z);

          const convertedSize = size.multiplyScalar(unitConversion[unit]);
          const dimensionsText = `${convertedSize.x.toFixed(2)} x ${convertedSize.y.toFixed(2)} x ${convertedSize.z.toFixed(2)} ${unit}`;
          onDimensionsCalculated(dimensionsText);

          let volumeValue = calcVolume(loadedGeometry) * Math.pow(unitConversion[unit], 3);
          const volumeText = `${volumeValue.toFixed(2)} ${unit === 'mm' ? 'cc' : unit === 'cm' ? 'cm³' : 'in³'}`;
          onVolumeCalculated(volumeText);

          const scale = 3 / maxDimension;
          loadedGeometry.scale(scale, scale, scale);

          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          loadedGeometry.translate(-center.x, -center.y, -center.z);
          loadedGeometry.rotateX(-Math.PI / 2);

          setGeometry(loadedGeometry);
        },
        undefined,
        (error) => {
          console.error('Error loading STL:', error);
        }
      );
    }
  }, [fileUrl, unit, onDimensionsCalculated, onVolumeCalculated]);

  const CameraDirectionalLight = () => {
    const { camera } = useThree();
    const lightRef = useRef<THREE.DirectionalLight>(null);

    useFrame(() => {
      if (lightRef.current) {
        lightRef.current.position.copy(camera.position);
        lightRef.current.quaternion.copy(camera.quaternion);
      }
    });

    return <directionalLight ref={lightRef} intensity={0.8} />;
  };

  return (
    <>
      <div style={{ position: 'relative', width: '375px', height: '500px'}}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Select
              options={unitOptions}
              defaultValue={unitOptions[0]}
              onChange={(e) => setUnit(e?.value as 'mm' | 'cm' | 'in')}
            />
          </div>
          <button onClick={() => setIsFullScreen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
              <path fill="black" fillRule="evenodd" d="M19 2a1 1 0 00-1-1h-6a1 1 0 100 2h3.586l-3.793 3.793a1 1 0 001.414 1.414L17 4.414V8a1 1 0 102 0V2zM1 18a1 1 0 001 1h6a1 1 0 100-2H4.414l3.793-3.793a1 1 0 10-1.414-1.414L3 15.586V12a1 1 0 10-2 0v6z"/>
            </svg>
          </button>
        </div>

        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <CameraDirectionalLight />
          <pointLight color={0xfed700} intensity={1} distance={100} position={[5, 5, 5]} />
          {geometry && <RotatingMesh geometry={geometry} />}
          <OrbitControls minDistance={1} maxDistance={15} />
        </Canvas>
      </div>

      <ModalSTLViewer isOpen={isFullScreen} onClose={() => setIsFullScreen(false)}>
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor:'lightgray' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px'}}>
            <Select
              options={unitOptions}
              defaultValue={unitOptions[0]}
              onChange={(e) => setUnit(e?.value as 'mm' | 'cm' | 'in')}
            />
            <button onClick={() => setIsFullScreen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                <path fill="black" fillRule="evenodd" d="M11 8a1 1 0 001 1h6a1 1 0 100-2h-3.586l3.793-3.793a1 1 0 00-1.414-1.414L13 5.586V2a1 1 0 10-2 0v6zm-2 4a1 1 0 00-1-1H2a1 1 0 100 2h3.586l-3.793 3.793a1 1 0 101.414 1.414L7 14.414V18a1 1 0 102 0v-6z"/>
              </svg>
            </button>
          </div>

          <Canvas style={{width: '100%', height: '100%'}}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <CameraDirectionalLight />
            <pointLight color={0xfed700} intensity={1} distance={100} position={[5, 5, 5]} />
            {geometry && <RotatingMesh geometry={geometry} />}
            <OrbitControls minDistance={1} maxDistance={15} />
          </Canvas>
        </div>
      </ModalSTLViewer>
    </>
  );
};

const MemoizedSTLViewer = React.memo(STLViewer);

const Home: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dimensions, setDimensions] = useState<string>('');
  const handleDimensionsCalculated = useCallback((newDimensions: string) => {
    setDimensions(newDimensions);
  }, []);

  const [volume, setVolume] = useState<string>('');
  const handleVolumeCalculated = useCallback((newVolume: string) => {
    setVolume(newVolume);
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  return (
    <div style={{ backgroundColor: '#0a121e', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <input type="file" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
      <div onClick={!fileUrl ? () => fileInputRef.current?.click() : undefined} onDrop={handleDrop} onDragOver={handleDragOver} style={{
        border: fileUrl ? '2px solid gray' : '2px dashed gray',
        padding: '20px',
        cursor: !fileUrl ? 'pointer' : 'default',
        width: '500px',
        height: '700px',
        backgroundColor: fileUrl ? 'white' : 'lightgray',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!fileUrl && <p style={{ color: 'black' }}>Drag and drop STL file here or click to upload</p>}
        {fileUrl && <MemoizedSTLViewer fileUrl={fileUrl} onDimensionsCalculated={handleDimensionsCalculated} onVolumeCalculated={handleVolumeCalculated} />}
      </div>
    </div>
  );
};

export { STLViewer, Home };
