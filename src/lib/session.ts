import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "master_ai_session";

export function getSessionId() {
  if (typeof window === "undefined") return "server-session";

  const existingSession = localStorage.getItem(SESSION_KEY);

  if (existingSession) return existingSession;

  const nextSession = uuidv4();

  localStorage.setItem(SESSION_KEY, nextSession);

  return nextSession;
}
