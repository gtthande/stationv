import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/inventory/[original_part_no]/wip
 * Get WIP allocations for a specific part (Phase 1: always returns empty)
 * 
 * Returns: Empty array (Phase 1: No job cards, no WIP)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { original_part_no: string } }
) {
  try {
    // Phase 1: No job cards, no WIP - always return empty array
    return NextResponse.json([], { status: 200 });
  } catch (error: any) {
    console.error('[API] GET /api/inventory/[original_part_no]/wip - Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch WIP allocations', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

