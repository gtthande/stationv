import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/inventory/[original_part_no]/summary
 * Get inventory summary totals for a specific part (Phase 1: batch-only)
 * 
 * Returns: Summary totals calculated from batches directly
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { original_part_no: string } }
) {
  try {
    const { original_part_no } = params;

    // Query from vw_inventory_list view (Phase 1: batch-only)
    const result = await prisma.$queryRaw<Array<{
      product_id: string | number;
      part_number: string;
      product_name: string;
      description: string | null;
      unit_of_measure: string;
      total_received: number;
      in_stock: number;
      quarantine: number;
      wip: number;
      out_qty: number;
      withheld: number;
      status: string;
      batch_count: number;
    }>>(
      Prisma.sql`
        SELECT 
          product_id,
          part_number,
          product_name,
          description,
          unit_of_measure,
          total_received,
          in_stock,
          quarantine,
          wip,
          out_qty,
          withheld,
          status,
          batch_count
        FROM vw_inventory_list
        WHERE part_number = ${original_part_no}
        LIMIT 1
      `
    );

    // Handle "part not found"
    if (!result || result.length === 0) {
      return NextResponse.json(
        { 
          error: 'Part not found', 
          message: `No inventory data found for part number: ${original_part_no}` 
        },
        { status: 404 }
      );
    }

    const item = result[0];

    // Serialize the result (Phase 1: WIP, Out, Withheld are always 0)
    const serialized = {
      product_id: String(item.product_id),
      part_number: item.part_number,
      product_name: item.product_name,
      description: item.description,
      unit_of_measure: item.unit_of_measure,
      total_received: Number(item.total_received),
      in_stock: Number(item.in_stock),
      quarantine: Number(item.quarantine),
      wip: Number(item.wip), // Phase 1: Always 0
      out: Number(item.out_qty), // Phase 1: Always 0
      withheld: Number(item.withheld), // Phase 1: Always 0
      calculated_total: Number(item.in_stock) + Number(item.quarantine), // Phase 1: Simple total
      balance_delta: 0, // Phase 1: No balance tracking yet
    };

    return NextResponse.json(serialized, { status: 200 });
  } catch (error: any) {
    console.error('[API] GET /api/inventory/[original_part_no]/summary - Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch inventory summary', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

