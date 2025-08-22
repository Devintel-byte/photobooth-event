// import { NextResponse } from 'next/server';
// import fs from 'fs/promises';
// import path from 'path';

// export async function GET() {
//   try {
//     const filePath = path.join(process.cwd(), 'public', 'Booth_overlay_PRE1.png');
//     const imageBuffer = await fs.readFile(filePath);

//     return new NextResponse(imageBuffer, {
//       status: 200,
//       headers: {
//         'Content-Type': 'image/png',
//         'Access-Control-Allow-Origin': '*',
//         'Cache-Control': 'public, max-age=31536000',
//       },
//     });
//   } catch (error) {
//     console.error('Error serving overlay image:', error);
//     return new NextResponse('Image not found', { status: 404 });
//   }
// }
