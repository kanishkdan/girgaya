import { Canvas, RootState, useThree, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PerspectiveCamera, KeyboardControls } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import StartMenu from './StartMenu';
import { TronGame } from './core/TronGame';
import { CameraController } from './core/CameraController';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const GameRenderer = ({ game }: { game: TronGame }) => {
  const { camera } = useThree();
  const cameraController = useRef<CameraController>();

  useEffect(() => {
    if (game.getPlayer()) {
      cameraController.current = new CameraController(
        camera as THREE.PerspectiveCamera,
        game.getPlayer()!
      );
    }
  }, [game, camera]);

  useFrame((state, delta) => {
    if (cameraController.current) {
      cameraController.current.update(delta);
    }
  });

  return null;
};

export const GameScene = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState<string>();
  const scene = useRef<THREE.Scene>();
  const game = useRef<TronGame>();

  const handleGameStart = (name: string) => {
    setPlayerName(name);
    setGameStarted(true);
    
    // Initialize game
    if (scene.current) {
      const physicsWorld = new CANNON.World();
      physicsWorld.gravity.set(0, -19.81, 0);
      physicsWorld.defaultContactMaterial.friction = 0.1;
      physicsWorld.defaultContactMaterial.restitution = 0.2;
      game.current = new TronGame(scene.current, physicsWorld);
      game.current.start(name);
    }
  };

  return (
    <>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
          { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
          { name: 'leftward', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'rightward', keys: ['ArrowRight', 'd', 'D'] },
        ]}
      >
        <Canvas shadows onCreated={(state: RootState) => { scene.current = state.scene; }}>
          <Suspense fallback={null}>
            <PerspectiveCamera
              makeDefault
              position={[0, 15, -30]}
              fov={75}
            />
            <Physics
              gravity={[0, -19.81, 0]}
              defaultContactMaterial={{
                friction: 0.1,
                restitution: 0.2,
              }}
            >
              {gameStarted && game.current && <GameRenderer game={game.current} />}
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      {!gameStarted && <StartMenu onStart={handleGameStart} />}
    </>
  );
}; 