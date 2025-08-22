import { Filter, GenerationResponse, RetrievalResponse, Workflow } from "../types";

const API_BASE = '/api/eventstation';

export const getFilters = async (): Promise<Filter[]> => {
  try {
    const response = await fetch(API_BASE, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from API');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch filters: ${response.status}`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('getFilters error:', error);
    throw error;
  }
};

export const getWorkflows = async (): Promise<Workflow[]> => {
  try {
    const response = await fetch(`${API_BASE}?endpoint=/v1/workflows/`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from API');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch workflows: ${response.status}`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('getWorkflows error:', error);
    throw error;
  }
};

export const generateImage = async (payload: {
  base64: string;
  filter_id: number;
  gender: number;
  capture_mode: number;
  ratio: string | null;
}): Promise<GenerationResponse> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64: payload.base64,
        filter_id: payload.filter_id,
        gender: Number(payload.gender),
        capture_mode: Number(payload.capture_mode),
        ratio: payload.ratio,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from API');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `API Error: ${response.statusText} (${response.status})`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('generateImage error:', error);
    throw error;
  }
};

export const retrieveImage = async (job_id: string): Promise<RetrievalResponse> => {
  try {
    const response = await fetch(`${API_BASE}?endpoint=/v2/status/${job_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from API');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to retrieve image: ${response.statusText} (${response.status})`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('retrieveImage error:', error);
    throw error;
  }
};

export const pollForCompletion = async (
  job_id: string,
  interval = 2000,
  timeout = 60000
): Promise<RetrievalResponse> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await retrieveImage(job_id);
      
      if (result.status === 'COMPLETED') {
        return result;
      } else if (result.status === 'FAILED') {
        throw new Error(result.error || 'Image processing failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error('Polling error:', error);
      throw error;
    }
  }
  
  throw new Error('Polling timeout exceeded');
};

export const uploadImage = async (base64Data: string) => {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to edgestore');
    }

    return await response.json();
  } catch (error) {
    console.error('uploadImage error:', error);
    throw error;
  }
};

export const getMultiSwapFilters = async (): Promise<Record<string, string>> => {
  const response = await fetch(`${API_BASE}?endpoint=/v4/multi_swap_styles/`);
  const { data } = await response.json();
  return data;
};

export const generateMultiSwapImage = async (payload: {
  input_image: string;
  style_id: number;
  overlay: boolean;
}): Promise<GenerationResponse> => {
  const response = await fetch(`${API_BASE}?endpoint=/v3/run/multi_swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const { data } = await response.json();
  return data;
};

export const retrieveMultiSwapImage = async (job_id: string): Promise<RetrievalResponse> => {
  try {
    const response = await fetch(`${API_BASE}?endpoint=/v3/status_multi_swap/${job_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from API');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to retrieve multi image: ${response.statusText} (${response.status})`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('retrieveMultiImage error:', error);
    throw error;
  }
};

export const pollForMultiSwapCompletion = async (
  job_id: string,
  interval = 2000,
  timeout = 60000
): Promise<RetrievalResponse> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await retrieveMultiSwapImage(job_id);
      
      if (result.status === 'COMPLETED') {
        return result;
      } else if (result.status === 'FAILED') {
        throw new Error(result.error || 'Image processing failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error('Polling error:', error);
      throw error;
    }
  }
  
  throw new Error('Polling timeout exceeded');
};
