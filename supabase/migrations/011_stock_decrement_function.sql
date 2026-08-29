-- Migration: 011_stock_decrement_function.sql
-- Race-safe stock decrement on payment success
-- Run this AFTER all previous migrations

-- Function to atomically decrement stock for an order's items
-- Uses SELECT ... FOR UPDATE to lock stock rows during transaction
CREATE OR REPLACE FUNCTION public.decrement_stock_on_payment(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_item record;
BEGIN
  -- Loop through order items, locking each stock row
  FOR v_item IN
    SELECT oi.product_id, oi.quantity, sl.quantity_on_hand
    FROM order_items oi
    JOIN stock_levels sl ON sl.product_id = oi.product_id
    WHERE oi.order_id = p_order_id
    FOR UPDATE OF sl  -- Row-level lock prevents concurrent decrement
  LOOP
    -- Check sufficient stock
    IF v_item.quantity_on_hand < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product % (available: %, requested: %)',
        v_item.product_id, v_item.quantity_on_hand, v_item.quantity;
    END IF;

    -- Decrement stock
    UPDATE stock_levels
    SET quantity_on_hand = quantity_on_hand - v_item.quantity,
        updated_at = now()
    WHERE product_id = v_item.product_id;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users (for API callback)
GRANT EXECUTE ON FUNCTION public.decrement_stock_on_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock_on_payment(uuid) TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION public.decrement_stock_on_payment(uuid) IS
'Atomically decrements stock for all items in an order. Uses row-level locks (FOR UPDATE) to prevent race conditions. Call only after payment verification succeeds.';