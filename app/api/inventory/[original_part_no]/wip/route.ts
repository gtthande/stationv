import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/inventory/[original_part_no]/wip
 * Get WIP allocations for a specific part from vw_stock_card_wip
 * 
 * Returns: Array of WIP allocations (only OPEN job cards)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { original_part_no: string } }
) {
  try {
    const { original_part_no } = params;

    // Query the view with parameterized query
    // View already filters for OPEN jobs only (jc.status = 'OPEN')
    const result = await prisma.$queryRaw<Array<{
      job_card_part_id: string | number;
      job_card_id: string | number;
      job_number: string;
      job_title: string;
      job_status: string;
      batch_id: string | number;
      batch_code: string;
      product_id: string | number;
      part_number: string;
      product_name: string;
      quantity: number;
      unit_cost_local: number;
      unit_price_local: number;
      total_cost_local: number;
      total_price_local: number;
      source_type: string;
      issued_by: string | number | null;
      received_by: string | number | null;
      issued_at: Date | string;
      opened_at: Date | string | null;
      customer_id: string | number | null;
      customer_name: string | null;
      aircraft_reg: string | null;
    }>>(
      Prisma.sql`
        SELECT 
          job_card_part_id,
          job_card_id,
          job_number,
          job_title,
          job_status,
          batch_id,
          batch_code,
          product_id,
          part_number,
          product_name,
          quantity,
          unit_cost_local,
          unit_price_local,
          total_cost_local,
          total_price_local,
          source_type,
          issued_by,
          received_by,
          issued_at,
          opened_at,
          customer_id,
          customer_name,
          aircraft_reg
        FROM vw_stock_card_wip
        WHERE part_number = ${original_part_no}
      `
    );

    // Return empty array if no WIP found (not an error)
    if (!result || result.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Serialize dates and convert to consistent format
    const serialized = result.map((item) => ({
      job_card_part_id: String(item.job_card_part_id),
      job_card_id: String(item.job_card_id),
      job_number: item.job_number,
      job_title: item.job_title,
      job_status: item.job_status,
      batch_id: String(item.batch_id),
      batch_code: item.batch_code,
      product_id: String(item.product_id),
      part_number: item.part_number,
      product_name: item.product_name,
      quantity: Number(item.quantity),
      unit_cost_local: Number(item.unit_cost_local),
      unit_price_local: Number(item.unit_price_local),
      total_cost_local: Number(item.total_cost_local),
      total_price_local: Number(item.total_price_local),
      source_type: item.source_type,
      issued_by: item.issued_by ? String(item.issued_by) : null,
      received_by: item.received_by ? String(item.received_by) : null,
      issued_at: item.issued_at instanceof Date 
        ? item.issued_at.toISOString() 
        : String(item.issued_at),
      opened_at: item.opened_at 
        ? (item.opened_at instanceof Date 
            ? item.opened_at.toISOString() 
            : String(item.opened_at))
        : null,
      customer_id: item.customer_id ? String(item.customer_id) : null,
      customer_name: item.customer_name,
      aircraft_reg: item.aircraft_reg,
    }));

    return NextResponse.json(serialized, { status: 200 });
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

