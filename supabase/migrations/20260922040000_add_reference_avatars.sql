-- Avatares adicionais baseados nas referencias do usuario.
-- Execute este arquivo uma vez no Supabase SQL Editor.

DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN SELECT conname FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%avatar_id%'
  LOOP EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', c.conname); END LOOP;
  FOR c IN SELECT conname FROM pg_constraint WHERE conrelid = 'public.ranking'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%avatar_id%'
  LOOP EXECUTE format('ALTER TABLE public.ranking DROP CONSTRAINT %I', c.conname); END LOOP;
END $$;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_avatar_id_check CHECK (avatar_id IN (
  'samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin',
  'bananaSamurai', 'strawberryKnight', 'orangeRonin', 'snowRonin', 'suitedHero', 'dressHero',
  'crimsonSkeleton', 'greenSlime', 'sinisterShadow'
));

ALTER TABLE public.ranking ADD CONSTRAINT ranking_avatar_id_check CHECK (avatar_id IN (
  'samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin',
  'bananaSamurai', 'strawberryKnight', 'orangeRonin', 'snowRonin', 'suitedHero', 'dressHero',
  'crimsonSkeleton', 'greenSlime', 'sinisterShadow'
));

CREATE OR REPLACE FUNCTION public.sync_ranking_avatar(p_avatar_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF p_avatar_id NOT IN (
    'samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin',
    'bananaSamurai', 'strawberryKnight', 'orangeRonin', 'snowRonin', 'suitedHero', 'dressHero',
    'crimsonSkeleton', 'greenSlime', 'sinisterShadow'
  ) THEN RAISE EXCEPTION 'invalid avatar'; END IF;
  UPDATE public.ranking SET avatar_id = p_avatar_id WHERE user_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.sync_ranking_avatar(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_ranking_avatar(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_ranking(
  p_difficulty TEXT, p_score INTEGER, p_wave INTEGER, p_kills INTEGER,
  p_survival_time_seconds INTEGER, p_player_name TEXT DEFAULT NULL, p_avatar_id TEXT DEFAULT NULL
) RETURNS public.ranking LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_user_id UUID := auth.uid();
  claimed_user_id UUID;
  saved public.ranking;
  profile_row public.profiles;
  final_player_name TEXT;
  final_avatar_id TEXT;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF p_difficulty NOT IN ('facil', 'medio', 'dificil') THEN RAISE EXCEPTION 'invalid difficulty'; END IF;
  IF p_score IS NULL OR p_score NOT BETWEEN 0 AND 10000000
    OR p_wave IS NULL OR p_wave NOT BETWEEN 1 AND 10000
    OR p_kills IS NULL OR p_kills NOT BETWEEN 0 AND 1000000
    OR p_survival_time_seconds IS NULL OR p_survival_time_seconds NOT BETWEEN 0 AND 86400
  THEN RAISE EXCEPTION 'invalid ranking statistics'; END IF;

  SELECT * INTO profile_row FROM public.profiles WHERE id = current_user_id;
  final_player_name := UPPER(BTRIM(COALESCE(NULLIF(p_player_name, ''), profile_row.username, 'RONIN')));
  final_player_name := REGEXP_REPLACE(final_player_name, '\s+', ' ', 'g');
  IF char_length(final_player_name) NOT BETWEEN 1 AND 12 OR final_player_name !~ '^[A-Z0-9 _-]+$'
  THEN RAISE EXCEPTION 'invalid player name'; END IF;

  final_avatar_id := BTRIM(COALESCE(NULLIF(p_avatar_id, ''), profile_row.avatar_id, 'samurai'));
  IF final_avatar_id NOT IN (
    'samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin',
    'bananaSamurai', 'strawberryKnight', 'orangeRonin', 'snowRonin', 'suitedHero', 'dressHero',
    'crimsonSkeleton', 'greenSlime', 'sinisterShadow'
  ) THEN RAISE EXCEPTION 'invalid avatar'; END IF;

  INSERT INTO public.ranking_submission_limits (user_id, last_submit_at)
  VALUES (current_user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET last_submit_at = EXCLUDED.last_submit_at
  WHERE public.ranking_submission_limits.last_submit_at <= NOW() - INTERVAL '30 seconds'
  RETURNING user_id INTO claimed_user_id;
  IF claimed_user_id IS NULL THEN RAISE EXCEPTION 'ranking submission rate limit exceeded'; END IF;

  INSERT INTO public.ranking (user_id, player_name, avatar_id, difficulty, score, wave, kills, survival_time_seconds)
  VALUES (current_user_id, final_player_name, final_avatar_id, p_difficulty, p_score, p_wave, p_kills, p_survival_time_seconds)
  ON CONFLICT (user_id, difficulty) DO UPDATE SET
    player_name = EXCLUDED.player_name, avatar_id = EXCLUDED.avatar_id, score = EXCLUDED.score,
    wave = EXCLUDED.wave, kills = EXCLUDED.kills, survival_time_seconds = EXCLUDED.survival_time_seconds, created_at = NOW()
  WHERE EXCLUDED.score > public.ranking.score
     OR (EXCLUDED.score = public.ranking.score AND EXCLUDED.wave > public.ranking.wave)
  RETURNING * INTO saved;

  IF saved.id IS NULL THEN
    SELECT * INTO saved FROM public.ranking WHERE user_id = current_user_id AND difficulty = p_difficulty;
  END IF;
  RETURN saved;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_ranking(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_ranking(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT) TO authenticated;