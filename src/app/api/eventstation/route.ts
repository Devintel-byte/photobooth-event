/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.phantaisia.com';
const BEARER_TOKEN = process.env.BEARER_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZpbnRlbCIsInNjb3BlcyI6InVzZXIifQ.ex3Nv5Y_gK2FFMwCRLTLTFbiiBVnky33xhZIgaJfkxc';

type Filter = { id: number; name: string; preview_url?: string };
type Workflow = { id: number; name: string };
type GenerationResponse = { id: string; status: string };
type RetrievalResponse = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  output?: { images: string[] };
  error?: string;
};

const handleError = (error: unknown, context: string) => {
  console.error(`[${context}] Error:`, error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'API request failed' },
    { status: 500 }
  );
};

export async function GET(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get('endpoint') || '/v1/filters/';
  
  try {
    // Handle multi-swap filters endpoint
    if (endpoint === '/v4/multi_swap_styles/') {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch multi-swap filters: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json({ data });
    }

    // Original filters and workflows endpoints
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`Non-JSON response from ${endpoint}:`, text);
        throw new Error(`Received non-JSON response: ${response.status}`);
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform filter/workflow response
    if (endpoint === '/v1/filters/') {
      const transformedData = Object.entries(data).map(([id, name]) => ({
        id: Number(id),
        name: name as string,
      }));
      return NextResponse.json({ data: transformedData });
    }
    
    if (endpoint === '/v1/workflows/') {
      const transformedData = Object.entries(data).map(([id, name]) => ({
        id: Number(id),
        name: name as string,
      }));
      return NextResponse.json({ data: transformedData });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error, `GET ${endpoint}`);
  }
}

export async function POST(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get('endpoint');
  
  try {
    const payload = await request.json();
    let url;

    // Handle multi-swap status check
    if (endpoint && endpoint.startsWith('/v3/status_multi_swap/')) {
      url = `${API_BASE_URL}${endpoint}`;
    } 
    // Handle multi-swap generation
    else if (endpoint === '/v3/run/multi_swap') {
      url = `${API_BASE_URL}${endpoint}`;
      if (!payload.input_image || payload.style_id === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields: input_image, style_id' }, 
          { status: 400 }
        );
      }
    } 
    // Original face swap endpoints
    else if (endpoint && endpoint.startsWith('/v2/status/')) {
      url = `${API_BASE_URL}${endpoint}`;
    } else {
      url = `${API_BASE_URL}/v1/run/face_swap`;
      if (
        !payload.base64 ||
        payload.filter_id === undefined ||
        payload.gender === undefined ||
        payload.capture_mode === undefined ||
        !payload.ratio
      ) {
        const missingFields = [];
        if (!payload.base64) missingFields.push('base64');
        if (!payload.filter_id) missingFields.push('filter_id');
        if (payload.gender === undefined) missingFields.push('gender');
        if (payload.capture_mode === undefined) missingFields.push('capture_mode');
        if (!payload.ratio) missingFields.push('ratio');
        
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(', ')}` }, 
          { status: 400 }
        );
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload || {}),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`Non-JSON response from ${url}:`, text);
        throw new Error(`Received non-JSON response: ${response.status}`);
      }
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || 'API request failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error, `POST ${endpoint || '/v1/run/face_swap'}`);
  }
}