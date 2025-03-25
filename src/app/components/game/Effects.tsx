"use client";

import React from 'react';

export interface ParticleType {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const createParticle = (
  x: number,
  y: number,
  color: string,
  speed: number = 2,
  life: number = 30
): ParticleType => {
  // Random direction
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 3 + 1;
  
  return {
    x,
    y,
    dx: Math.cos(angle) * speed * Math.random(),
    dy: Math.sin(angle) * speed * Math.random(),
    radius,
    color,
    alpha: 1,
    life,
    maxLife: life
  };
};

export const updateParticle = (particle: ParticleType): ParticleType => {
  return {
    ...particle,
    x: particle.x + particle.dx,
    y: particle.y + particle.dy,
    life: particle.life - 1,
    alpha: particle.life / particle.maxLife
  };
};

export const createExplosion = (
  x: number,
  y: number,
  color: string,
  particleCount: number = 20
): ParticleType[] => {
  const particles: ParticleType[] = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(x, y, color));
  }
  
  return particles;
};

export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  particles: ParticleType[]
): void => {
  particles.forEach(particle => {
    ctx.globalAlpha = particle.alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.closePath();
  });
  
  // Reset global alpha
  ctx.globalAlpha = 1;
};

interface EffectsProps {
  children: React.ReactNode;
}

const Effects: React.FC<EffectsProps> = ({ children }) => {
  return <>{children}</>;
};

export default Effects;
