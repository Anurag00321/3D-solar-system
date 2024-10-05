'use client'
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Home = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  const planetsData = [
    { name: 'Mercury', color: 0x8c7c6e, size: 0.8, distance: 10 },
    { name: 'Venus', color: 0xe6c389, size: 1.5, distance: 15 },
    { name: 'Earth', color: 0x6b93d6, size: 1.6, distance: 20 },
    { name: 'Mars', color: 0xc1440e, size: 1.2, distance: 25 },
    { name: 'Jupiter', color: 0xd8ca9d, size: 3.5, distance: 35 },
    { name: 'Saturn', color: 0xead6b8, size: 3, distance: 45 },
    { name: 'Uranus', color: 0xc3d4d2, size: 2.5, distance: 55 },
    { name: 'Neptune', color: 0x5b5ddf, size: 2.4, distance: 65 }
  ];

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 2);
    scene.add(pointLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets
    const planets: THREE.Mesh[] = [];
    planetsData.forEach((planetData) => {
      const planetGeometry = new THREE.SphereGeometry(planetData.size, 32, 32);
      const planetMaterial = new THREE.MeshStandardMaterial({ color: planetData.color });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      planet.userData = { name: planetData.name, distance: planetData.distance };
      scene.add(planet);
      planets.push(planet);

      // Orbit
      const orbitGeometry = new THREE.RingGeometry(planetData.distance - 0.1, planetData.distance + 0.1, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
    });

    // Add Saturn's rings
    const saturnIndex = planets.findIndex(p => p.userData.name === 'Saturn');
    if (saturnIndex !== -1) {
      const saturn = planets[saturnIndex];
      const ringGeometry = new THREE.RingGeometry(4, 6, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xa49b72, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      saturn.add(ring);
    }

    camera.position.z = 100;

    const animate = () => {
      planets.forEach((planet) => {
        const speed = 0.001 / Math.sqrt(planet.userData.distance);
        const angle = Date.now() * speed;
        planet.position.x = Math.cos(angle) * planet.userData.distance;
        planet.position.z = Math.sin(angle) * planet.userData.distance;
        planet.rotation.y += 0.02;
      });

      sun.rotation.y += 0.002;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleClick = (event: MouseEvent) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets);

      if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        setSelectedPlanet(clickedPlanet.userData.name);
      } else {
        setSelectedPlanet(null);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [planetsData]);

  return (
    <div className="relative h-screen">
      
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full"></div>
     
      {selectedPlanet && (
        <div className="absolute top-5 left-5 bg-gray-800 bg-opacity-70 p-5 rounded-lg text-white">
          <h1 className="text-3xl">{selectedPlanet}</h1>
          <p className="mt-3">You&apos;ve selected {selectedPlanet}. This is a simplified model for demonstration.</p>
        </div>
      )}
      <div className="absolute bottom-5 left-5 bg-gray-800 bg-opacity-70 p-5 rounded-lg text-white">
        <h2 className="text-2xl mb-2">Instructions</h2>
        <p>The planets are revolving around the central sun.</p>
        <p>Click on a planet to see its name.</p>
      </div>
      <PlanetLegend />
    </div>
  );
};

const PlanetLegend = () => (
  <div className="absolute top-5 right-5 bg-gray-800 bg-opacity-70 p-5 rounded-lg text-white">
    <h2 className="text-2xl mb-2">Planet Colors</h2>
    <ul>
      {[
        { name: 'Mercury', color: '#8c7c6e' },
        { name: 'Venus', color: '#e6c389' },
        { name: 'Earth', color: '#6b93d6' },
        { name: 'Mars', color: '#c1440e' },
        { name: 'Jupiter', color: '#d8ca9d' },
        { name: 'Saturn', color: '#ead6b8' },
        { name: 'Uranus', color: '#c3d4d2' },
        { name: 'Neptune', color: '#5b5ddf' }
      ].map(planet => (
        <li key={planet.name} className="flex items-center mb-1">
          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: planet.color }}></div>
          <span>{planet.name}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Home;