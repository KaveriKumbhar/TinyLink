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

    // Update click count and last clicked time
    // Use findOneAndUpdate to ensure atomic operation and wait for write acknowledgment
    const now = new Date();
    const updateResult = await collection.findOneAndUpdate(
      { code },
      {
        $inc: { click_count: 1 },
        $set: { last_clicked_at: now }
      },
      {
        returnDocument: 'after',
        // Ensure write is acknowledged before continuing
        writeConcern: { w: 'majority', wtimeout: 5000 }
      }
    );

    // Verify update was successful
    if (!updateResult || !updateResult.value) {
      console.error('Failed to update click count for code:', code);
      // Still redirect even if update fails
    } else {
      // Log successful update for debugging
      console.log('Click count updated for code:', code, 'New count:', updateResult.value.click_count);
    }

    // Perform 302 redirect
    return NextResponse.redirect(link.target_url, { status: 302 });
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
