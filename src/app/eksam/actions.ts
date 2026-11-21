"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/auth/admin";
import {
  clientIp,
  loginFlow,
  registerFlow,
  type AuthResult,
} from "@/lib/auth/flows";
import { createClient } from "@/lib/supabase/server";

export async function register(
  username: string,
  pin: string,
  pinRepeat: string,
): Promise<AuthResult> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const ip = clientIp((await headers()).get("x-forwarded-for"));
  let userId: string | null = null;

  return registerFlow(
    {
      async signupsFromIp(addr) {
        const { data } = await admin.rpc("signups_from_ip_last_hour", {
          p_ip: addr,
        });
        return data ?? 0;
      },
      async logSignupIp(addr) {
        await admin.from("signup_ips").insert({ ip: addr });
      },
      async signUp(email, pin) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pin,
        });
        if (error)
          return /already|registered|exists/i.test(error.message)
            ? "taken"
            : "error";
        // With e-mail confirmation off Supabase returns no error for an existing address,
        // but the user has no identities.
        if (data.user && data.user.identities?.length === 0) return "taken";
        if (!data.user || !data.session) return "error";
        userId = data.user.id;
        return "ok";
      },
      async createProfile(name) {
        if (!userId) return "error";
        const { error } = await supabase
          .from("profiles")
          .insert({ id: userId, username: name });
        if (!error) return "ok";
        return error.code === "23505" ? "taken" : "error";
      },
      async rollback() {
        if (userId) await admin.auth.admin.deleteUser(userId);
        await supabase.auth.signOut();
      },
    },
    ip,
    username,
    pin,
    pinRepeat,
  );
}

export async function login(
  username: string,
  pin: string,
): Promise<AuthResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  return loginFlow(
    {
      async isLocked(name) {
        const { data } = await admin.rpc("is_login_locked", {
          p_username: name,
        });
        return data ?? null;
      },
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return !error;
      },
      async registerFailure(name) {
        const { data } = await admin.rpc("register_failed_login", {
          p_username: name,
        });
        return data ?? null;
      },
      async clearFailures(name) {
        await admin.rpc("clear_failed_logins", { p_username: name });
      },
      async touchActive() {
        await supabase.rpc("touch_last_active");
      },
    },
    username,
    pin,
  );
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
