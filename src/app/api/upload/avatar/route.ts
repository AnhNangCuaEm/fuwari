import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('avatar') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `avatar-${uuidv4()}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await writeFile(join(uploadsDir, '.gitkeep'), '');
    } catch {
      // Directory might already exist, that's ok
    }

    // Write the file
    await writeFile(filePath, buffer);

    // Return the public URL
    const imageUrl = `/uploads/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
