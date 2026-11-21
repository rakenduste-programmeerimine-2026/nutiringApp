import { describe, expect, it, vi } from "vitest";
import {
  clientIp,
  loginFlow,
  minutesLeft,
  registerFlow,
  SIGNUP_LIMIT_PER_HOUR,
  type LoginDeps,
  type RegisterDeps,
} from "@/lib/auth/flows";
import { requiresSession } from "@/lib/auth/routes";
import {
  MESSAGES,
  usernameToEmail,
  validatePin,
  validateRegistration,
  validateUsername,
} from "@/lib/auth/validation";

describe("validation", () => {
  it("accepts and rejects usernames", () => {
    expect(validateUsername("mari_1-A")).toBeNull();
    expect(validateUsername("ab")).toBe(MESSAGES.usernameInvalid);
    expect(validateUsername("a".repeat(31))).toBe(MESSAGES.usernameInvalid);
    expect(validateUsername("mari tamm")).toBe(MESSAGES.usernameInvalid);
    expect(validateUsername("märi")).toBe(MESSAGES.usernameInvalid);
  });

  it("accepts only 6–20 digit PINs", () => {
    expect(validatePin("123456")).toBeNull();
    expect(validatePin("1".repeat(20))).toBeNull();
    expect(validatePin("12345")).toBe(MESSAGES.pinInvalid);
    expect(validatePin("1".repeat(21))).toBe(MESSAGES.pinInvalid);
    expect(validatePin("12345a")).toBe(MESSAGES.pinInvalid);
  });

  it("requires matching PINs", () => {
    expect(validateRegistration("mari", "123456", "123456")).toBeNull();
    expect(validateRegistration("mari", "123456", "654321")).toBe(
      MESSAGES.pinMismatch,
    );
  });

  it("builds a case-insensitive hidden e-mail", () => {
    expect(usernameToEmail("Mari")).toBe("mari@nutiring.local");
  });
});

describe("helpers", () => {
  it("computes minutes left, at least 1", () => {
    const now = Date.UTC(2026, 10, 21, 10, 0, 0);
    expect(minutesLeft(new Date(now + 15 * 60_000), now)).toBe(15);
    expect(minutesLeft(new Date(now + 61_000), now)).toBe(2);
    expect(minutesLeft(new Date(now + 1_000), now)).toBe(1);
  });

  it("reads the client IP from x-forwarded-for", () => {
    expect(clientIp("203.0.113.5, 10.0.0.1")).toBe("203.0.113.5");
    expect(clientIp("2001:db8::1")).toBe("2001:db8::1");
    expect(clientIp("garbage")).toBeNull();
    expect(clientIp(null)).toBeNull();
  });

  it("protects /eksam pages except the public ones", () => {
    expect(requiresSession("/eksam")).toBe(false);
    expect(requiresSession("/eksam/logi-sisse")).toBe(false);
    expect(requiresSession("/eksam/registreeri/")).toBe(false);
    expect(requiresSession("/eksam/teemad")).toBe(true);
    expect(requiresSession("/eksam/tulemus")).toBe(true);
    expect(requiresSession("/maja/kuber")).toBe(false);
  });
});

function loginDeps(over: Partial<LoginDeps> = {}): LoginDeps {
  return {
    isLocked: vi.fn(async () => null),
    signIn: vi.fn(async () => true),
    registerFailure: vi.fn(async () => null),
    clearFailures: vi.fn(async () => {}),
    touchActive: vi.fn(async () => {}),
    ...over,
  };
}

describe("loginFlow", () => {
  it("logs in, clears failures and touches last_active_at", async () => {
    const deps = loginDeps();
    expect(await loginFlow(deps, "mari", "123456")).toEqual({ ok: true });
    expect(deps.signIn).toHaveBeenCalledWith("mari@nutiring.local", "123456");
    expect(deps.clearFailures).toHaveBeenCalledWith("mari");
    expect(deps.touchActive).toHaveBeenCalled();
  });

  it("counts a wrong PIN and gives a neutral message", async () => {
    const deps = loginDeps({ signIn: vi.fn(async () => false) });
    expect(await loginFlow(deps, "mari", "123456")).toEqual({
      ok: false,
      error: MESSAGES.wrongCredentials,
    });
    expect(deps.registerFailure).toHaveBeenCalledWith("mari");
    expect(deps.clearFailures).not.toHaveBeenCalled();
  });

  it("reports the lock with minutes left when the 5th wrong PIN locks the account", async () => {
    const until = new Date(Date.now() + 15 * 60_000).toISOString();
    const deps = loginDeps({
      signIn: vi.fn(async () => false),
      registerFailure: vi.fn(async () => until),
    });
    const res = await loginFlow(deps, "mari", "123456");
    expect(res).toEqual({
      ok: false,
      error: expect.stringContaining("lukustatud"),
    });
    expect(res.ok === false && res.error).toMatch(/1[45] min/);
  });

  it("refuses a locked account without trying the PIN", async () => {
    const until = new Date(Date.now() + 10 * 60_000).toISOString();
    const deps = loginDeps({ isLocked: vi.fn(async () => until) });
    const res = await loginFlow(deps, "mari", "123456");
    expect(res.ok).toBe(false);
    expect(deps.signIn).not.toHaveBeenCalled();
    expect(deps.registerFailure).not.toHaveBeenCalled();
  });

  it("rejects malformed input without touching the database", async () => {
    const deps = loginDeps();
    expect(await loginFlow(deps, "x", "1")).toEqual({
      ok: false,
      error: MESSAGES.wrongCredentials,
    });
    expect(deps.isLocked).not.toHaveBeenCalled();
  });
});

function registerDeps(over: Partial<RegisterDeps> = {}): RegisterDeps {
  return {
    signupsFromIp: vi.fn(async () => 0),
    logSignupIp: vi.fn(async () => {}),
    signUp: vi.fn(async () => "ok" as const),
    createProfile: vi.fn(async () => "ok" as const),
    rollback: vi.fn(async () => {}),
    ...over,
  };
}

describe("registerFlow", () => {
  it("registers and logs the IP", async () => {
    const deps = registerDeps();
    expect(
      await registerFlow(deps, "203.0.113.5", "Mari", "123456", "123456"),
    ).toEqual({ ok: true });
    expect(deps.signUp).toHaveBeenCalledWith("mari@nutiring.local", "123456");
    expect(deps.createProfile).toHaveBeenCalledWith("Mari");
    expect(deps.logSignupIp).toHaveBeenCalledWith("203.0.113.5");
  });

  it("validates before doing anything", async () => {
    const deps = registerDeps();
    expect(await registerFlow(deps, null, "mari", "123456", "000000")).toEqual({
      ok: false,
      error: MESSAGES.pinMismatch,
    });
    expect(deps.signUp).not.toHaveBeenCalled();
  });

  it("refuses at the signup limit", async () => {
    const deps = registerDeps({
      signupsFromIp: vi.fn(async () => SIGNUP_LIMIT_PER_HOUR),
    });
    expect(
      await registerFlow(deps, "203.0.113.5", "mari", "123456", "123456"),
    ).toEqual({
      ok: false,
      error: MESSAGES.tooManySignups,
    });
    expect(deps.signUp).not.toHaveBeenCalled();
  });

  it("allows the 30th account (29 earlier)", async () => {
    const deps = registerDeps({
      signupsFromIp: vi.fn(async () => SIGNUP_LIMIT_PER_HOUR - 1),
    });
    expect(
      (await registerFlow(deps, "203.0.113.5", "mari", "123456", "123456")).ok,
    ).toBe(true);
  });

  it("reports a taken username", async () => {
    const deps = registerDeps({ signUp: vi.fn(async () => "taken" as const) });
    expect(await registerFlow(deps, null, "mari", "123456", "123456")).toEqual({
      ok: false,
      error: MESSAGES.usernameTaken,
    });
  });

  it("rolls the auth user back when the profile cannot be created", async () => {
    const deps = registerDeps({
      createProfile: vi.fn(async () => "taken" as const),
    });
    expect(
      await registerFlow(deps, "203.0.113.5", "mari", "123456", "123456"),
    ).toEqual({
      ok: false,
      error: MESSAGES.usernameTaken,
    });
    expect(deps.rollback).toHaveBeenCalled();
    expect(deps.logSignupIp).not.toHaveBeenCalled();
  });
});
