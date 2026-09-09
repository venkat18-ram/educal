

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calculator as CalculatorType, CalculationResult, HistoryItem, CalculatorInput, PlotData } from '../types';
import { ArrowLeft, Play, Loader, HelpCircle, Trash2, History, RefreshCw, Download, Share2, FileText, Info, Star, Undo2, Redo2, Settings, X, Eye, EyeOff, ChevronDown, BookOpen, SlidersHorizontal, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { solve } from '../services/calculatorService';
import * as historyService from '../services/historyService';
import * as calculatorStateService from '../services/calculatorStateService';
import * as favoritesService from '../services/favoritesService';
import { addRecentCalculator } from '../services/recentCalculatorsService';
import Tooltip from './ui/Tooltip';
import Highlight from './ui/Highlight';
import GraphView, { GraphViewRef } from './GraphView';
import jsPDF from 'jspdf';
import { Chart as ChartJS } from 'chart.js';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryState } from '../hooks/useHistoryState';

// --- Refactored Grid Layout Logic ---
const gridColClasses: { [key: number]: string } = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
};

const getGridLayoutClasses = (cols?: number): string => {
    if (cols && gridColClasses[cols]) {
        // Return a full set of grid classes for a consistent, aligned layout
        return `md:grid ${gridColClasses[cols]} md:gap-4 md:space-y-0 md:items-end`;
    }
    // Default to a simple vertical stack
    return 'space-y-4';
};


interface CalculatorViewProps {
  calculator: CalculatorType;
  onBack: () => void;
  navigateToAskWithContext: (calculatorName: string, inputs: any, result: CalculationResult) => void;
}

// Debounce utility function
function debounce<F extends (...args: any[]) => void>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

const FormWrapper = ({ onSubmit, isLoading, children, onReset }: { onSubmit: (e: React.FormEvent) => void, isLoading: boolean, children?: React.ReactNode, onReset?: () => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <div className="mt-8 flex justify-end items-center gap-4">
             {onReset && (
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onReset}
                    className="px-6 py-3 bg-white/10 text-white rounded-md font-semibold hover:bg-white/20 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
                 >
                    <RefreshCw className="w-5 h-5" />
                    Clear
                 </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-2 disabled:bg-indigo-800 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                Calculate
            </motion.button>
        </div>
    </form>
);

// --- DYNAMIC FORM COMPONENTS ---

interface DynamicInputProps {
    input: CalculatorInput;
    formData: any;
    handleChange: (e: React.ChangeEvent<any>) => void;
}
const DynamicInput: React.FC<DynamicInputProps> = ({ input, formData, handleChange }) => {
    const value = formData[input.name] || '';

    // Consistent styling classes for high visibility
    const inputBaseClass = "bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

    const labelAndTooltip = (
      <div className="flex items-center gap-2 mb-1">
        <label htmlFor={input.name} className="block text-sm font-medium text-gray-300">{input.label}</label>
        {input.tooltip && (
          <Tooltip content={input.tooltip}>
            <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
          </Tooltip>
        )}
      </div>
    );
    
    if (input.type === 'group') {
        if (input.dependsOn && !input.showWhen?.includes(formData[input.dependsOn])) {
            return null;
        }
        return (
            <div className={cn(input.label ? 'mt-4 pt-4 border-t border-white/10' : '')}>
              {input.label && <p className="text-gray-400 mb-2">{input.label}</p>}
              <div className={getGridLayoutClasses(input.gridCols)}>
                {input.inputs?.map(childInput => (
                    <DynamicInput key={childInput.name} input={childInput} formData={formData} handleChange={handleChange} />
                ))}
              </div>
            </div>
        );
    }

    if (input.type === 'radio') {
      return (
        <div>
          {labelAndTooltip}
          <div className="flex items-center gap-4 pt-2 flex-wrap">
            {input.options?.map(option => (
              <label key={option.value} className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  name={input.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  aria-label={`${input.label} - ${option.label}`}
                  className="w-4 h-4 text-indigo-600 bg-black/20 border-gray-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      );
    }
    
    if (input.type === 'textarea') {
        return (
            <div>
                {labelAndTooltip}
                <textarea
                    id={input.name}
                    name={input.name}
                    value={value}
                    onChange={handleChange}
                    required={input.required}
                    placeholder={input.placeholder}
                    aria-label={input.label}
                    className={`${inputBaseClass} w-full rounded-md py-3 px-4 min-h-[100px]`}
                />
            </div>
        );
    }
    
    if (input.type === 'select') {
        return (
            <div>
                {labelAndTooltip}
                 <div className="relative">
                    <select
                        id={input.name}
                        name={input.name}
                        value={value}
                        onChange={handleChange}
                        aria-label={input.label}
                        className={`${inputBaseClass} w-full rounded-md appearance-none py-3 px-4 pr-10`}
                    >
                        {input.options?.map(option => (
                            <option key={option.value} value={option.value} className="bg-gray-900 text-white">{option.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
            </div>
        );
    }

    // Numeric Input with optional Units
    return (
        <div>
            {labelAndTooltip}
            <div className="flex relative">
                 <input
                    id={input.name}
                    name={input.name}
                    type={input.type}
                    value={value}
                    onChange={handleChange}
                    required={input.required}
                    placeholder={input.placeholder}
                    step={input.step}
                    min={input.min}
                    max={input.max}
                    aria-label={input.label}
                    className={cn(
                        inputBaseClass,
                        "py-3 px-4",
                        input.availableUnits ? "rounded-l-md rounded-r-none border-r-0 flex-1 min-w-0 w-auto" : "rounded-md w-full"
                    )}
                />
                {input.availableUnits && (
                    <div className="relative min-w-[85px] w-[30%] max-w-[120px]">
                         <select
                            name={`${input.name}_unit`}
                            value={formData[`${input.name}_unit`] || input.availableUnits[0].value}
                            onChange={handleChange}
                            className="w-full h-full appearance-none bg-white/5 border border-white/10 rounded-r-md rounded-l-none py-3 px-3 pr-7 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all truncate hover:bg-white/10 cursor-pointer"
                        >
                            {input.availableUnits.map((unit) => (
                                <option key={unit.label} value={unit.value} className="bg-gray-900 text-white">{unit.label}</option>
                            ))}
                        </select>
                         <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                )}
            </div>
        </div>
    );
};

interface DynamicFormProps {
    inputsMetadata: CalculatorInput[];
    onCalculate: (inputs: any) => void;
    isLoading: boolean;
    formData: any;
    onFormDataChange: (name: string, value: any) => void;
    gridCols?: number;
    onReset?: () => void;
}
const DynamicForm: React.FC<DynamicFormProps> = ({ inputsMetadata, onCalculate, isLoading, formData, onFormDataChange, gridCols, onReset }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onFormDataChange(name, value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCalculate(formData);
    };

    return (
        <FormWrapper onSubmit={handleSubmit} isLoading={isLoading} onReset={onReset}>
            <div className={getGridLayoutClasses(gridCols)}>
                {inputsMetadata.map(input => (
                    <DynamicInput key={input.name} input={input} formData={formData} handleChange={handleChange} />
                ))}
            </div>
        </FormWrapper>
    );
};


// --- Main Component ---
const getInitialFormState = (inputsMetadata: CalculatorInput[], initialValues: any = {}) => {
    const initialState: { [key: string]: any } = {};
    const populateState = (inputs: CalculatorInput[]) => {
        inputs.forEach(input => {
            if (input.type === 'group' && input.inputs) {
                populateState(input.inputs);
            } else if (input.name) {
                initialState[input.name] = initialValues?.[input.name] ?? input.defaultValue ?? '';
                if (input.availableUnits) {
                     initialState[`${input.name}_unit`] = initialValues?.[`${input.name}_unit`] ?? input.availableUnits[0].value;
                }
            }
        });
    };
    if (inputsMetadata) {
        populateState(inputsMetadata);
    }
    return initialState;
};

// --- Helper to get numeric inputs recursively ---
const getNumericInputs = (inputList: CalculatorInput[], formData: any): CalculatorInput[] => {
    let acc: CalculatorInput[] = [];
    inputList.forEach(input => {
        if (input.type === 'number') {
            // Only include if it doesn't seem to be an ID or non-adjustable
            acc.push(input);
        } else if (input.type === 'group') {
             if (!input.dependsOn || (input.showWhen && input.showWhen.includes(formData[input.dependsOn]))) {
                 if (input.inputs) {
                     acc = [...acc, ...getNumericInputs(input.inputs, formData)];
                 }
             }
        }
    });
    return acc;
};

// --- Reference Modal ---
const ReferenceModal: React.FC<{ materials: {title: string, content: React.ReactNode}[], onClose: () => void }> = ({ materials, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-400" /> Reference Material
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {materials.map((item, idx) => (
                        <div key={idx}>
                            <h4 className="font-semibold text-indigo-300 mb-2">{item.title}</h4>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                                {item.content}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Plot Customization Panel ---
const PlotCustomizer: React.FC<{ plotData: PlotData, onPlotDataChange: (newPlotData: PlotData) => void, onClose: () => void }> = ({ plotData, onPlotDataChange, onClose }) => {
    
    const handleOptionChange = (path: string, value: any) => {
        const newPlotData = JSON.parse(JSON.stringify(plotData)); // Deep copy
        let current = newPlotData;
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        onPlotDataChange(newPlotData);
    };

    const handleDatasetChange = (datasetIndex: number, prop: string, value: any) => {
        const newPlotData = { ...plotData, data: { ...plotData.data, datasets: [...plotData.data.datasets] } };
        newPlotData.data.datasets[datasetIndex] = { ...newPlotData.data.datasets[datasetIndex], [prop]: value };
        onPlotDataChange(newPlotData);
    }

    const hasScales = plotData.type !== 'doughnut';

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-gray-900/95 backdrop-blur-lg border-l border-white/10 shadow-2xl z-50 flex flex-col"
        >
             {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0 bg-gray-900">
                <h3 className="font-semibold text-white">Customize Graph</h3>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto bg-gray-900/50 flex-grow">
                {/* General Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-indigo-400 text-sm uppercase tracking-wider">General</h4>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Chart Title</label>
                        <input
                            type="text"
                            value={plotData.options?.plugins?.title?.text || ''}
                            onChange={(e) => handleOptionChange('options.plugins.title.text', e.target.value)}
                            aria-label="Chart Title"
                            className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Legend</label>
                            <select
                                value={plotData.options?.plugins?.legend?.display === false ? 'hidden' : (plotData.options?.plugins?.legend?.position || 'top')}
                                onChange={(e) => {
                                    if (e.target.value === 'hidden') {
                                        handleOptionChange('options.plugins.legend.display', false);
                                    } else {
                                        handleOptionChange('options.plugins.legend.display', true);
                                        handleOptionChange('options.plugins.legend.position', e.target.value);
                                    }
                                }}
                                className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                                <option value="hidden">Hidden</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Axis Settings */}
                {hasScales && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                         <h4 className="font-medium text-indigo-400 text-sm uppercase tracking-wider">Axes</h4>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">X-Axis Label</label>
                            <input
                                type="text"
                                value={plotData.options?.scales?.x?.title?.text || ''}
                                onChange={(e) => handleOptionChange('options.scales.x.title.text', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        {Object.keys(plotData.options?.scales || {}).filter(k => k.startsWith('y')).map(yAxisKey => (
                            <div key={yAxisKey} className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Y-Axis Label ({yAxisKey})</label>
                                <input
                                    type="text"
                                    value={plotData.options?.scales?.[yAxisKey]?.title?.text || ''}
                                    onChange={(e) => handleOptionChange(`options.scales.${yAxisKey}.title.text`, e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        ))}
                         <div className="grid grid-cols-2 gap-4 mt-2">
                             <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                                 <input
                                     type="checkbox"
                                     checked={plotData.options?.scales?.x?.grid?.display !== false}
                                     onChange={(e) => handleOptionChange('options.scales.x.grid.display', e.target.checked)}
                                     className="rounded bg-black/20 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                                 />
                                 Show X Grid
                             </label>
                             <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                                 <input
                                     type="checkbox"
                                     checked={plotData.options?.scales?.y?.grid?.display !== false}
                                     onChange={(e) => handleOptionChange('options.scales.y.grid.display', e.target.checked)}
                                     className="rounded bg-black/20 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                                 />
                                 Show Y Grid
                             </label>
                         </div>
                    </div>
                )}
                
                {/* Datasets */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="font-medium text-indigo-400 text-sm uppercase tracking-wider">Datasets</h4>
                    {plotData.data.datasets.map((dataset, index) => (
                        <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <input
                                    type="text"
                                    value={dataset.label}
                                    onChange={(e) => handleDatasetChange(index, 'label', e.target.value)}
                                    aria-label={`Dataset ${index + 1} Label`}
                                    className="w-full bg-transparent text-white font-semibold text-sm focus:outline-none border-b border-transparent focus:border-indigo-500 placeholder-gray-500"
                                    placeholder="Dataset Label"
                                />
                                <div className="flex gap-1">
                                    <Tooltip content={dataset.hidden ? "Show Dataset" : "Hide Dataset"}>
                                        <button onClick={() => handleDatasetChange(index, 'hidden', !dataset.hidden)} className={`p-1.5 rounded-md transition-colors ${dataset.hidden ? 'bg-white/10 text-gray-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            {dataset.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={(dataset.borderColor || dataset.backgroundColor) as string || '#818cf8'}
                                            onChange={(e) => handleDatasetChange(index, (plotData.type === 'line' || plotData.type === 'scatter') ? 'borderColor' : 'backgroundColor', e.target.value)}
                                            className="w-full h-8 rounded cursor-pointer bg-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Width (px)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={dataset.borderWidth ?? 2}
                                        onChange={(e) => handleDatasetChange(index, 'borderWidth', Number(e.target.value))}
                                        className="w-full bg-black/20 border border-white/10 rounded py-1.5 px-2 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                             {(plotData.type === 'line' || plotData.type === 'scatter') && (
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Point Size</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            value={dataset.pointRadius ?? (plotData.type === 'scatter' ? 5 : 3)}
                                            onChange={(e) => handleDatasetChange(index, 'pointRadius', Number(e.target.value))}
                                            className="w-full bg-black/20 border border-white/10 rounded py-1.5 px-2 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {plotData.type === 'line' && (
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Line Style</label>
                                             <select
                                                value={dataset.tension > 0 ? 'curved' : 'straight'}
                                                onChange={(e) => handleDatasetChange(index, 'tension', e.target.value === 'curved' ? 0.4 : 0)}
                                                className="w-full bg-black/20 border border-white/10 rounded py-1.5 px-2 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="straight">Straight</option>
                                                <option value="curved">Smooth</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {plotData.type === 'line' && (
                                <div className="pt-2">
                                     <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white">
                                        <input 
                                            type="checkbox" 
                                            checked={dataset.fill || false} 
                                            onChange={(e) => handleDatasetChange(index, 'fill', e.target.checked)}
                                            className="rounded bg-black/20 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                                        />
                                        Fill Area Under Line
                                    </label>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// --- What If Analysis Component ---
const WhatIfAnalysis: React.FC<{ 
    inputs: CalculatorInput[], 
    formData: any, 
    onUpdate: (name: string, value: number) => void 
}> = ({ inputs, formData, onUpdate }) => {
    
    const adjustableInputs = getNumericInputs(inputs, formData);

    if (adjustableInputs.length === 0) return null;

    return (
        <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30 mt-6">
            <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">What If Analysis</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">Adjust the sliders to see how changes impact the result in real-time.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adjustableInputs.map(input => {
                     const currentValue = Number(formData[input.name]) || 0;
                     // Determine reasonable range if not provided
                     const min = input.min ?? 0;
                     const max = input.max ?? (currentValue > 0 ? currentValue * 3 : 100); 
                     const step = input.step ?? (max - min) / 100;
                     
                     return (
                         <div key={input.name} className="flex flex-col gap-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{input.label}</span>
                                <span className="text-white font-mono">{currentValue}</span>
                            </div>
                            <input 
                                type="range"
                                min={min}
                                max={max}
                                step={step}
                                value={currentValue}
                                onChange={(e) => onUpdate(input.name, parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                         </div>
                     );
                })}
            </div>
        </div>
    );
};

const CalculatorView: React.FC<CalculatorViewProps> = ({ calculator, onBack, navigateToAskWithContext }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showPlotCustomizer, setShowPlotCustomizer] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showReference, setShowReference] = useState(false);
    const graphRef = useRef<GraphViewRef>(null);
    
    // Form State
    const [formData, setFormData] = useState<any>(() => {
        const savedState = calculatorStateService.loadCalculatorState(calculator.name);
        return savedState || getInitialFormState(calculator.inputs);
    });

    const { state: formState, setState: setFormState, undo, redo, canUndo, canRedo, resetState } = useHistoryState(formData);

    // Sync formData with history state
    useEffect(() => {
        setFormData(formState);
    }, [formState]);
    
    useEffect(() => {
        setHistory(historyService.getHistory(calculator.name));
        addRecentCalculator(calculator);
        
        // Load state or init
        const saved = calculatorStateService.loadCalculatorState(calculator.name);
        if (saved) {
             resetState(saved);
        } else {
             resetState(getInitialFormState(calculator.inputs));
        }
        setResult(null);
    }, [calculator.name]); // Only re-run when calculator changes

    useEffect(() => {
        calculatorStateService.saveCalculatorState(calculator.name, formData);
    }, [formData, calculator.name]);

    const handleCalculate = async (data: any) => {
        setIsLoading(true);
        // Simulate async if needed, but solve is synchronous
        await new Promise(resolve => setTimeout(resolve, 300)); 
        
        const res = solve(calculator.name, data);
        setResult(res);
        setIsLoading(false);
        
        if (res.text && !res.text.startsWith('Error')) {
             const updatedHistory = historyService.addHistoryItem(calculator.name, { inputs: data, result: res });
             setHistory(updatedHistory);
        }
    };

    const handleFormDataChange = (name: string, value: any) => {
        setFormState((prev: any) => ({ ...prev, [name]: value }));
    };
    
    const handleReset = () => {
        const emptyState = getInitialFormState(calculator.inputs);
        resetState(emptyState);
        setResult(null);
    };

    const loadHistoryItem = (item: HistoryItem) => {
        resetState(item.inputs);
        setResult(item.result);
        setShowHistory(false);
    };

    const exportPDF = () => {
        if (!result) return;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(calculator.name, 10, 10);
        
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(result.text, 180);
        doc.text(splitText, 10, 20);
        
        if (result.steps) {
             doc.addPage();
             doc.text("Steps:", 10, 10);
             let y = 20;
             result.steps.forEach(step => {
                 const splitStep = doc.splitTextToSize(step, 180);
                 doc.text(splitStep, 10, y);
                 y += 10 * splitStep.length;
             });
        }
        
        doc.save(`${calculator.name}_result.pdf`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="flex gap-2">
                     <button onClick={undo} disabled={!canUndo} className="p-2 text-gray-400 hover:text-white disabled:opacity-30">
                        <Undo2 className="w-5 h-5" />
                    </button>
                    <button onClick={redo} disabled={!canRedo} className="p-2 text-gray-400 hover:text-white disabled:opacity-30">
                        <Redo2 className="w-5 h-5" />
                    </button>
                    <Tooltip content="History">
                        <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-md transition-colors ${showHistory ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                            <History className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-grow space-y-6">
                    <div className="bg-black/20 p-6 rounded-xl border border-white/10 relative">
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-2xl font-bold text-white mb-2">{calculator.name}</h1>
                                <p className="text-gray-400 mb-6">{calculator.description}</p>
                             </div>
                             {calculator.referenceMaterial && (
                                 <button 
                                     onClick={() => setShowReference(true)}
                                     className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md hover:bg-indigo-500/20 transition-colors text-sm"
                                 >
                                     <BookOpen className="w-4 h-4" /> Formulas
                                 </button>
                             )}
                        </div>
                        
                        {calculator.instructions && (
                             <div className="mb-6 bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-md">
                                 <div className="flex items-start gap-3">
                                     <Info className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                     <p className="text-sm text-gray-300 whitespace-pre-wrap">{calculator.instructions}</p>
                                 </div>
                             </div>
                        )}

                        <DynamicForm 
                            inputsMetadata={calculator.inputs} 
                            onCalculate={() => handleCalculate(formData)} 
                            isLoading={isLoading} 
                            formData={formData} 
                            onFormDataChange={handleFormDataChange}
                            gridCols={calculator.gridCols}
                            onReset={handleReset}
                        />
                    </div>

                    {/* Result Section */}
                    <AnimatePresence>
                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-6"
                        >
                            <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-white">Result</h2>
                                    <div className="flex gap-2">
                                         <button onClick={() => navigateToAskWithContext(calculator.name, formData, result)} className="text-xs flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded hover:bg-indigo-600/30 transition-colors">
                                            <HelpCircle className="w-3 h-3" /> Ask Expert
                                        </button>
                                        <button onClick={exportPDF} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-900/50 rounded-lg border border-white/5 font-mono text-lg text-green-400 whitespace-pre-wrap">
                                    {result.text}
                                </div>

                                {result.steps && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-white mb-3">Step-by-Step Solution</h3>
                                        <div className="space-y-2">
                                            {result.steps.map((step, idx) => (
                                                <div key={idx} className="flex gap-3 text-gray-300">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-gray-500 mt-0.5">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="prose prose-invert max-w-none text-sm">
                                                        {/* Simple parsing for bolding */}
                                                        {step.split(/(\*\*.*?\*\*)/).map((part, i) => 
                                                            part.startsWith('**') && part.endsWith('**') 
                                                                ? <strong key={i} className="text-white">{part.slice(2, -2)}</strong> 
                                                                : part
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {result.plotData && (
                                <div className="bg-black/20 p-6 rounded-xl border border-white/10 relative group">
                                    <div className="flex justify-between items-center mb-4">
                                         <h2 className="text-xl font-bold text-white">Visualization</h2>
                                         <div className="flex items-center gap-2">
                                             <div className="text-xs text-gray-500 mr-2 flex items-center gap-1">
                                                <span className="hidden sm:inline">Hold 'Ctrl' to Zoom</span>
                                             </div>
                                             {calculator.hasCustomizableGraph && (
                                                 <button onClick={() => setShowPlotCustomizer(true)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded hover:bg-indigo-500/20 transition-colors">
                                                     <Settings className="w-4 h-4" /> Customize
                                                 </button>
                                             )}
                                         </div>
                                    </div>
                                    <div className="h-[400px] relative">
                                        <GraphView ref={graphRef} plotData={result.plotData} />
                                        
                                        {/* Reset Zoom Button Overlay */}
                                        <div className="absolute bottom-4 right-4 z-10">
                                             <button 
                                                onClick={() => graphRef.current?.resetZoom()}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 border border-white/10 text-white text-xs rounded-md hover:bg-indigo-600 transition-colors backdrop-blur-sm shadow-md"
                                             >
                                                 <Maximize2 className="w-3 h-3" /> Reset View
                                             </button>
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {showPlotCustomizer && (
                                            <PlotCustomizer 
                                                plotData={result.plotData} 
                                                onPlotDataChange={(newData) => setResult(prev => prev ? ({ ...prev, plotData: newData }) : null)}
                                                onClose={() => setShowPlotCustomizer(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                            
                            <WhatIfAnalysis 
                                inputs={calculator.inputs} 
                                formData={formData} 
                                onUpdate={(name, value) => {
                                    handleFormDataChange(name, value);
                                    // Debounce calculation ideally, but direct call for responsiveness here
                                    handleCalculate({ ...formData, [name]: value }); 
                                }}
                            />

                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                
                {/* History Sidebar (Mobile: Modal / Desktop: Sidebar) */}
                <AnimatePresence>
                    {showHistory && (
                         <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-full lg:w-80 flex-shrink-0 bg-black/20 p-4 rounded-xl border border-white/10 h-fit lg:sticky lg:top-4"
                         >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white">History</h3>
                                <button onClick={() => {
                                    historyService.clearHistory(calculator.name);
                                    setHistory([]);
                                }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Clear
                                </button>
                            </div>
                            
                            {history.length > 0 ? (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                    {history.map((item) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => loadHistoryItem(item)}
                                            className="p-3 bg-white/5 rounded-md hover:bg-white/10 cursor-pointer transition-colors group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                 <span className="text-xs text-gray-500">{new Date(item.id).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-sm text-green-400 font-mono truncate">{item.result.text.split('\n')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No history yet.</p>
                            )}
                         </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <AnimatePresence>
                {showReference && calculator.referenceMaterial && (
                    <ReferenceModal 
                        materials={calculator.referenceMaterial} 
                        onClose={() => setShowReference(false)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalculatorView;