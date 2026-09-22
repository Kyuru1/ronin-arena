UPDATE public.profiles
SET avatar_id = 'samurai'
WHERE avatar_id IS NULL OR avatar_id NOT IN ('samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin');

UPDATE public.ranking
SET avatar_id = 'samurai'
WHERE avatar_id IS NULL OR avatar_id NOT IN ('samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin');

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_avatar_id_check;
ALTER TABLE public.ranking DROP CONSTRAINT IF EXISTS ranking_avatar_id_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_avatar_id_check
  CHECK (avatar_id IN ('samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin'));
ALTER TABLE public.ranking ADD CONSTRAINT ranking_avatar_id_check
  CHECK (avatar_id IN ('samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin'));

CREATE OR REPLACE FUNCTION public.sync_ranking_avatar(p_avatar_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF p_avatar_id NOT IN ('samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin') THEN RAISE EXCEPTION 'invalid avatar'; END IF;
  UPDATE public.ranking SET avatar_id = p_avatar_id WHERE user_id = auth.uid();
END;
$$;
