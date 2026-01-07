import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/inventory/[original_part_no]/movements
 * Get transaction movements for a specific part from vw_stock_card_movements
 * 
 * Returns: Array of movements (latest 20, ordered by transaction_date DESC)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { original_part_no: string } }
) {
  try {
    const { original_part_no } = params;

    // Query the view with parameterized query
    // View already orders by transaction_date DESC, created_at DESC
    // Limit to latest 20 rows
    const result = await prisma.$queryRaw<Array<{
      transaction_id: string | number;
      batch_id: string | number;
      batch_code: string;
      product_id: string | number;
      part_number: string;
      product_name: string;
      transaction_type: string;
      direction: string;
      quantity: number;
      unit_cost_local: number;
      total_cost_local: number;
      job_card_part_id: string | number | null;
      job_card_id: string | number | null;
      job_number: string | null;
      job_title: string | null;
      from_warehouse_id: string | number | null;
      from_warehouse_name: string | null;
      to_warehouse_id: string | number | null;
      to_warehouse_name: string | null;
      stock_adjustment_reason_id: string | number | null;
      adjustment_reason_code: string | null;
      adjustment_reason_description: string | null;
      created_by: string | number;
      approved_by: string | number | null;
      transaction_status: string;
      notes: string | null;
      transaction_date: Date | string;
      created_at: Date | string;
    }>>(
      Prisma.sql`
        SELECT 
          transaction_id,
          batch_id,
          batch_code,
          product_id,
          part_number,
          product_name,
          transaction_type,
          direction,
          quantity,
          unit_cost_local,
          total_cost_local,
          job_card_part_id,
          job_card_id,
          job_number,
          job_title,
          from_warehouse_id,
          from_warehouse_name,
          to_warehouse_id,
          to_warehouse_name,
          stock_adjustment_reason_id,
          adjustment_reason_code,
          adjustment_reason_description,
          created_by,
          approved_by,
          transaction_status,
          notes,
          transaction_date,
          created_at
        FROM vw_stock_card_movements
        WHERE part_number = ${original_part_no}
        ORDER BY transaction_date DESC, created_at DESC
        LIMIT 20
      `
    );

    // Return empty array if no movements found (not an error)
    if (!result || result.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Serialize dates and convert to consistent format
    const serialized = result.map((item) => ({
      transaction_id: String(item.transaction_id),
      batch_id: String(item.batch_id),
      batch_code: item.batch_code,
      product_id: String(item.product_id),
      part_number: item.part_number,
      product_name: item.product_name,
      transaction_type: item.transaction_type,
      direction: item.direction,
      quantity: Number(item.quantity),
      unit_cost_local: Number(item.unit_cost_local),
      total_cost_local: Number(item.total_cost_local),
      job_card_part_id: item.job_card_part_id ? String(item.job_card_part_id) : null,
      job_card_id: item.job_card_id ? String(item.job_card_id) : null,
      job_number: item.job_number,
      job_title: item.job_title,
      from_warehouse_id: item.from_warehouse_id ? String(item.from_warehouse_id) : null,
      from_warehouse_name: item.from_warehouse_name,
      to_warehouse_id: item.to_warehouse_id ? String(item.to_warehouse_id) : null,
      to_warehouse_name: item.to_warehouse_name,
      stock_adjustment_reason_id: item.stock_adjustment_reason_id 
        ? String(item.stock_adjustment_reason_id) 
        : null,
      adjustment_reason_code: item.adjustment_reason_code,
      adjustment_reason_description: item.adjustment_reason_description,
      created_by: String(item.created_by),
      approved_by: item.approved_by ? String(item.approved_by) : null,
      transaction_status: item.transaction_status,
      notes: item.notes,
      transaction_date: item.transaction_date instanceof Date 
        ? item.transaction_date.toISOString() 
        : String(item.transaction_date),
      created_at: item.created_at instanceof Date 
        ? item.created_at.toISOString() 
        : String(item.created_at),
    }));

    return NextResponse.json(serialized, { status: 200 });
  } catch (error: any) {
    console.error('[API] GET /api/inventory/[original_part_no]/movements - Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch movements', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

