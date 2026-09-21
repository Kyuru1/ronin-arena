-- Keep all ranking rows for the authenticated user synchronized without
-- allowing direct client updates to the ranking table.
CREATE OR REPLACE FUNCTION public.sync_ranking_avatar(p_avatar_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF p_avatar_id NOT IN ('samurai', 'ninja', 'oni', 'boss', 'bat') THEN
    RAISE EXCEPTION 'invalid avatar';
  END IF;

  UPDATE public.ranking
  SET avatar_id = p_avatar_id
  WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.sync_ranking_avatar(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_ranking_avatar(TEXT) TO authenticated;