import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Compass,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { CharacterId } from '../types';
import {
  ADVENTURE_LEVELS,
  ARENA_HEIGHT,
  ARENA_WIDTH,
  CHARACTERS,
  findHitCheckpoints,
  stepPlayerPosition,
  Vec2,
} from '../utils/characterGame';
import { playFanfare, playStepTick, playSuccessChime, playWrongChime } from '../utils/sound';

interface CharacterAdventureGameProps {
  bestScore: number;
  bestLevel: number;
  soundEnabled: boolean;
  onUpdateProgress: (score: number, clearedLevel: number) => void;
}

type GamePhase = 'select' | 'playing' | 'paused' | 'gate' | 'victory' | 'gameover';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const PARTICLE_POOL_SIZE = 48;
const MAX_LIVES = 3;
const PLAYER_SPEED = 175;

function CharacterAvatarSvg({ id, size = 56 }: { id: CharacterId; size?: number }) {
  if (id === 'kiko') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        {/* Bunny ears */}
        <ellipse cx="22" cy="17" rx="6" ry="14" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
        <ellipse cx="22" cy="18" rx="3" ry="9" fill="#FDA4AF" />
        <ellipse cx="42" cy="17" rx="6" ry="14" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
        <ellipse cx="42" cy="18" rx="3" ry="9" fill="#FDA4AF" />
        {/* Head */}
        <circle cx="32" cy="39" r="19" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
        {/* Scarf */}
        <path d="M 18 52 Q 32 59 46 52" fill="none" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" />
        {/* Eyes & cheeks */}
        <circle cx="25" cy="37" r="2.8" fill="#0F172A" />
        <circle cx="39" cy="37" r="2.8" fill="#0F172A" />
        <circle cx="20" cy="42" r="3.2" fill="#FDA4AF" opacity="0.7" />
        <circle cx="44" cy="42" r="3.2" fill="#FDA4AF" opacity="0.7" />
        {/* Nose & smile */}
        <polygon points="29,41 35,41 32,44.5" fill="#F43F5E" />
        <path d="M 28 46 Q 32 50 36 46" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'milo') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        {/* Cat ears */}
        <polygon points="15,31 19,13 30,24" fill="#FDE68A" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="49,31 45,13 34,24" fill="#FDE68A" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="18,27 20,17 26,24" fill="#FCA5A5" />
        <polygon points="46,27 44,17 38,24" fill="#FCA5A5" />
        {/* Head */}
        <circle cx="32" cy="38" r="19" fill="#FDE68A" stroke="#1E293B" strokeWidth="2.5" />
        {/* Collar */}
        <path d="M 18 52 Q 32 59 46 52" fill="none" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
        <circle cx="32" cy="56" r="3" fill="#FACC15" stroke="#1E293B" strokeWidth="1.5" />
        {/* Eyes & whiskers */}
        <circle cx="25" cy="36" r="2.8" fill="#0F172A" />
        <circle cx="39" cy="36" r="2.8" fill="#0F172A" />
        <line x1="12" y1="39" x2="20" y2="40" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="44" x2="20" y2="43" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="44" y1="40" x2="52" y2="39" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="44" y1="43" x2="52" y2="44" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 28 44 Q 32 48 36 44" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {/* Cap */}
      <path d="M 17 24 Q 32 10 47 24 Z" fill="#2563EB" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="14" y1="24" x2="50" y2="24" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      {/* Duck head */}
      <circle cx="32" cy="39" r="18" fill="#FACC15" stroke="#1E293B" strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="25" cy="36" r="2.8" fill="#0F172A" />
      <circle cx="39" cy="36" r="2.8" fill="#0F172A" />
      {/* Beak */}
      <ellipse cx="32" cy="44" rx="8" ry="4.5" fill="#F97316" stroke="#1E293B" strokeWidth="2" />
    </svg>
  );
}

function drawCharacterOnCanvas(
  ctx: CanvasRenderingContext2D,
  id: CharacterId,
  x: number,
  y: number,
  facing: number,
  hopOffset: number,
  squashX: number,
  squashY: number,
  blinkAlpha: number
) {
  ctx.save();
  ctx.globalAlpha = blinkAlpha;

  // Ground shadow
  const shadowScale = Math.max(0.65, 1 - hopOffset / 24);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 16 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(x, y - hopOffset);
  ctx.scale(facing * squashX, squashY);

  if (id === 'kiko') {
    // Ears
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(-6, -21, 4.5, 11, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(6, -21, 4.5, 11, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FDA4AF';
    ctx.beginPath();
    ctx.ellipse(-6, -20, 2, 6.5, -0.1, 0, Math.PI * 2);
    ctx.ellipse(6, -20, 2, 6.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Body/head
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Orange scarf
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-11, 12);
    ctx.quadraticCurveTo(0, 17, 11, 12);
    ctx.stroke();

    // Eyes & cheeks
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-5, -2, 2.4, 0, Math.PI * 2);
    ctx.arc(6, -2, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FDA4AF';
    ctx.beginPath();
    ctx.arc(-9, 3, 2.8, 0, Math.PI * 2);
    ctx.arc(10, 3, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(1, 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'milo') {
    // Cat ears
    ctx.fillStyle = '#FDE68A';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-13, -7);
    ctx.lineTo(-10, -21);
    ctx.lineTo(-2, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(13, -7);
    ctx.lineTo(10, -21);
    ctx.lineTo(2, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Blue collar
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-11, 12);
    ctx.quadraticCurveTo(0, 17, 11, 12);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-5, -2, 2.4, 0, Math.PI * 2);
    ctx.arc(6, -2, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(-9, 3);
    ctx.moveTo(16, 2);
    ctx.lineTo(10, 3);
    ctx.stroke();
  } else {
    // Bibi the Duck
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 1, 15.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Blue school cap
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(0, -8, 13, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.lineTo(15, -8);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-4, -1, 2.3, 0, Math.PI * 2);
    ctx.arc(6, -1, 2.3, 0, Math.PI * 2);
    ctx.fill();

    // Orange beak
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.ellipse(2, 6, 7, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export const CharacterAdventureGame: React.FC<CharacterAdventureGameProps> = ({
  bestScore,
  bestLevel,
  soundEnabled,
  onUpdateProgress,
}) => {
  const [selectedChar, setSelectedChar] = useState<CharacterId>('kiko');
  const [phase, setPhase] = useState<GamePhase>('select');
  const [levelIdx, setLevelIdx] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const [collectedIdList, setCollectedIdList] = useState<string[]>([]);
  const [walkedCm, setWalkedCm] = useState(0);
  const [gateFeedback, setGateFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable simulation state decoupled from React 60Hz renders
  const simRef = useRef({
    player: { x: 220, y: 90 } as Vec2,
    facing: 1,
    gaitDist: 0,
    squashX: 1,
    squashY: 1,
    invulnTimer: 0,
    simTime: 0,
    collectedIds: new Set<string>(),
    keys: new Set<string>(),
    touchDir: { x: 0, y: 0 },
    particles: Array.from({ length: PARTICLE_POOL_SIZE }, (): Particle => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0.5,
      color: '#F59E0B',
      size: 4,
    })),
    particleCursor: 0,
  });

  const phaseRef = useRef<GamePhase>(phase);
  phaseRef.current = phase;
  const levelIdxRef = useRef(levelIdx);
  levelIdxRef.current = levelIdx;
  const charRef = useRef<CharacterId>(selectedChar);
  charRef.current = selectedChar;
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const livesRef = useRef(lives);
  livesRef.current = lives;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const activeChar = CHARACTERS.find((c) => c.id === selectedChar) ?? CHARACTERS[0];
  const currentLevel = ADVENTURE_LEVELS[levelIdx];

  const spawnBurst = (x: number, y: number, color: string, count = 10) => {
    const sim = simRef.current;
    for (let i = 0; i < count; i++) {
      const p = sim.particles[sim.particleCursor];
      sim.particleCursor = (sim.particleCursor + 1) % PARTICLE_POOL_SIZE;
      const angle = (Math.PI * 2 * i) / count + (i % 2) * 0.2;
      const spd = 45 + (i % 4) * 28;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.life = 0.45;
      p.maxLife = 0.45;
      p.color = color;
      p.size = 3.5 + (i % 3);
    }
  };

  const initLevel = (idx: number, resetScoreAndLives = false) => {
    const lvl = ADVENTURE_LEVELS[idx];
    const sim = simRef.current;
    sim.player = { ...lvl.spawn };
    sim.facing = 1;
    sim.gaitDist = 0;
    sim.squashX = 1;
    sim.squashY = 1;
    sim.invulnTimer = 0.8;
    sim.collectedIds = new Set<string>();
    sim.keys.clear();
    sim.touchDir = { x: 0, y: 0 };

    setLevelIdx(idx);
    setCollectedCount(0);
    setCollectedIdList([]);
    setWalkedCm(0);
    setGateFeedback(null);
    if (resetScoreAndLives) {
      setScore(0);
      scoreRef.current = 0;
      setLives(MAX_LIVES);
      livesRef.current = MAX_LIVES;
    }
    setPhase('playing');
  };

  // Keyboard controls + focus-loss hygiene
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current === 'playing') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          simRef.current.keys.clear();
          setPhase('paused');
          return;
        }
        simRef.current.keys.add(e.key.toLowerCase());
      } else if (phaseRef.current === 'paused') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          setPhase('playing');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      simRef.current.keys.delete(e.key.toLowerCase());
    };

    const clearInputs = () => {
      simRef.current.keys.clear();
      simRef.current.touchDir = { x: 0, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearInputs);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearInputs);
    };
  }, []);

  // Main 60 FPS Canvas Simulation Loop (mounted once while not in 'select')
  useEffect(() => {
    if (phase === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const sim = simRef.current;
      const lvl = ADVENTURE_LEVELS[levelIdxRef.current];
      const activePhase = phaseRef.current;

      if (activePhase === 'playing') {
        sim.simTime += dt;
        if (sim.invulnTimer > 0) {
          sim.invulnTimer = Math.max(0, sim.invulnTimer - dt);
        }

        // Gather directional intent from keyboard or touch D-pad
        let dx = sim.touchDir.x;
        let dy = sim.touchDir.y;
        if (sim.keys.has('arrowleft') || sim.keys.has('a')) dx -= 1;
        if (sim.keys.has('arrowright') || sim.keys.has('d')) dx += 1;
        if (sim.keys.has('arrowup') || sim.keys.has('w')) dy -= 1;
        if (sim.keys.has('arrowdown') || sim.keys.has('s')) dy += 1;

        if (dx !== 0 || dy !== 0) {
          const prevX = sim.player.x;
          const prevY = sim.player.y;
          sim.player = stepPlayerPosition(sim.player, dx, dy, PLAYER_SPEED, dt);
          const moved = Math.hypot(sim.player.x - prevX, sim.player.y - prevY);
          sim.gaitDist += moved;
          if (dx < 0) sim.facing = -1;
          if (dx > 0) sim.facing = 1;
        }

        // Exponentially damp squash back to 1
        sim.squashX += (1 - sim.squashX) * Math.min(1, dt * 12);
        sim.squashY += (1 - sim.squashY) * Math.min(1, dt * 12);

        // Check edge checkpoints
        const newlyHit = findHitCheckpoints(sim.player, lvl.checkpoints, sim.collectedIds, 32);
        if (newlyHit.length > 0) {
          for (const cp of newlyHit) {
            sim.collectedIds.add(cp.id);
            spawnBurst(cp.x, cp.y, '#F59E0B', 12);
          }
          sim.squashX = 0.86;
          sim.squashY = 1.18;
          playStepTick(soundRef.current);

          const totalCm = lvl.checkpoints
            .filter((c) => sim.collectedIds.has(c.id))
            .reduce((sum, c) => sum + c.sideLength, 0);
          setCollectedCount(sim.collectedIds.size);
          setCollectedIdList(Array.from(sim.collectedIds));
          setWalkedCm(totalCm);

          // Unlock treasure gate when all edge checkpoints are collected!
          if (sim.collectedIds.size >= lvl.checkpoints.length) {
            sim.keys.clear();
            sim.touchDir = { x: 0, y: 0 };
            playSuccessChime(soundRef.current);
            setPhase('gate');
          }
        }

        // Check bee patrol collisions
        if (sim.invulnTimer <= 0) {
          for (const bee of lvl.bees) {
            const bx = bee.cx + Math.cos(sim.simTime * bee.speed + bee.phase) * bee.rx;
            const by = bee.cy + Math.sin(sim.simTime * bee.speed + bee.phase) * bee.ry;
            if (Math.hypot(sim.player.x - bx, sim.player.y - by) < 25) {
              sim.invulnTimer = 1.3;
              sim.squashX = 1.28;
              sim.squashY = 0.74;
              spawnBurst(sim.player.x, sim.player.y, '#F43F5E', 10);
              playWrongChime(soundRef.current);

              // Gentle knockback away from bee
              const pushAngle = Math.atan2(sim.player.y - by, sim.player.x - bx);
              sim.player = stepPlayerPosition(
                sim.player,
                Math.cos(pushAngle),
                Math.sin(pushAngle),
                520,
                0.05
              );

              const nextLives = livesRef.current - 1;
              livesRef.current = nextLives;
              setLives(nextLives);
              if (nextLives <= 0) {
                sim.keys.clear();
                onUpdateProgress(scoreRef.current, levelIdxRef.current);
                setPhase('gameover');
              }
              break;
            }
          }
        }
      }

      // Update pooled particles even in gate/celebration states
      for (const p of sim.particles) {
        if (!p.active) continue;
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
      }

      // ---- RENDER ARENA ----
      ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Soft meadow background
      ctx.fillStyle = '#ECFDF5';
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Subtle garden grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= ARENA_WIDTH; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, ARENA_HEIGHT);
        ctx.stroke();
      }
      for (let gy = 0; gy <= ARENA_HEIGHT; gy += 32) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(ARENA_WIDTH, gy);
        ctx.stroke();
      }

      // Decorative meadow corner flowers
      const flowerSpots = [
        [44, 44, '#F97316'],
        [596, 48, '#3B82F6'],
        [48, 336, '#EC4899'],
        [590, 332, '#EAB308'],
      ] as const;
      for (const [fx, fy, fc] of flowerSpots) {
        ctx.fillStyle = fc;
        for (let k = 0; k < 5; k++) {
          const a = (Math.PI * 2 * k) / 5 + sim.simTime * 0.4;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(a) * 6, fy + Math.sin(a) * 6, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw shape garden interior + wide perimeter trail
      ctx.save();
      ctx.beginPath();
      lvl.vertices.forEach((v, i) => {
        if (i === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(167, 243, 208, 0.42)';
      ctx.fill();

      // Sandy outer trail stroke
      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 24;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Edge-by-edge colored progress line
      lvl.vertices.forEach((v, idx) => {
        const next = lvl.vertices[(idx + 1) % lvl.vertices.length];
        const cp = lvl.checkpoints[idx];
        const done = sim.collectedIds.has(cp.id);

        ctx.beginPath();
        ctx.moveTo(v.x, v.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = done ? '#059669' : '#D97706';
        ctx.lineWidth = done ? 6 : 3.5;
        ctx.setLineDash(done ? [] : [8, 6]);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      // Corner wooden posts
      for (const v of lvl.vertices) {
        ctx.fillStyle = '#B45309';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(v.x, v.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Center Treasure Chest / Gate
      const allDone = sim.collectedIds.size >= lvl.checkpoints.length;
      const gx = lvl.gatePos.x;
      const gy = lvl.gatePos.y;
      ctx.save();
      ctx.translate(gx, gy);
      if (allDone) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.32)';
        ctx.beginPath();
        ctx.arc(0, 0, 28 + Math.sin(sim.simTime * 5) * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = allDone ? '#F59E0B' : '#94A3B8';
      ctx.strokeStyle = allDone ? '#92400E' : '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -12, 32, 24, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(-4, -3, 8, 7);
      ctx.restore();

      // Edge Checkpoints & cm labels
      for (const cp of lvl.checkpoints) {
        const done = sim.collectedIds.has(cp.id);
        const bob = done ? 0 : Math.sin(sim.simTime * 4 + cp.x) * 3;

        // Pickup star coin
        ctx.save();
        ctx.translate(cp.x, cp.y + bob);
        ctx.fillStyle = done ? '#10B981' : '#F59E0B';
        ctx.strokeStyle = done ? '#065F46' : '#92400E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(done ? '✓' : '★', 0, 1);
        ctx.restore();

        // Crisp cm badge right next to checkpoint
        ctx.save();
        ctx.font = '600 12px "IBM Plex Mono", monospace';
        const tw = ctx.measureText(cp.label).width + 12;
        const lx = cp.x;
        const ly = cp.y < 140 ? cp.y - 25 : cp.y > 260 ? cp.y + 26 : cp.x < 320 ? cp.x - 36 : cp.x + 36;
        const labelPosX = cp.y >= 140 && cp.y <= 260 ? ly : lx;
        const labelPosY = cp.y >= 140 && cp.y <= 260 ? cp.y : ly;

        ctx.fillStyle = done ? '#ECFDF5' : '#FFFFFF';
        ctx.strokeStyle = done ? '#059669' : '#CBD5E1';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(labelPosX - tw / 2, labelPosY - 10, tw, 20, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = done ? '#065F46' : '#0F172A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cp.label, labelPosX, labelPosY + 0.5);
        ctx.restore();
      }

      // Draw Patrolling Bees
      for (const bee of lvl.bees) {
        const bx = bee.cx + Math.cos(sim.simTime * bee.speed + bee.phase) * bee.rx;
        const by = bee.cy + Math.sin(sim.simTime * bee.speed + bee.phase) * bee.ry;
        const wingFlap = Math.sin(sim.simTime * 28) * 3;

        ctx.save();
        ctx.translate(bx, by);
        // Wings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-4, -9 + wingFlap * 0.4, 6, 4, -0.3, 0, Math.PI * 2);
        ctx.ellipse(4, -9 - wingFlap * 0.4, 6, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Body
        ctx.fillStyle = '#FACC15';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Stripes
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-3, -8);
        ctx.lineTo(-3, 8);
        ctx.moveTo(3, -8);
        ctx.lineTo(3, 8);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Player Character
      const hopOffset = Math.abs(Math.sin(sim.gaitDist * 0.14)) * 7;
      const blinkAlpha =
        sim.invulnTimer > 0 && Math.floor(sim.invulnTimer * 12) % 2 === 0 ? 0.45 : 1;

      drawCharacterOnCanvas(
        ctx,
        charRef.current,
        sim.player.x,
        sim.player.y,
        sim.facing,
        hopOffset,
        sim.squashX,
        sim.squashY,
        blinkAlpha
      );

      // Draw pooled particles
      for (const p of sim.particles) {
        if (!p.active) continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase !== 'select']);

  const handleAnswerGate = (chosenValue: number) => {
    if (chosenValue === currentLevel.perimeter) {
      const nextScore = score + 25;
      setScore(nextScore);
      scoreRef.current = nextScore;
      const clearedLevelNum = currentLevel.level;
      onUpdateProgress(nextScore, clearedLevelNum);
      playFanfare(soundEnabled);

      if (levelIdx < ADVENTURE_LEVELS.length - 1) {
        initLevel(levelIdx + 1, false);
      } else {
        setPhase('victory');
      }
    } else {
      playWrongChime(soundEnabled);
      const nextLives = lives - 1;
      setLives(nextLives);
      livesRef.current = nextLives;
      if (nextLives <= 0) {
        onUpdateProgress(score, levelIdx);
        setPhase('gameover');
      } else {
        setGateFeedback(
          `Belum tepat! Coba jumlahkan seluruh sisinya: ${currentLevel.sides.join(' + ')} cm.`
        );
      }
    }
  };

  const setTouchDirection = (x: number, y: number) => {
    simRef.current.touchDir = { x, y };
  };

  const nudgeCharacter = (x: number, y: number) => {
    if (phaseRef.current !== 'playing') return;
    simRef.current.player = stepPlayerPosition(simRef.current.player, x, y, 420, 0.05);
    if (x < 0) simRef.current.facing = -1;
    if (x > 0) simRef.current.facing = 1;
    simRef.current.gaitDist += 18;
  };

  // Phase 1: Character Picker Screen
  if (phase === 'select') {
    return (
      <section className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-700">
              Mini-Game Karakter 2D · 5 Level Taman Keliling
            </p>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
              Petualangan Karakter Keliling
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Pilih karakter favoritmu, gerakkan mengelilingi sisi <strong>Persegi</strong>,{' '}
              <strong>Persegi Panjang</strong>, dan <strong>Segitiga</strong> untuk mengumpulkan
              semua bintang sambil menghindari lebah penjaga!
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-right shrink-0">
            <span className="block text-xs text-blue-800 font-medium">Rekor Petualangan</span>
            <span className="font-mono text-xl font-extrabold text-blue-700 tabular-nums">
              Level {bestLevel}/{ADVENTURE_LEVELS.length}
            </span>
            <span className="block text-xs font-mono text-blue-700 tabular-nums">
              Skor Terbaik: {bestScore}
            </span>
          </div>
        </div>

        {/* Character Selector Cards */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Pilih Karakter Petualangmu
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CHARACTERS.map((char) => {
              const active = selectedChar === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => setSelectedChar(char.id)}
                  aria-pressed={active}
                  className={`text-left rounded-xl border-2 p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'bg-blue-50/70 border-blue-600'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <CharacterAvatarSvg id={char.id} size={52} />
                    </div>
                    <div>
                      <span className="font-display text-lg font-bold text-slate-900 block">
                        {char.name}
                      </span>
                      <span className="text-xs font-semibold text-blue-700">{char.species}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">{char.tagline}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Kontrol: Tombol Panah / WASD di keyboard atau tombol arah di layar · Selesaikan 2 level
            untuk Lencana Sahabat Petualang (+60 XP).
          </p>
          <button
            type="button"
            data-start="true"
            onClick={() => initLevel(0, true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Mulai Petualangan bersama {activeChar.name}!</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Live 2D Character Arena Canvas */}
      <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Compact Arena HUD Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <CharacterAvatarSvg id={selectedChar} size={34} />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700">
                Level {currentLevel.level}/{ADVENTURE_LEVELS.length} · {currentLevel.shapeName}
              </p>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                {currentLevel.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1"
              aria-label={`Sisa ${lives} dari ${MAX_LIVES} nyawa`}
            >
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${
                    i < lives ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span
              data-testid="adventure-score"
              className="font-mono text-sm font-bold text-blue-700 tabular-nums"
            >
              Skor: {score}
            </span>
            <button
              type="button"
              onClick={() => setPhase((p) => (p === 'paused' ? 'playing' : 'paused'))}
              disabled={phase !== 'playing' && phase !== 'paused'}
              aria-label={phase === 'paused' ? 'Lanjutkan permainan' : 'Jeda permainan'}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              {phase === 'paused' ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Canvas Container + Focused Modals */}
        <div
          className="relative rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50"
          data-testid="character-adventure-stage"
          data-phase={phase}
        >
          <canvas
            ref={canvasRef}
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
            className="w-full h-auto block"
          />

          {/* Pause Overlay */}
          {phase === 'paused' && (
            <div className="absolute inset-0 bg-slate-900/55 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full text-center space-y-4">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Permainan Dijeda
                </h3>
                <p className="text-sm text-slate-600">
                  {activeChar.name} sedang beristirahat sejenak di taman.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setPhase('playing')}
                    className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Lanjutkan Main
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase('select')}
                    className="w-full py-2 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Ganti Karakter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Treasure Gate Perimeter Question Modal */}
          {phase === 'gate' && (
            <div className="absolute inset-0 bg-slate-900/55 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-amber-300 p-5 sm:p-6 max-w-md w-full text-center space-y-4 shadow-lg">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  <span>Semua Bintang Sisi Terkumpul!</span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Buka Gerbang Harta {currentLevel.shapeName}
                </h3>
                <p className="text-sm text-slate-700">
                  {activeChar.name} baru saja mengelilingi sisi{' '}
                  <strong className="font-mono">{currentLevel.sides.join(' cm, ')} cm</strong>.
                  Berapakah total kelilingnya?
                </p>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {currentLevel.gateOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswerGate(opt)}
                      className="py-3 px-2 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-mono text-base font-bold text-slate-900 transition-colors tabular-nums"
                    >
                      {opt} cm
                    </button>
                  ))}
                </div>

                {gateFeedback && (
                  <p role="alert" className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                    {gateFeedback}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Victory Modal */}
          {phase === 'victory' && (
            <div className="absolute inset-0 bg-slate-900/55 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-emerald-300 p-6 max-w-md w-full text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-slate-900">
                  Hebat! {activeChar.name} Menang Sempurna!
                </h3>
                <p className="text-sm text-slate-600">
                  Kamu berhasil menaklukkan seluruh 5 taman bangun datar dengan skor{' '}
                  <strong className="font-mono text-blue-700">{score} poin</strong>!
                </p>
                <div className="flex justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => initLevel(0, true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Main Lagi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase('select')}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Ganti Karakter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {phase === 'gameover' && (
            <div className="absolute inset-0 bg-slate-900/55 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-rose-200 p-6 max-w-sm w-full text-center space-y-4">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Nyawa {activeChar.name} Habis!
                </h3>
                <p className="text-sm text-slate-600">
                  Kamu mencapai <strong>Level {currentLevel.level}</strong> dengan skor{' '}
                  <strong className="font-mono text-blue-700">{score} poin</strong>. Yuk coba
                  lagi!
                </p>
                <div className="flex justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => initLevel(levelIdx, true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Ulangi Level {currentLevel.level}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase('select')}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Pilih Karakter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Mobile / Tablet Compact D-Pad Directly Under Canvas */}
          <div
            data-testid="mobile-dpad"
            className="lg:hidden pt-3 border-t border-slate-100 space-y-2.5 touch-none select-none"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Gerakkan {activeChar.name}
              </span>
              <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                Pos {collectedCount}/{currentLevel.checkpoints.length} · {walkedCm} cm
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-[216px] mx-auto">
              <div />
              <button
                type="button"
                aria-label="Gerak Atas"
                onPointerDown={() => setTouchDirection(0, -1)}
                onPointerUp={() => setTouchDirection(0, 0)}
                onPointerLeave={() => setTouchDirection(0, 0)}
                onPointerCancel={() => setTouchDirection(0, 0)}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => nudgeCharacter(0, -1)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-blue-100 active:bg-blue-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-800 transition-colors touch-none"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div />
              <button
                type="button"
                aria-label="Gerak Kiri"
                onPointerDown={() => setTouchDirection(-1, 0)}
                onPointerUp={() => setTouchDirection(0, 0)}
                onPointerLeave={() => setTouchDirection(0, 0)}
                onPointerCancel={() => setTouchDirection(0, 0)}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => nudgeCharacter(-1, 0)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-blue-100 active:bg-blue-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-800 transition-colors touch-none"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Gerak Bawah"
                onPointerDown={() => setTouchDirection(0, 1)}
                onPointerUp={() => setTouchDirection(0, 0)}
                onPointerLeave={() => setTouchDirection(0, 0)}
                onPointerCancel={() => setTouchDirection(0, 0)}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => nudgeCharacter(0, 1)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-blue-100 active:bg-blue-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-800 transition-colors touch-none"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Gerak Kanan"
                onPointerDown={() => setTouchDirection(1, 0)}
                onPointerUp={() => setTouchDirection(0, 0)}
                onPointerLeave={() => setTouchDirection(0, 0)}
                onPointerCancel={() => setTouchDirection(0, 0)}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => nudgeCharacter(1, 0)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-blue-100 active:bg-blue-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-800 transition-colors touch-none"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => initLevel(levelIdx, false)}
                className="font-semibold text-slate-600 hover:text-blue-700 underline underline-offset-2"
              >
                Ulangi Level
              </button>
              <button
                type="button"
                onClick={() => setPhase('select')}
                className="font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-2"
              >
                Ganti Karakter
              </button>
            </div>
          </div>

        <p className="text-xs sm:text-sm text-slate-600">{currentLevel.story}</p>
      </section>

      {/* Right: Touch D-Pad + Live Perimeter Odometer */}
      <aside className="lg:col-span-4 space-y-4">
        {/* Live Perimeter Progress Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-slate-900">
              Pita Ukur {activeChar.name}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div>
              <span className="block text-xs text-slate-500">Pos Sisi</span>
              <span
                data-testid="adventure-checkpoints"
                className="font-mono text-xl font-bold text-slate-900 tabular-nums"
              >
                {collectedCount}/{currentLevel.checkpoints.length}
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Jarak Sisi</span>
              <span className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                {walkedCm} cm
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-700">Daftar Sisi yang Ditempuh:</p>
            <div className="flex flex-wrap gap-2">
              {currentLevel.checkpoints.map((cp) => {
                const done = collectedIdList.includes(cp.id);
                return (
                  <span
                    key={cp.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-xs font-semibold border tabular-nums ${
                      done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {done && <CheckCircle2 className="w-3 h-3" aria-hidden="true" />}
                    {cp.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop On-Screen D-Pad Controls */}
        <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Kontrol Gerak {activeChar.name}
            </h3>
            <span className="text-xs text-slate-500">Panah / WASD</span>
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-[196px] mx-auto select-none touch-none">
            <div />
            <button
              type="button"
              aria-label="Gerak Atas"
              onPointerDown={() => setTouchDirection(0, -1)}
              onPointerUp={() => setTouchDirection(0, 0)}
              onPointerLeave={() => setTouchDirection(0, 0)}
              onPointerCancel={() => setTouchDirection(0, 0)}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => nudgeCharacter(0, -1)}
              className="h-12 rounded-xl bg-slate-100 hover:bg-blue-100 active:bg-blue-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-800 transition-colors touch-none"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div />
            <button
              type="button"
              aria-label="Gerak Kiri"
              onPointerDown={() => setTouchDirection(-1, 0)}
              onPointerUp={() => setTouchDirection(0, 0)}
              onPointerLeave={() => setTouchDirection(0, 0)}
              onPointerCancel={() => setTouchDirection(0, 0)}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => nudgeCharacter(-1, 0)}
              className="h-12 rounded-xl bg-slate-100 hover:bg-blue-100 active:bg-blue-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-800 transition-colors touch-none"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Gerak Bawah"
              onPointerDown={() => setTouchDirection(0, 1)}
              onPointerUp={() => setTouchDirection(0, 0)}
              onPointerLeave={() => setTouchDirection(0, 0)}
              onPointerCancel={() => setTouchDirection(0, 0)}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => nudgeCharacter(0, 1)}
              className="h-12 rounded-xl bg-slate-100 hover:bg-blue-100 active:bg-blue-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-800 transition-colors touch-none"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Gerak Kanan"
              onPointerDown={() => setTouchDirection(1, 0)}
              onPointerUp={() => setTouchDirection(0, 0)}
              onPointerLeave={() => setTouchDirection(0, 0)}
              onPointerCancel={() => setTouchDirection(0, 0)}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => nudgeCharacter(1, 0)}
              className="h-12 rounded-xl bg-slate-100 hover:bg-blue-100 active:bg-blue-600 active:text-white border border-slate-300 flex items-center justify-center text-slate-800 transition-colors touch-none"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => initLevel(levelIdx, false)}
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 underline underline-offset-2"
            >
              Ulangi Level
            </button>
            <button
              type="button"
              onClick={() => setPhase('select')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-2"
            >
              Ganti Karakter
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
