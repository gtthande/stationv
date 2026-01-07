import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/inventory/[original_part_no]/batches
 * Get all batches for a specific part from vw_stock_card_batches
 * 
 * Returns: Array of batches ordered by received_at ASC (FIFO)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { original_part_no: string } }
) {
  try {
    const { original_part_no } = params;

    // Query the view with parameterized query, ordered by received_date ASC (FIFO)
    const result = await prisma.$queryRaw<Array<{
      batch_id: string | number;
      product_id: string | number;
      part_number: string;
      product_name: string;
      batch_no: string;
      warehouse_id: string | number | null;
      warehouse_name: string | null;
      location_id: string | number | null;
      supplier_id: string | number | null;
      supplier_name: string | null;
      supplier_code: string | null;
      reference_doc: string | null;
      quantity_received: number;
      quantity_remaining: number;
      currency: string | null;
      fx_rate: number | null;
      landed_cost_per_unit: number | null;
      fitting_price_per_unit: number | null;
      status: string;
      expiry_date: Date | string | null;
      received_date: Date | string | null;
      created_at: Date | string;
      updated_at: Date | string;
      status_category: string;
      quantity_issued: number;
    }>>(
      Prisma.sql`
        SELECT 
          batch_id,
          product_id,
          part_number,
          product_name,
          batch_no,
          warehouse_id,
          warehouse_name,
          location_id,
          supplier_id,
          supplier_name,
          supplier_code,
          reference_doc,
          quantity_received,
          quantity_remaining,
          currency,
          fx_rate,
          landed_cost_per_unit,
          fitting_price_per_unit,
          status,
          expiry_date,
          received_date,
          created_at,
          updated_at,
          status_category,
          quantity_issued
        FROM vw_stock_card_batches
        WHERE part_number = ${original_part_no}
        ORDER BY received_date ASC
      `
    );

    // Return empty array if no batches found (not an error)
    if (!result || result.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Serialize dates and convert to consistent format
    const serialized = result.map((item) => ({
      batch_id: String(item.batch_id),
      product_id: String(item.product_id),
      part_number: item.part_number,
      product_name: item.product_name,
      batch_code: item.batch_no, // Map batch_no to batch_code for UI compatibility
      warehouse_id: item.warehouse_id ? String(item.warehouse_id) : null,
      warehouse_name: item.warehouse_name,
      location_id: item.location_id ? String(item.location_id) : null,
      supplier_id: item.supplier_id ? String(item.supplier_id) : null,
      supplier_name: item.supplier_name,
      supplier_code: item.supplier_code,
      reference_doc: item.reference_doc,
      received_quantity: Number(item.quantity_received),
      remaining_quantity: Number(item.quantity_remaining),
      currency: item.currency,
      fx_rate: item.fx_rate ? Number(item.fx_rate) : null,
      landed_cost_per_unit: item.landed_cost_per_unit ? Number(item.landed_cost_per_unit) : null,
      fitting_price_per_unit: item.fitting_price_per_unit ? Number(item.fitting_price_per_unit) : null,
      status: item.status,
      expiry_date: item.expiry_date 
        ? (item.expiry_date instanceof Date 
            ? item.expiry_date.toISOString().split('T')[0] 
            : String(item.expiry_date).split('T')[0])
        : null,
      received_by: null, // Not in view for Phase 1
      approved_by: null, // Not in view for Phase 1
      received_at: item.received_date 
        ? (item.received_date instanceof Date 
            ? item.received_date.toISOString() 
            : String(item.received_date))
        : null,
      approved_at: null, // Not in view for Phase 1
      created_at: item.created_at instanceof Date 
        ? item.created_at.toISOString() 
        : String(item.created_at),
      updated_at: item.updated_at instanceof Date 
        ? item.updated_at.toISOString() 
        : String(item.updated_at),
      status_category: item.status_category,
      quantity_issued: Number(item.quantity_issued),
    }));

    return NextResponse.json(serialized, { status: 200 });
  } catch (error: any) {
    console.error('[API] GET /api/inventory/[original_part_no]/batches - Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch batches', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

