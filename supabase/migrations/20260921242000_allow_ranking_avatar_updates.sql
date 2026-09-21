-- Keep every saved difficulty row synchronized with the user's current profile avatar.

DROP POLICY IF EXISTS "users can update their rankings" ON public.ranking;
CREATE POLICY "users can update their rankings"
  ON public.ranking FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
