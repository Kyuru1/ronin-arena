ALTER TABLE public.ranking
  ADD COLUMN IF NOT EXISTS avatar_id TEXT NOT NULL DEFAULT 'samurai';

UPDATE public.ranking AS ranking
SET
  player_name = COALESCE(NULLIF(BTRIM(ranking.player_name), ''), NULLIF(BTRIM(profiles.username), ''), 'RONIN'),
  avatar_id = CASE
    WHEN ranking.avatar_id IN ('samurai', 'ninja', 'oni', 'boss', 'bat') THEN ranking.avatar_id
    WHEN profiles.avatar_id IN ('samurai', 'ninja', 'oni', 'boss', 'bat') THEN profiles.avatar_id
    ELSE 'samurai'
  END
FROM public.profiles AS profiles
WHERE profiles.id = ranking.user_id
  AND (BTRIM(COALESCE(ranking.player_name, '')) = '' OR ranking.avatar_id IS NULL);

UPDATE public.ranking
SET
  player_name = COALESCE(NULLIF(BTRIM(player_name), ''), 'RONIN'),
  avatar_id = COALESCE(NULLIF(BTRIM(avatar_id), ''), 'samurai');

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