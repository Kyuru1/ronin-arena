-- Destructive reset of the game's public data only.
-- auth.users is managed by Supabase and is intentionally preserved.

DROP VIEW IF EXISTS public.top_50_ranking;
DROP TABLE IF EXISTS public.ranking CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(12) NOT NULL,
  avatar_id TEXT NOT NULL DEFAULT 'samurai'
    CHECK (avatar_id IN ('samurai', 'ninja', 'oni', 'boss', 'bat')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX profiles_username_unique
  ON public.profiles (LOWER(BTRIM(username)));

CREATE TABLE public.ranking (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name VARCHAR(12) NOT NULL DEFAULT 'RONIN',
  avatar_id TEXT NOT NULL DEFAULT 'samurai'
    CHECK (avatar_id IN ('samurai', 'ninja', 'oni', 'boss', 'bat')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  score INTEGER NOT NULL CHECK (score >= 0),
  wave INTEGER NOT NULL CHECK (wave >= 1),
  kills INTEGER NOT NULL CHECK (kills >= 0),
  survival_time_seconds INTEGER NOT NULL CHECK (survival_time_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, difficulty)
);

CREATE INDEX ranking_difficulty_order
  ON public.ranking (difficulty, score DESC, wave DESC, kills DESC, survival_time_seconds DESC, created_at ASC);

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles are publicly readable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "users can create their profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "users can update their profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "ranking is publicly readable"
  ON public.ranking FOR SELECT USING (true);

CREATE POLICY "users can create their rankings"
  ON public.ranking FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.submit_ranking(
  p_difficulty TEXT,
  p_score INTEGER,
  p_wave INTEGER,
  p_kills INTEGER,
  p_survival_time_seconds INTEGER,
  p_player_name TEXT DEFAULT NULL,
  p_avatar_id TEXT DEFAULT NULL
)
RETURNS public.ranking
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  saved public.ranking;
  profile_row public.profiles;
  final_player_name TEXT;
  final_avatar_id TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF p_difficulty NOT IN ('facil', 'medio', 'dificil') THEN
    RAISE EXCEPTION 'invalid difficulty';
  END IF;

  SELECT * INTO profile_row
  FROM public.profiles
  WHERE id = current_user_id;

  final_player_name := COALESCE(NULLIF(BTRIM(COALESCE(p_player_name, profile_row.username, 'RONIN')), ''), 'RONIN');
  final_avatar_id := COALESCE(NULLIF(BTRIM(COALESCE(p_avatar_id, profile_row.avatar_id, 'samurai')), ''), 'samurai');

  IF final_avatar_id NOT IN ('samurai', 'ninja', 'oni', 'boss', 'bat') THEN
    final_avatar_id := 'samurai';
  END IF;

  INSERT INTO public.ranking (
    user_id, player_name, avatar_id, difficulty, score, wave, kills, survival_time_seconds
  ) VALUES (
    current_user_id,
    final_player_name,
    final_avatar_id,
    p_difficulty,
    GREATEST(p_score, 0),
    GREATEST(p_wave, 1),
    GREATEST(p_kills, 0),
    GREATEST(p_survival_time_seconds, 0)
  )
  ON CONFLICT (user_id, difficulty) DO UPDATE SET
    player_name = EXCLUDED.player_name,
    avatar_id = EXCLUDED.avatar_id,
    score = EXCLUDED.score,
    wave = EXCLUDED.wave,
    kills = EXCLUDED.kills,
    survival_time_seconds = EXCLUDED.survival_time_seconds,
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

REVOKE ALL ON FUNCTION public.submit_ranking(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_ranking(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT) TO authenticated;