CREATE TABLE IF NOT EXISTS ranking (
  id BIGSERIAL PRIMARY KEY,
  player_name VARCHAR(12) NOT NULL DEFAULT 'RONIN',
  score INTEGER NOT NULL CHECK (score >= 0),
  wave INTEGER NOT NULL CHECK (wave >= 1),
  kills INTEGER NOT NULL CHECK (kills >= 0),
  survival_time_seconds INTEGER NOT NULL CHECK (survival_time_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ranking_best_scores
ON ranking (score DESC, wave DESC, kills DESC, survival_time_seconds DESC, created_at ASC);

CREATE OR REPLACE VIEW top_50_ranking AS
SELECT id, player_name, score, wave, kills, survival_time_seconds, created_at
FROM ranking
ORDER BY score DESC, wave DESC, kills DESC, survival_time_seconds DESC, created_at ASC
LIMIT 50;

CREATE OR REPLACE FUNCTION trim_ranking_to_top_50()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM ranking
  WHERE id NOT IN (
    SELECT id FROM ranking
    ORDER BY score DESC, wave DESC, kills DESC, survival_time_seconds DESC, created_at ASC
    LIMIT 50
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ranking_keep_only_top_50 ON ranking;
CREATE TRIGGER ranking_keep_only_top_50
AFTER INSERT ON ranking
FOR EACH STATEMENT
EXECUTE FUNCTION trim_ranking_to_top_50();
