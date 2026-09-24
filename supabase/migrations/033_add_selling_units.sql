-- Selling units for the pet-shop catalog.
-- DB stores machine codes only; Persian labels live in the app layer (UNIT_LABELS).
--
-- Decisions reflected here:
--  * Integer quantities only. Weight products use grams as the canonical unit;
--    there are NO decimal/decimal-ish quantity semantics anywhere.
--  * quantity_step: grid for the quantity stepper. Defaults to 1, optional,
--    admin-configurable.
--  * max_quantity: business cap. NOT NULL is NOT enforced; NEWS was that the
--    flat 99 cap must apply ONLY to count-based units (PIECE/BRANCH/BAG/PACKAGE)
--    and weight units get a separate high technical safety ceiling in the app.
--  * Existing rows: backfilled to selling_unit = 'PIECE' (current behavior),
--    never left NULL.

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS selling_unit  text    NOT NULL DEFAULT 'PIECE'
        CHECK (selling_unit IN ('GRAM', 'KILOGRAM', 'PIECE', 'BRANCH', 'BAG', 'PACKAGE')),
    ADD COLUMN IF NOT EXISTS quantity_step integer NOT NULL DEFAULT 1
        CHECK (quantity_step >= 1),
    ADD COLUMN IF NOT EXISTS min_quantity  integer NOT NULL DEFAULT 1
        CHECK (min_quantity >= 1),
    ADD COLUMN IF NOT EXISTS max_quantity  integer
        CHECK (max_quantity IS NULL OR max_quantity >= min_quantity);

CREATE INDEX IF NOT EXISTS products_selling_unit_idx
    ON public.products (selling_unit);

-- Historical order lines snapshot the selling unit + product name at purchase
-- time. Existing lines are backfilled to PIECE (== their original semantics).
ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS selling_unit text NOT NULL DEFAULT 'PIECE'
        CHECK (selling_unit IN ('GRAM', 'KILOGRAM', 'PIECE', 'BRANCH', 'BAG', 'PACKAGE')),
    ADD COLUMN IF NOT EXISTS product_name  text;

UPDATE public.order_items oi
SET product_name = p.name
FROM public.products p
WHERE oi.product_id = p.id
  AND oi.product_name IS NULL;