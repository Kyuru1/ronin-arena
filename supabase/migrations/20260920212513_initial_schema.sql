CREATE TABLE ranking (
  id BIGSERIAL PRIMARY KEY,
  player_name VARCHAR(12) NOT NULL DEFAULT 'RONIN',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  score INTEGER NOT NULL CHECK (score >= 0),
  wave INTEGER NOT NULL CHECK (wave >= 1),
  kills INTEGER NOT NULL CHECK (kills >= 0),
  survival_time_seconds INTEGER NOT NULL CHECK (survival_time_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ranking_best_scores_by_difficulty
ON ranking (
  difficulty,
  score DESC,
  wave DESC,
  kills DESC,
  survival_time_seconds DESC,
  created_at ASC
);

CREATE VIEW top_50_ranking AS
SELECT
  id,
  player_name,
  difficulty,
  score,
  wave,
  kills,
  survival_time_seconds,
  created_at
FROM (
  SELECT
    ranking.*,
    ROW_NUMBER() OVER (
      PARTITION BY difficulty
      ORDER BY score DESC, wave DESC, kills DESC, survival_time_seconds DESC, created_at ASC
    ) AS rank_position
  FROM ranking
) ranked
WHERE rank_position <= 50
ORDER BY
  difficulty ASC,
  score DESC,
  wave DESC,
  kills DESC,
  survival_time_seconds DESC,
  created_at ASC;

CREATE OR REPLACE FUNCTION trim_ranking_to_top_50()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM ranking
  WHERE id IN (
    SELECT id
    FROM (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY difficulty
          ORDER BY score DESC, wave DESC, kills DESC, survival_time_seconds DESC, created_at ASC
        ) AS rank_position
      FROM ranking
    ) ranked
    WHERE rank_position > 50
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ranking_keep_only_top_50
AFTER INSERT ON ranking
FOR EACH STATEMENT
EXECUTE FUNCTION trim_ranking_to_top_50();