import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type AvatarId = "samurai" | "grunt" | "bat" | "brute" | "spitter" | "ninja" | "hound" | "wisp" | "archer" | "oni" | "shield" | "slime" | "monk" | "demon" | "skeleton" | "crawler" | "bomber" | "bombMinion" | "ram" | "warlock" | "golem" | "boss";
export interface PlayerProfile { id: string; username: string; avatarId: AvatarId; }

const avatars: AvatarId[] = ["samurai", "grunt", "bat", "brute", "spitter", "ninja", "hound", "wisp", "archer", "oni", "shield", "slime", "monk", "demon", "skeleton", "crawler", "bomber", "bombMinion", "ram", "warlock", "golem", "boss"];
function safeAvatar(value: unknown): AvatarId {
  return avatars.includes(value as AvatarId) ? value as AvatarId : "samurai";
}

export function normalizeUsername(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 _-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12);
  return normalized || "RONIN";
}

export function authErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const message = raw.toLowerCase();
  if (message.includes("password should contain")) return "A senha precisa ter letra maiúscula, letra minúscula e número.";
  if (message.includes("password should be at least") || message.includes("password must be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (message.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (message.includes("user already registered") || message.includes("already been registered")) return "Este e-mail já está cadastrado.";
  if (message.includes("signup is disabled")) return "O cadastro está desativado no Supabase.";
  if (message.includes("email address is invalid")) return "Digite um e-mail válido.";
  if (message.includes("unable to validate email") || message.includes("invalid email")) return "Digite um e-mail válido.";
  if (message.includes("missing email")) return "Digite seu e-mail.";
  if (message.includes("missing password")) return "Digite sua senha.";
  if (message.includes("rate limit") || message.includes("too many requests") || message.includes("email rate limit exceeded")) return "O serviço limitou novos envios de e-mail. Aguarde alguns minutos antes de tentar novamente.";
  if (message.includes("supabase não configurado")) return "O serviço de conta ainda não está configurado.";
  return "Não foi possível concluir. Verifique os dados e tente novamente.";
}

export async function loadProfile(user: User): Promise<PlayerProfile> {
  if (!supabase) throw new Error("Supabase não configurado");
  const { data, error } = await supabase.from("profiles").select("username, avatar_id").eq("id", user.id).maybeSingle();
  if (error) {
    return {
      id: user.id,
      username: normalizeUsername(String(user.user_metadata.username ?? "RONIN")),
      avatarId: safeAvatar(user.user_metadata.avatar_id),
    };
  }
  if (data) {
    return { id: user.id, username: normalizeUsername(data.username), avatarId: safeAvatar(data.avatar_id) };
  }
  const username = normalizeUsername(String(user.user_metadata.username ?? "RONIN"));
  const avatarId = safeAvatar(user.user_metadata.avatar_id);
  const { error: createError } = await supabase.from("profiles").insert({ id: user.id, username, avatar_id: avatarId });
  if (createError) throw createError;
  return { id: user.id, username, avatarId };
}

export async function saveProfile(profile: PlayerProfile) {
  if (!supabase) throw new Error("Supabase não configurado");
  const username = normalizeUsername(profile.username);
  const { error } = await supabase.from("profiles").upsert({ id: profile.id, username, avatar_id: profile.avatarId, updated_at: new Date().toISOString() });
  if (error) throw error;
  const { error: rankingAvatarError } = await supabase.rpc("sync_ranking_avatar", { p_avatar_id: profile.avatarId });
  if (rankingAvatarError) throw rankingAvatarError;
  await supabase.auth.updateUser({ data: { username, avatar_id: profile.avatarId } });
  return { ...profile, username };
}

function getAuthRedirectUrl(): string {
  const configured = (import.meta.env.VITE_SUPABASE_AUTH_REDIRECT_URL ?? "").trim();
  if (configured) return configured;

  if (typeof window === "undefined") return "http://localhost:5173/";

  const appUrl = new URL(window.location.href);
  appUrl.hash = "";
  appUrl.search = "";
  return appUrl.toString();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function signUp(email: string, password: string, username: string, avatarId: AvatarId) {
  if (!supabase) throw new Error("Supabase não configurado");
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error("Missing email");
  if (!password) throw new Error("Missing password");
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: { username: normalizeUsername(username), avatar_id: avatarId },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Não foi possível criar a conta.");
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error("Missing email");
  if (!password) throw new Error("Missing password");
  const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
  if (error) throw error;
}

export async function resetPassword(email: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error("Missing email");
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: getAuthRedirectUrl(),
  });
  if (error) throw error;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export async function deleteAccount() {
  if (!supabase) throw new Error("Supabase não configurado");
  const { error } = await supabase.functions.invoke("delete-account");
  if (error) throw error;
  await supabase.auth.signOut();
}