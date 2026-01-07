import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/inventory
 * List all inventory items from vw_inventory_list
 * 
 * Returns: Array of inventory items with totals and status
 */
export async function GET(request: NextRequest) {
  try {
    // Query the view directly - it already filters for active products
    const result = await prisma.$queryRaw<Array<{
      product_id: string | number;
      part_number: string;
      product_name: string;
      description: string | null;
      unit_of_measure: string;
      is_active: number | boolean;
      total_received: number;
      in_stock: number;
      quarantine: number;
      wip: number;
      out: number;
      withheld: number;
      status: string;
      batch_count: number;
      created_at: Date | string;
      updated_at: Date | string;
    }>>(
      Prisma.sql`
        SELECT 
          product_id,
          part_number,
          product_name,
          description,
          unit_of_measure,
          is_active,
          total_received,
          in_stock,
          quarantine,
          wip,
          out,
          withheld,
          status,
          batch_count,
          created_at,
          updated_at
        FROM vw_inventory_list
        ORDER BY part_number ASC
      `
    );

    console.log('[API] GET /api/inventory - Raw result count:', result?.length || 0);

    // Serialize dates and convert to consistent format
    const serialized = result.map((item) => ({
      product_id: String(item.product_id),
      part_number: item.part_number,
      product_name: item.product_name,
      description: item.description,
      unit_of_measure: item.unit_of_measure,
      is_active: Boolean(item.is_active),
      total_received: Number(item.total_received),
      in_stock: Number(item.in_stock),
      quarantine: Number(item.quarantine),
      wip: Number(item.wip),
      out: Number(item.out),
      withheld: Number(item.withheld),
      status: item.status,
      batch_count: Number(item.batch_count),
      created_at: item.created_at instanceof Date 
        ? item.created_at.toISOString() 
        : String(item.created_at),
      updated_at: item.updated_at instanceof Date 
        ? item.updated_at.toISOString() 
        : String(item.updated_at),
    }));

    console.log('[API] GET /api/inventory - Serialized count:', serialized.length);

    return NextResponse.json(serialized, { status: 200 });
  } catch (error: any) {
    console.error('[API] GET /api/inventory - Error:', error);
    console.error('[API] GET /api/inventory - Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch inventory list', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

