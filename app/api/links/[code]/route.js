import { NextResponse } from 'next/server';
import { getCollection, ensureDatabase } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    await ensureDatabase();
    const collection = await getCollection();
    const { code } = await params;
    const link = await collection.findOne({ code });
    
    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Convert MongoDB document to response format
    const response = {
      id: link._id.toString(),
      code: link.code,
      target_url: link.target_url,
      click_count: link.click_count || 0,
      last_clicked_at: link.last_clicked_at,
      created_at: link.created_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await ensureDatabase();
    const collection = await getCollection();
    const { code } = await params;
    const result = await collection.deleteOne({ code });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await ensureDatabase();
    const collection = await getCollection();
    const { code } = await params;
    // Update click count and last clicked time
    const now = new Date();
    const result = await collection.findOneAndUpdate(
      { code },
      {
        $inc: { click_count: 1 },
        $set: { last_clicked_at: now }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Convert MongoDB document to response format
    const response = {
      id: result.value._id.toString(),
      code: result.value.code,
      target_url: result.value.target_url,
      click_count: result.value.click_count,
      last_clicked_at: result.value.last_clicked_at,
      created_at: result.value.created_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
