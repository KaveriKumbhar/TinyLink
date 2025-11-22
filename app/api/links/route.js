import { NextResponse } from 'next/server';
import { getCollection, ensureDatabase } from '@/lib/db';
import { generateShortCode, isValidUrl, isValidCode } from '@/lib/utils';

export async function POST(request) {
  await ensureDatabase();
  const collection = await getCollection();

  try {
    const body = await request.json();
    const { url, code: customCode } = body;

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL. Please provide a valid http:// or https:// URL.' },
        { status: 400 }
      );
    }

    // Generate or validate code
    let code = customCode;
    if (!code) {
      code = generateShortCode();
      // Ensure uniqueness
      let exists = true;
      while (exists) {
        const existing = await collection.findOne({ code });
        if (!existing) {
          exists = false;
        } else {
          code = generateShortCode();
        }
      }
    } else {
      // Validate custom code
      if (!isValidCode(customCode)) {
        return NextResponse.json(
          { error: 'Invalid code. Only alphanumeric characters, hyphens, and underscores are allowed.' },
          { status: 400 }
        );
      }

      // Check if code already exists
      const existing = await collection.findOne({ code });
      if (existing) {
        return NextResponse.json(
          { error: 'Code already exists. Please choose a different code.' },
          { status: 409 }
        );
      }
    }

    // Insert the link
    const now = new Date();
    const link = {
      code,
      target_url: url,
      click_count: 0,
      last_clicked_at: null,
      created_at: now,
    };

    const result = await collection.insertOne(link);
    const insertedLink = await collection.findOne({ _id: result.insertedId });

    // Convert MongoDB _id to id for consistency
    const response = {
      id: insertedLink._id.toString(),
      code: insertedLink.code,
      target_url: insertedLink.target_url,
      click_count: insertedLink.click_count,
      last_clicked_at: insertedLink.last_clicked_at,
      created_at: insertedLink.created_at,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    
    // Handle duplicate key error (code already exists)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Code already exists. Please choose a different code.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  await ensureDatabase();
  const collection = await getCollection();

  try {
    const links = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    // Convert MongoDB documents to response format
    const response = links.map(link => ({
      id: link._id.toString(),
      code: link.code,
      target_url: link.target_url,
      click_count: link.click_count || 0,
      last_clicked_at: link.last_clicked_at,
      created_at: link.created_at,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
