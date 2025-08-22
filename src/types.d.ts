export type Filter = {
  id: number;
  name: string;
  preview_url?: string;
};

export type Workflow = {
  id: number;
  name: string;
};

export type GenerationResponse = {
  id: string;
  status: string;
};

export type RetrievalResponse = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  output?: { images: string[] };
  error?: string;
};
