


import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Line, Bar, Scatter, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  TimeSeriesScale,
  TooltipItem
} from 'chart.js';
import { PlotData } from '../types';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  TimeSeriesScale,
  zoomPlugin
);

interface GraphViewProps {
  plotData: PlotData;
}

export interface GraphViewRef {
  resetZoom: () => void;
}

const GraphView = forwardRef<GraphViewRef, GraphViewProps>(({ plotData }, ref) => {
    const chartRef = useRef<ChartJS>(null);

    useImperativeHandle(ref, () => ({
        resetZoom: () => {
            if (chartRef.current) {
                chartRef.current.resetZoom();
            }
        }
    }));
    
    const defaultOptions: any = {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#e5e7eb',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Calculation Graph',
                color: '#e5e7eb',
                font: {
                    size: 16,
                    family: "'Inter', sans-serif",
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#e5e7eb',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 13,
                    family: "'Inter', sans-serif",
                    weight: 'bold'
                },
                bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                },
                displayColors: true,
                callbacks: {
                     label: function(context: TooltipItem<any>) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                             // Format numbers to avoid super long decimals in tooltips
                             const formatNum = (n: number) => {
                                 if (Math.abs(n) < 0.0001 && n !== 0) return n.toExponential(3);
                                 if (Math.abs(n) > 10000) return n.toExponential(3);
                                 return parseFloat(n.toFixed(4));
                             };
                             
                             const xVal = context.parsed.x;
                             const yVal = context.parsed.y;
                             
                             // For scatter or line charts representing math functions, showing (x, y) is helpful
                             if (plotData.type === 'scatter' || plotData.type === 'line') {
                                 label += `(${formatNum(xVal)}, ${formatNum(yVal)})`;
                             } else {
                                 label += formatNum(yVal);
                             }
                        }
                        return label;
                    }
                }
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                    modifierKey: undefined,
                },
                zoom: {
                    wheel: {
                        enabled: true,
                        modifierKey: 'ctrl',
                    },
                    pinch: {
                        enabled: true
                    },
                    drag: {
                        enabled: false, // Disable drag-select zoom to prioritize intuitive pan interactions
                    },
                    mode: 'xy',
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    }
                },
                title: {
                    display: true,
                    color: '#d1d5db',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    }
                },
                title: {
                    display: true,
                    color: '#d1d5db',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: 'bold'
                    }
                }
            }
        }
    };

    // Deep merge strategy for critical sections
    const finalOptions = {
        ...defaultOptions,
        ...plotData.options,
        plugins: {
            ...defaultOptions.plugins,
            ...(plotData.options?.plugins || {})
        },
        scales: {
            ...defaultOptions.scales,
            ...(plotData.options?.scales || {})
        }
    };

    switch (plotData.type) {
        case 'line':
            return <Line ref={chartRef} options={finalOptions} data={plotData.data} />;
        case 'bar':
            return <Bar ref={chartRef} options={finalOptions} data={plotData.data} />;
        case 'scatter':
            return <Scatter ref={chartRef} options={finalOptions} data={plotData.data} />;
        case 'doughnut':
            return <Doughnut ref={chartRef} options={finalOptions} data={plotData.data} />;
        default:
            return <div className="text-gray-400">Unsupported chart type.</div>;
    }
});

export default GraphView;
