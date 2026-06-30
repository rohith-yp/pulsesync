import React, { useMemo } from 'react';

// ----------------------------------------------------
// 1. Mini Sparkline (for KPI cards)
// ----------------------------------------------------
interface MiniSparkLineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export const MiniSparkLine: React.FC<MiniSparkLineProps> = ({
  data,
  color = '#2563EB',
  width = 120,
  height = 40,
}) => {
  const points = useMemo(() => {
    if (!data || data.length === 0) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;
    const stepX = width / (data.length - 1);
    
    return data
      .map((val, i) => {
        const x = i * stepX;
        // Keep 4px padding top and bottom
        const y = height - 4 - ((val - min) / range) * (height - 8);
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// ----------------------------------------------------
// 2. Line Chart (for Inflow and Patient Stats)
// ----------------------------------------------------
interface LineChartProps {
  data: { label: string; value: number; predicted?: number }[];
  height?: number;
  color?: string;
  predictedColor?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 240,
  color = '#2563EB',
  predictedColor = '#10B981',
}) => {
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  const { points, pointsPredicted, gridLines, labelsX, labelsY, areaPoints } = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: '', pointsPredicted: '', gridLines: [], labelsX: [], labelsY: [], areaPoints: '' };
    }

    const values = data.flatMap((d) => [d.value, d.predicted ?? 0]);
    const maxVal = Math.max(...values, 10);
    const roundedMax = Math.ceil(maxVal / 10) * 10;
    
    const chartHeight = height - padding.top - padding.bottom;
    const chartWidth = 500; // Fixed inner coordinate width for SVG viewbox

    const stepX = chartWidth / (data.length - 1);
    const scaleY = chartHeight / roundedMax;

    // Standard actual value points
    const pts = data.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartHeight - d.value * scaleY;
      return { x, y };
    });
    const ptsString = pts.map(p => `${p.x},${p.y}`).join(' ');

    // Predicted value points
    const ptsPred = data.map((d, i) => {
      const x = padding.left + i * stepX;
      const val = d.predicted !== undefined ? d.predicted : d.value;
      const y = padding.top + chartHeight - val * scaleY;
      return { x, y };
    });
    const ptsPredString = ptsPred.map(p => `${p.x},${p.y}`).join(' ');

    // Area points (for background gradient under the curve)
    const areaPts = pts.length > 0 
      ? `${padding.left},${padding.top + chartHeight} ` + 
        ptsString + 
        ` ${padding.left + (pts.length - 1) * stepX},${padding.top + chartHeight}`
      : '';

    // Grid lines and Y labels (4 horizontal grid lines)
    const gLines: { y: number; val: number }[] = [];
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((roundedMax / 4) * i);
      const y = padding.top + chartHeight - val * scaleY;
      gLines.push({ y, val });
    }

    // X Labels
    const lblsX = data.map((d, i) => ({
      x: padding.left + i * stepX,
      text: d.label
    }));

    return {
      points: ptsString,
      pointsPredicted: ptsPredString,
      areaPoints: areaPts,
      gridLines: gLines,
      labelsX: lblsX,
      labelsY: gLines
    };
  }, [data, height]);

  const viewWidth = 500 + padding.left + padding.right;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${viewWidth} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {gridLines.map((line, idx) => (
        <line
          key={idx}
          x1={padding.left}
          y1={line.y}
          x2={viewWidth - padding.right}
          y2={line.y}
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray={idx === 0 ? '0' : '4,4'}
        />
      ))}

      {/* Y Axis Labels */}
      {labelsY.map((label, idx) => (
        <text
          key={idx}
          x={padding.left - 10}
          y={label.y + 4}
          textAnchor="end"
          fill="#64748B"
          fontSize="11px"
          fontWeight="500"
        >
          {label.val}
        </text>
      ))}

      {/* X Axis Labels */}
      {labelsX.map((label, idx) => (
        <text
          key={idx}
          x={label.x}
          y={height - padding.bottom + 20}
          textAnchor="middle"
          fill="#64748B"
          fontSize="11px"
          fontWeight="500"
        >
          {label.text}
        </text>
      ))}

      {/* Area under the line */}
      {areaPoints && (
        <polygon
          points={areaPoints}
          fill="url(#lineGrad)"
        />
      )}

      {/* Predicted Line (Dashed) */}
      {pointsPredicted && (
        <polyline
          fill="none"
          stroke={predictedColor}
          strokeWidth="2"
          strokeDasharray="5,5"
          points={pointsPredicted}
        />
      )}

      {/* Main Line */}
      {points && (
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      )}

      {/* Data Nodes */}
      {data.map((d, i) => {
        const stepX = (viewWidth - padding.left - padding.right) / (data.length - 1);
        const chartHeight = height - padding.top - padding.bottom;
        const maxVal = Math.max(...data.flatMap(d => [d.value, d.predicted ?? 0]), 10);
        const roundedMax = Math.ceil(maxVal / 10) * 10;
        const scaleY = chartHeight / roundedMax;
        const cx = padding.left + i * stepX;
        const cy = padding.top + chartHeight - d.value * scaleY;

        return (
          <g key={i} className="chart-node">
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill="#FFFFFF"
              stroke={color}
              strokeWidth="3"
            />
            <circle
              cx={cx}
              cy={cy}
              r="12"
              fill={color}
              fillOpacity="0"
              style={{ cursor: 'pointer' }}
            >
              <title>{`${d.label}: Actual ${d.value}${d.predicted !== undefined ? `, Predicted ${d.predicted}` : ''}`}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
};

// ----------------------------------------------------
// 3. Bar Chart (for resource utilization / stats)
// ----------------------------------------------------
interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 240,
  color = '#2563EB',
}) => {
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };

  const { bars, gridLines, labelsX, labelsY } = useMemo(() => {
    if (!data || data.length === 0) {
      return { bars: [], gridLines: [], labelsX: [], labelsY: [] };
    }

    const maxVal = Math.max(...data.map(d => d.value), 10);
    const roundedMax = Math.ceil(maxVal / 10) * 10;

    const chartHeight = height - padding.top - padding.bottom;
    const chartWidth = 500;

    const scaleY = chartHeight / roundedMax;
    const barSpacing = chartWidth / data.length;
    const barWidth = barSpacing * 0.55;

    const brs = data.map((d, i) => {
      const x = padding.left + i * barSpacing + (barSpacing - barWidth) / 2;
      const barH = d.value * scaleY;
      const y = padding.top + chartHeight - barH;

      return {
        x,
        y,
        width: barWidth,
        height: barH,
        val: d.value,
        label: d.label
      };
    });

    const gLines: { y: number; val: number }[] = [];
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((roundedMax / 4) * i);
      const y = padding.top + chartHeight - val * scaleY;
      gLines.push({ y, val });
    }

    const lblsX = data.map((d, i) => ({
      x: padding.left + i * barSpacing + barSpacing / 2,
      text: d.label
    }));

    return {
      bars: brs,
      gridLines: gLines,
      labelsX: lblsX,
      labelsY: gLines
    };
  }, [data, height]);

  const viewWidth = 500 + padding.left + padding.right;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${viewWidth} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
      {/* Grid Lines */}
      {gridLines.map((line, idx) => (
        <line
          key={idx}
          x1={padding.left}
          y1={line.y}
          x2={viewWidth - padding.right}
          y2={line.y}
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray={idx === 0 ? '0' : '4,4'}
        />
      ))}

      {/* Y Axis Labels */}
      {labelsY.map((label, idx) => (
        <text
          key={idx}
          x={padding.left - 10}
          y={label.y + 4}
          textAnchor="end"
          fill="#64748B"
          fontSize="11px"
          fontWeight="500"
        >
          {label.val}%
        </text>
      ))}

      {/* X Axis Labels */}
      {labelsX.map((label, idx) => (
        <text
          key={idx}
          x={label.x}
          y={height - padding.bottom + 20}
          textAnchor="middle"
          fill="#64748B"
          fontSize="11px"
          fontWeight="500"
        >
          {label.text}
        </text>
      ))}

      {/* Bars with Rounded Tops */}
      {bars.map((bar, idx) => (
        <g key={idx}>
          <rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={Math.max(bar.height, 2)}
            rx="4"
            fill={color}
            opacity="0.85"
            style={{ transition: 'all 0.5s ease', cursor: 'pointer' }}
          >
            <title>{`${bar.label}: ${bar.val}%`}</title>
          </rect>
        </g>
      ))}
    </svg>
  );
};

// ----------------------------------------------------
// 4. Donut Chart (for distribution)
// ----------------------------------------------------
interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerTitle?: string;
  centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  thickness = 22,
  centerTitle = 'Occupied',
  centerValue = '82%',
}) => {
  const center = size / 2;
  const radius = size / 2 - thickness;
  const circumference = 2 * Math.PI * radius;

  // Calculate total and angles
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const slices = useMemo(() => {
    let accumulatedAngle = 0;
    return data.map((item) => {
      const percentage = total > 0 ? item.value / total : 0;
      const strokeLength = percentage * circumference;
      const strokeOffset = circumference - strokeLength + accumulatedAngle;
      accumulatedAngle -= strokeLength;

      return {
        ...item,
        strokeLength,
        strokeOffset,
        percentage: Math.round(percentage * 100)
      };
    });
  }, [data, total, circumference]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Base circle background */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={thickness}
          />
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={`${slice.strokeLength} ${circumference}`}
              strokeDashoffset={slice.strokeOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            >
              <title>{`${slice.name}: ${slice.value} (${slice.percentage}%)`}</title>
            </circle>
          ))}
        </svg>
        
        {/* Center Text Container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {centerTitle}
          </span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '-2px' }}>
            {centerValue}
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
        {slices.map((slice, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: slice.color
              }}
            />
            <span style={{ fontWeight: 500, color: '#475569', flex: 1 }}>{slice.name}</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>{slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. Heatmap (for hospital live capacity tracking)
// ----------------------------------------------------
interface HeatmapChartProps {
  rows: string[];
  cols: string[];
  matrix: number[][]; // rows x cols values from 0 to 100
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  rows,
  cols,
  matrix
}) => {
  // Color mapping: 0-40 (green), 40-70 (yellow), 70-85 (orange), 85-100 (red)
  const getCellColor = (value: number) => {
    if (value < 40) return '#D1FAE5'; // light emerald green
    if (value < 70) return '#FEF3C7'; // light orange-yellow
    if (value < 85) return '#FFE4E6'; // light rose-orange
    return '#FEE2E2'; // light red
  };

  const getTextColor = (value: number) => {
    if (value < 40) return '#065F46';
    if (value < 70) return '#92400E';
    if (value < 85) return '#9F1239';
    return '#991B1B';
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', textAlign: 'left', fontWeight: 600, color: '#475569' }}>
              Department
            </th>
            {cols.map((col, idx) => (
              <th key={idx} style={{ padding: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 600, color: '#1E293B', backgroundColor: '#FFFFFF', whiteSpace: 'nowrap' }}>
                {row}
              </td>
              {cols.map((_, cIdx) => {
                const value = matrix[rIdx]?.[cIdx] ?? 0;
                return (
                  <td
                    key={cIdx}
                    style={{
                      padding: '10px',
                      border: '1px solid #E2E8F0',
                      textAlign: 'center',
                      fontWeight: 700,
                      backgroundColor: getCellColor(value),
                      color: getTextColor(value),
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {value}%
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
