-- Expande o ranking detalhado para as raças e armas raciais.`r`n-- Deve ser executada após 20260923010000_add_ranking_run_details.sql.`r`n-- Snapshot detalhado da melhor run de cada jogador/dificuldade.
-- Compatível com linhas antigas: os novos campos têm defaults ou aceitam NULL.
ALTER TABLE public.ranking
  ADD COLUMN IF NOT EXISTS race_id TEXT,
  ADD COLUMN IF NOT EXISTS perk_id TEXT,
  ADD COLUMN IF NOT EXISTS weapons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS game_mode TEXT NOT NULL DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS run_details JSONB NOT NULL DEFAULT '{}'::JSONB;

ALTER TABLE public.ranking DROP CONSTRAINT IF EXISTS ranking_race_id_check;
ALTER TABLE public.ranking ADD CONSTRAINT ranking_race_id_check
  CHECK (race_id IS NULL OR race_id IN ('divinity', 'human', 'oni', 'elf', 'dwarf', 'giant', 'orc', 'goblin', 'draconic', 'godHunter', 'oniBlood', 'spiritualHeir', 'ronin', 'survivor'));

ALTER TABLE public.ranking DROP CONSTRAINT IF EXISTS ranking_perk_id_check;
ALTER TABLE public.ranking ADD CONSTRAINT ranking_perk_id_check
  CHECK (perk_id IS NULL OR perk_id IN (
    'bladeMonk', 'bloodContract', 'bottomlessPocket', 'predatorInstinct',
    'sharpGlass', 'kyuEcho', 'cursedArsenal', 'lastBullet'
  ));

ALTER TABLE public.ranking DROP CONSTRAINT IF EXISTS ranking_weapons_check;
ALTER TABLE public.ranking ADD CONSTRAINT ranking_weapons_check
  CHECK (
    cardinality(weapons) <= 9
    AND weapons <@ ARRAY['katana', 'bow', 'hammer', 'shield', 'mine', 'book', 'staff', 'harp', 'godslayer']::TEXT[]
  );

ALTER TABLE public.ranking DROP CONSTRAINT IF EXISTS ranking_coins_check;
ALTER TABLE public.ranking ADD CONSTRAINT ranking_coins_check CHECK (coins BETWEEN 0 AND 100000000);

ALTER TABLE public.ranking DROP CONSTRAINT IF EXISTS ranking_game_mode_check;
ALTER TABLE public.ranking ADD CONSTRAINT ranking_game_mode_check CHECK (game_mode IN ('solo', 'coop'));

ALTER TABLE public.ranking DROP CONSTRAINT IF EXISTS ranking_run_details_check;
ALTER TABLE public.ranking ADD CONSTRAINT ranking_run_details_check
  CHECK (jsonb_typeof(run_details) = 'object' AND pg_column_size(run_details) <= 16384);

DROP VIEW IF EXISTS public.top_50_ranking;
CREATE VIEW public.top_50_ranking AS
SELECT
  ranked.id,
  ranked.user_id,
  ranked.player_name,
  ranked.avatar_id,
  ranked.difficulty,
  ranked.score,
  ranked.wave,
  ranked.kills,
  ranked.survival_time_seconds,
  ranked.created_at,
  ranked.race_id,
  ranked.perk_id,
  ranked.weapons,
  ranked.coins,
  ranked.game_mode,
  ranked.run_details,
  ranked.placement
FROM (
  SELECT
    ranking.*,
    ROW_NUMBER() OVER (
      PARTITION BY difficulty
      ORDER BY score DESC, wave DESC, kills DESC, survival_time_seconds DESC, created_at ASC, id ASC
    ) AS placement
  FROM public.ranking
) AS ranked
WHERE ranked.placement <= 50;

CREATE OR REPLACE FUNCTION public.submit_ranking_details(
  p_difficulty TEXT,
  p_score INTEGER,
  p_wave INTEGER,
  p_kills INTEGER,
  p_survival_time_seconds INTEGER,
  p_player_name TEXT,
  p_avatar_id TEXT,
  p_race_id TEXT,
  p_perk_id TEXT,
  p_weapons TEXT[],
  p_coins INTEGER,
  p_game_mode TEXT,
  p_run_details JSONB
) RETURNS public.ranking
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  claimed_user_id UUID;
  saved public.ranking;
  profile_row public.profiles;
  final_player_name TEXT;
  final_avatar_id TEXT;
  safe_weapons TEXT[] := COALESCE(p_weapons, ARRAY[]::TEXT[]);
  safe_details JSONB := COALESCE(p_run_details, '{}'::JSONB);
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF p_difficulty NOT IN ('facil', 'medio', 'dificil') THEN
    RAISE EXCEPTION 'invalid difficulty';
  END IF;

  IF p_score IS NULL OR p_score NOT BETWEEN 0 AND 10000000
    OR p_wave IS NULL OR p_wave NOT BETWEEN 1 AND 10000
    OR p_kills IS NULL OR p_kills NOT BETWEEN 0 AND 1000000
    OR p_survival_time_seconds IS NULL OR p_survival_time_seconds NOT BETWEEN 0 AND 86400
    OR p_coins IS NULL OR p_coins NOT BETWEEN 0 AND 100000000
  THEN
    RAISE EXCEPTION 'invalid ranking statistics';
  END IF;

  IF p_race_id IS NOT NULL AND p_race_id NOT IN ('divinity', 'human', 'oni', 'elf', 'dwarf', 'giant', 'orc', 'goblin', 'draconic', 'godHunter', 'oniBlood', 'spiritualHeir', 'ronin', 'survivor') THEN
    RAISE EXCEPTION 'invalid race';
  END IF;

  IF p_perk_id IS NOT NULL AND p_perk_id NOT IN (
    'bladeMonk', 'bloodContract', 'bottomlessPocket', 'predatorInstinct',
    'sharpGlass', 'kyuEcho', 'cursedArsenal', 'lastBullet'
  ) THEN
    RAISE EXCEPTION 'invalid perk';
  END IF;

  IF cardinality(safe_weapons) > 9
    OR NOT (safe_weapons <@ ARRAY['katana', 'bow', 'hammer', 'shield', 'mine', 'book', 'staff', 'harp', 'godslayer']::TEXT[])
  THEN
    RAISE EXCEPTION 'invalid weapons';
  END IF;

  IF p_game_mode NOT IN ('solo', 'coop') THEN
    RAISE EXCEPTION 'invalid game mode';
  END IF;

  IF jsonb_typeof(safe_details) <> 'object' OR pg_column_size(safe_details) > 16384 THEN
    RAISE EXCEPTION 'invalid run details';
  END IF;

  SELECT * INTO profile_row FROM public.profiles WHERE id = current_user_id;
  final_player_name := UPPER(BTRIM(COALESCE(NULLIF(p_player_name, ''), profile_row.username, 'RONIN')));
  final_player_name := REGEXP_REPLACE(final_player_name, '\s+', ' ', 'g');
  IF char_length(final_player_name) NOT BETWEEN 1 AND 12 OR final_player_name !~ '^[A-Z0-9 _-]+$' THEN
    RAISE EXCEPTION 'invalid player name';
  END IF;

  final_avatar_id := BTRIM(COALESCE(NULLIF(p_avatar_id, ''), profile_row.avatar_id, 'samurai'));
  IF final_avatar_id NOT IN (
    'samurai', 'azureRonin', 'violetRonin', 'goldRonin', 'jadeRonin', 'shadowRonin',
    'bananaSamurai', 'strawberryKnight', 'orangeRonin', 'snowRonin', 'suitedHero', 'dressHero',
    'crimsonSkeleton', 'greenSlime', 'sinisterShadow'
  ) THEN
    RAISE EXCEPTION 'invalid avatar';
  END IF;

  INSERT INTO public.ranking_submission_limits (user_id, last_submit_at)
  VALUES (current_user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET last_submit_at = EXCLUDED.last_submit_at
  WHERE public.ranking_submission_limits.last_submit_at <= NOW() - INTERVAL '30 seconds'
  RETURNING user_id INTO claimed_user_id;

  IF claimed_user_id IS NULL THEN
    RAISE EXCEPTION 'ranking submission rate limit exceeded';
  END IF;

  INSERT INTO public.ranking (
    user_id, player_name, avatar_id, difficulty, score, wave, kills, survival_time_seconds,
    race_id, perk_id, weapons, coins, game_mode, run_details
  ) VALUES (
    current_user_id, final_player_name, final_avatar_id, p_difficulty, p_score, p_wave, p_kills,
    p_survival_time_seconds, p_race_id, p_perk_id, safe_weapons, p_coins, p_game_mode, safe_details
  )
  ON CONFLICT (user_id, difficulty) DO UPDATE SET
    player_name = EXCLUDED.player_name,
    avatar_id = EXCLUDED.avatar_id,
    score = EXCLUDED.score,
    wave = EXCLUDED.wave,
    kills = EXCLUDED.kills,
    survival_time_seconds = EXCLUDED.survival_time_seconds,
    race_id = EXCLUDED.race_id,
    perk_id = EXCLUDED.perk_id,
    weapons = EXCLUDED.weapons,
    coins = EXCLUDED.coins,
    game_mode = EXCLUDED.game_mode,
    run_details = EXCLUDED.run_details,
    created_at = NOW()
  WHERE EXCLUDED.score > public.ranking.score
     OR (EXCLUDED.score = public.ranking.score AND EXCLUDED.wave > public.ranking.wave)
  RETURNING * INTO saved;

  IF saved.id IS NULL THEN
    SELECT * INTO saved
    FROM public.ranking
    WHERE user_id = current_user_id AND difficulty = p_difficulty;
  END IF;

  RETURN saved;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_ranking_details(
  TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT[], INTEGER, TEXT, JSONB
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_ranking_details(
  TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT[], INTEGER, TEXT, JSONB
) TO authenticated;

