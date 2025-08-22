/* eslint-disable react-hooks/rules-of-hooks */
import { useEdgeStore } from '../../../lib/edgestore';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { edgestore} = useEdgeStore()
  try {
    const { image } = await req.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image (base64 or blob) to File if necessary
    // Example assumes image is a base64 string with a mime type
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const fileObj = new File([buffer], 'upload.jpg', { type: mimeType });

    // Upload to edgestore
    const file = await edgestore.publicFiles.upload({
        file: fileObj,
        options: {
            temporary: true,
        },
        input: undefined
    });
    
    return NextResponse.json({ 
      url: file.url,
      path: file.path 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}