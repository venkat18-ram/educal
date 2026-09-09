import React from 'react';

export type Page = 'landing' | 'login' | 'calculators' | 'ask' | 'dashboard' | 'profile';

export interface StudentProfile {
  name: string;
  role: 'student';
  school?: string;
}

export interface ExpertProfile {
  name: string;
  role: 'expert';
  expertise?: string;
  bio?: string;
}

export type User = StudentProfile | ExpertProfile;

export interface CalculatorInput {
  name:string;
  label: string;
  type: 'number' | 'select' | 'textarea' | 'radio' | 'group';
  defaultValue?: string | number;
  tooltip?: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  dependsOn?: string;
  showWhen?: (string | number)[];
  inputs?: CalculatorInput[];
  gridCols?: number;
  min?: number;
  max?: number;
  step?: string | number;
  availableUnits?: { label: string; value: number }[];
}

export interface Calculator {
  name: string;
  description: string;
  category: string;
  inputs: CalculatorInput[];
  gridCols?: number;
  instructions?: string;
  hasCustomizableGraph?: boolean;
  formulas?: { equation: string; description: string }[];
  referenceMaterial?: { title: string; content: React.ReactNode }[];
}

export interface Question {
  id: number;
  text: string;
  student: string;
  status: 'Open' | 'Answered';
  answer?: string;
  dueDate?: string;
}

// Types for Calculator Graphing
export interface ChartDataset {
  label: string;
  data: (number | { x: number; y: number })[];
  [key: string]: any; 
}

export interface PlotData {
  type: 'line' | 'bar' | 'scatter' | 'doughnut';
  data: {
    labels?: (string | number)[];
    datasets: ChartDataset[];
  };
  options?: any;
}

export interface CalculationResult {
  text: string;
  steps?: string[];
  plotData?: PlotData;
}

export interface HistoryItem {
  id: number;
  inputs: any;
  result: CalculationResult;
}