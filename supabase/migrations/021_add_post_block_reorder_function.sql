-- =====================================================
-- 021_add_post_block_reorder_function.sql
-- Add a safe reorder function for post blocks.
-- This keeps the existing unique(post_id, order_index) constraint intact
-- while allowing block order changes without unique conflicts.
-- =====================================================

CREATE OR REPLACE FUNCTION public.reorder_post_blocks(
    p_post_id uuid,
    p_block_ids uuid[]
)
RETURNS SETOF public.post_blocks
LANGUAGE plpgsql
AS $$
DECLARE
    block_count integer;
    provided_count integer;
    current_block_id uuid;
    block_index integer;
    temp_offset integer := 1000000;
BEGIN
    provided_count := COALESCE(array_length(p_block_ids, 1), 0);

    SELECT COUNT(*)
    INTO block_count
    FROM public.post_blocks
    WHERE post_id = p_post_id;

    IF provided_count = 0 THEN
        RAISE EXCEPTION 'No block ids provided';
    END IF;

    IF provided_count <> block_count THEN
        RAISE EXCEPTION 'Block count mismatch';
    END IF;

    IF (
        SELECT COUNT(DISTINCT block_id)
        FROM unnest(p_block_ids) AS block_id
    ) <> provided_count THEN
        RAISE EXCEPTION 'Duplicate block ids provided';
    END IF;

    UPDATE public.post_blocks
    SET order_index = order_index + temp_offset
    WHERE post_id = p_post_id;

    FOR block_index IN 1..array_length(p_block_ids, 1) LOOP
        current_block_id := p_block_ids[block_index];

        UPDATE public.post_blocks
        SET order_index = block_index - 1
        WHERE post_id = p_post_id
          AND id = current_block_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Block % not found for post %', current_block_id, p_post_id;
        END IF;
    END LOOP;

    RETURN QUERY
    SELECT *
    FROM public.post_blocks
    WHERE post_id = p_post_id
    ORDER BY order_index;
END;
$$;
