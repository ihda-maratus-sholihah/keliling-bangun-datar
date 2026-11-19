import React from 'react';
import { ShapeDimensions, ShapeType } from '../types';
import { buildGeometryModel, SHAPE_CATALOG } from '../utils/geometry';

interface ShapeDiagramProps {
  shape: ShapeType;
  dimensions: ShapeDimensions;
  showGrid?: boolean;
  showRightAngles?: boolean;
  showSymmetry?: boolean;
  gardenMode?: boolean;
  unknownLabel?: string;
  /** Progress along perimeter from 0 to edges.length (e.g. 0..4 for persegi) */
  walkProgress?: number | null;
  compact?: boolean;
  ariaLabel?: string;
}

export const ShapeDiagram: React.FC<ShapeDiagramProps> = ({
  shape,
  dimensions,
  showGrid = true,
  showRightAngles = true,
  showSymmetry = false,
  gardenMode = false,
  unknownLabel,
  walkProgress = null,
  compact = false,
  ariaLabel,
}) => {
  const model = buildGeometryModel(shape, dimensions, unknownLabel);
  const meta = SHAPE_CATALOG[shape];
  const pointsAttr = model.points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const isWalking = walkProgress !== null && walkProgress >= 0;
  const clampedWalk = isWalking
    ? Math.min(model.edges.length, Math.max(0, walkProgress))
    : 0;

  // Compute walker dot coordinates along the active edge
  let walkerPos: { x: number; y: number } | null = null;
  if (isWalking && model.edges.length > 0) {
    if (clampedWalk >= model.edges.length) {
      const firstEdge = model.edges[0];
      walkerPos = { x: firstEdge.x1, y: firstEdge.y1 };
    } else {
      const idx = Math.floor(clampedWalk);
      const frac = clampedWalk - idx;
      const edge = model.edges[idx];
      walkerPos = {
        x: edge.x1 + (edge.x2 - edge.x1) * frac,
        y: edge.y1 + (edge.y2 - edge.y1) * frac,
      };
    }
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-200 ${
        gardenMode ? 'bg-emerald-50/40' : showGrid ? 'math-grid-bg' : 'bg-white'
      }`}
      data-testid={`shape-diagram-${shape}`}
    >
      <svg
        viewBox={`0 0 ${model.viewBoxWidth} ${model.viewBoxHeight}`}
        className={`w-full h-auto block select-none ${compact ? 'max-h-52' : 'max-h-[272px]'}`}
        role="img"
        aria-label={ariaLabel ?? `Diagram bangun datar ${meta.name}`}
      >
        {/* Optional subtle grid inside SVG when garden mode is active */}
        {gardenMode && (
          <defs>
            <pattern
              id="garden-grid"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 22 0 L 0 0 0 22"
                fill="none"
                stroke="rgba(16, 185, 129, 0.16)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
        )}
        {gardenMode && (
          <rect
            width={model.viewBoxWidth}
            height={model.viewBoxHeight}
            fill="url(#garden-grid)"
          />
        )}

        {/* Base filled polygon */}
        <polygon
          points={pointsAttr}
          fill={gardenMode ? 'rgba(34, 197, 94, 0.18)' : meta.fillHex}
          stroke={gardenMode ? '#92400E' : meta.accentHex}
          strokeWidth={gardenMode ? 4 : 2.5}
          strokeDasharray={gardenMode ? '10 4' : undefined}
          strokeLinejoin="round"
        />

        {/* Symmetry lines */}
        {showSymmetry &&
          model.symmetryLines.map((line, idx) => (
            <line
              key={idx}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#64748B"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
          ))}

        {/* Right angle 90-degree markers */}
        {showRightAngles &&
          model.rightAngleCorners.map((c, idx) => (
            <path
              key={idx}
              d={`M ${c.x + c.dx} ${c.y} L ${c.x + c.dx} ${c.y + c.dy} L ${c.x} ${c.y + c.dy}`}
              fill="none"
              stroke={meta.accentHex}
              strokeOpacity="0.65"
              strokeWidth="1.5"
            />
          ))}

        {/* Individual edges with animated traversal highlight */}
        {model.edges.map((edge, idx) => {
          const edgeProgress = isWalking ? Math.min(1, Math.max(0, clampedWalk - idx)) : 0;
          const isCompleted = isWalking && clampedWalk >= idx + 0.99;
          const isCurrent = isWalking && clampedWalk > idx && clampedWalk < idx + 1;

          const hx = edge.x1 + (edge.x2 - edge.x1) * edgeProgress;
          const hy = edge.y1 + (edge.y2 - edge.y1) * edgeProgress;

          return (
            <g key={edge.id}>
              {isWalking && edgeProgress > 0 && (
                <line
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={hx}
                  y2={hy}
                  stroke="#D97706"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
              )}

              {/* Edge dimension label with crisp white backing for contrast */}
              <g transform={`translate(${edge.labelX}, ${edge.labelY})`}>
                <rect
                  x="-28"
                  y="-12"
                  width="56"
                  height="22"
                  rx="6"
                  fill={isCompleted || isCurrent ? '#FEF3C7' : '#FFFFFF'}
                  stroke={isCompleted || isCurrent ? '#D97706' : '#CBD5E1'}
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  className="font-mono text-[12px] font-semibold"
                  fill={isCompleted || isCurrent ? '#92400E' : '#0F172A'}
                >
                  {edge.label}
                </text>
              </g>
            </g>
          );
        })}

        {/* Corner vertices / garden fence posts */}
        {model.points.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={gardenMode ? 6 : 4.5}
            fill={gardenMode ? '#B45309' : '#FFFFFF'}
            stroke={gardenMode ? '#78350F' : meta.accentHex}
            strokeWidth="2.5"
          />
        ))}

        {/* Start flag marker when walking perimeter */}
        {isWalking && model.points[0] && (
          <g transform={`translate(${model.points[0].x}, ${model.points[0].y})`}>
            <circle r="7" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        )}

        {/* Animated explorer marker moving around the perimeter */}
        {walkerPos && (
          <g transform={`translate(${walkerPos.x}, ${walkerPos.y})`}>
            <circle r="11" fill="#F59E0B" fillOpacity="0.28" />
            <circle r="7" fill="#D97706" stroke="#FFFFFF" strokeWidth="2.5" />
          </g>
        )}
      </svg>
    </div>
  );
};
