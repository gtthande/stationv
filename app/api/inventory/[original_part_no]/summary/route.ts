import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/inventory/[original_part_no]/summary
 * Get inventory summary totals for a specific part from vw_inventory_part_totals
 * 
 * Returns: Summary totals (total_received, in_stock, quarantine, wip, out, withheld, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { original_part_no: string } }
) {
  try {
    const { original_part_no } = params;

    // Query the view with parameterized query
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
      out: number;
      withheld: number;
      calculated_total: number;
      balance_delta: number;
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
          out,
          withheld,
          calculated_total,
          balance_delta
        FROM vw_inventory_part_totals
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

    // Serialize the result
    const serialized = {
      product_id: String(item.product_id),
      part_number: item.part_number,
      product_name: item.product_name,
      description: item.description,
      unit_of_measure: item.unit_of_measure,
      total_received: Number(item.total_received),
      in_stock: Number(item.in_stock),
      quarantine: Number(item.quarantine),
      wip: Number(item.wip),
      out: Number(item.out),
      withheld: Number(item.withheld),
      calculated_total: Number(item.calculated_total),
      balance_delta: Number(item.balance_delta),
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

