ALTER TABLE public.ranking
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ranking_user_id
  ON public.ranking (user_id);

ALTER TABLE public.ranking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ranking is publicly readable" ON public.ranking;
CREATE POLICY "ranking is publicly readable"
  ON public.ranking FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "authenticated users can insert their ranking" ON public.ranking;
CREATE POLICY "authenticated users can insert their ranking"
  ON public.ranking FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.submit_ranking(
  p_difficulty TEXT,
  p_score INTEGER,
  p_wave INTEGER,
  p_kills INTEGER,
  p_survival_time_seconds INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  INSERT INTO public.ranking (
    user_id,
    player_name,
    difficulty,
    score,
    wave,
    kills,
    survival_time_seconds
  )
  SELECT
    auth.uid(),
    COALESCE(NULLIF(BTRIM(username), ''), 'RONIN'),
    p_difficulty,
    GREATEST(p_score, 0),
    GREATEST(p_wave, 1),
    GREATEST(p_kills, 0),
    GREATEST(p_survival_time_seconds, 0)
  FROM public.profiles
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    INSERT INTO public.ranking (
      user_id,
      player_name,
      difficulty,
      score,
      wave,
      kills,
      survival_time_seconds
    ) VALUES (
      auth.uid(),
      'RONIN',
      p_difficulty,
      GREATEST(p_score, 0),
      GREATEST(p_wave, 1),
      GREATEST(p_kills, 0),
      GREATEST(p_survival_time_seconds, 0)
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_ranking(TEXT, INTEGER, INTEGER, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_ranking(TEXT, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;