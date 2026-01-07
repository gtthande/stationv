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

    // Query the view with parameterized query, ordered by received_at ASC (FIFO)
    const result = await prisma.$queryRaw<Array<{
      batch_id: string | number;
      product_id: string | number;
      part_number: string;
      product_name: string;
      batch_code: string;
      warehouse_id: string | number | null;
      warehouse_name: string | null;
      location_id: string | number | null;
      supplier_id: string | number | null;
      supplier_name: string | null;
      supplier_code: string | null;
      reference_doc: string | null;
      received_quantity: number;
      remaining_quantity: number;
      currency: string | null;
      fx_rate: number | null;
      landed_cost_per_unit: number | null;
      fitting_price_per_unit: number | null;
      status: string;
      expiry_date: Date | string | null;
      received_by: string | number | null;
      approved_by: string | number | null;
      received_at: Date | string | null;
      approved_at: Date | string | null;
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
          batch_code,
          warehouse_id,
          warehouse_name,
          location_id,
          supplier_id,
          supplier_name,
          supplier_code,
          reference_doc,
          received_quantity,
          remaining_quantity,
          currency,
          fx_rate,
          landed_cost_per_unit,
          fitting_price_per_unit,
          status,
          expiry_date,
          received_by,
          approved_by,
          received_at,
          approved_at,
          created_at,
          updated_at,
          status_category,
          quantity_issued
        FROM vw_stock_card_batches
        WHERE part_number = ${original_part_no}
        ORDER BY received_at ASC
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
      batch_code: item.batch_code,
      warehouse_id: item.warehouse_id ? String(item.warehouse_id) : null,
      warehouse_name: item.warehouse_name,
      location_id: item.location_id ? String(item.location_id) : null,
      supplier_id: item.supplier_id ? String(item.supplier_id) : null,
      supplier_name: item.supplier_name,
      supplier_code: item.supplier_code,
      reference_doc: item.reference_doc,
      received_quantity: Number(item.received_quantity),
      remaining_quantity: Number(item.remaining_quantity),
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
      received_by: item.received_by ? String(item.received_by) : null,
      approved_by: item.approved_by ? String(item.approved_by) : null,
      received_at: item.received_at 
        ? (item.received_at instanceof Date 
            ? item.received_at.toISOString() 
            : String(item.received_at))
        : null,
      approved_at: item.approved_at 
        ? (item.approved_at instanceof Date 
            ? item.approved_at.toISOString() 
            : String(item.approved_at))
        : null,
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

