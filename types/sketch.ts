export enum SketchMethod {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  ARTISTIC = 'artistic'
}

export interface SketchConfig {
  sigma_s?: number;
  sigma_r?: number;
  shade_factor?: number;
  kernel_size?: number;
  blur_type?: 'gaussian' | 'median' | 'bilateral';
  edge_preserve?: boolean;
  texture_enhance?: boolean;
  contrast?: number;
  brightness?: number;
  smoothing_factor?: number;
}

export interface SketchFile {
  id: string;
  originalKey: string;
  sketchKey?: string;
  originalUrl?: string;
  sketchUrl?: string;
  name: string;
  size: number;
  method: SketchMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface SketchProcessingOptions {
  method: SketchMethod;
  config?: SketchConfig;
}
