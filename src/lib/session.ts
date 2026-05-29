import { v4 as uuidv4 } from "uuid";

export function getSessionId() {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("master_ai_session");

  if (!sessionId) {
    sessionId = uuidv4();

    localStorage.setItem(
      "master_ai_session",
      sessionId
    );
  }

  return sessionId;
}