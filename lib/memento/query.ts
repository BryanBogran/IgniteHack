import "server-only";

import { getLatestObjectState } from "@/lib/memento/store";
import type { MementoObjectName, MementoQueryResult } from "@/lib/memento/types";
import { formatDateTime } from "@/lib/utils";

const aliases: Record<string, MementoObjectName> = {
  bag: "bag",
  backpack: "bag",
  cup: "mug",
  glasses: "glasses",
  keys: "keys",
  mug: "mug",
  phone: "phone",
  smartphone: "phone",
  wallet: "wallet",
};

function normalizeObjectName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^my\s+/, "")
    .replace(/[?.!]/g, "")
    .replace(/\b(pair of )/g, "")
    .replace(/\s+/g, " ");

  const singular = normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;

  return aliases[normalized] ?? aliases[singular] ?? null;
}

function getObjectPhrase(objectLabel: string) {
  return `your ${objectLabel}`;
}

export function answerMementoQuery(query: string): MementoQueryResult {
  const normalized = query.trim().toLowerCase();
  const whereMatch = normalized.match(/where (?:are|did i leave|did you see)?\s*(?:my\s+)?(.+?)\??$/);
  const whenMatch = normalized.match(/when (?:did you last see|was|were)\s*(?:my\s+)?(.+?)\??$/);
  const visibleMatch = normalized.match(/(?:is|are)\s*(?:my\s+)?(.+?)\s*(?:visible|here|out)?\??$/);

  const rawObject = whereMatch?.[1] ?? whenMatch?.[1] ?? visibleMatch?.[1] ?? "";
  const objectLabel = normalizeObjectName(rawObject);

  if (!objectLabel) {
    return {
      query,
      matched: false,
      intent: "unsupported",
      objectLabel: null,
      answer:
        'Memento can answer questions like "Where are my keys?", "When did you last see my glasses?", or "Is my wallet visible right now?"',
      objectState: null,
    };
  }

  const objectState = getLatestObjectState(objectLabel);
  const intent = whereMatch ? "where" : whenMatch ? "when" : "visible";

  if (!objectState?.lastSeenAt) {
    return {
      query,
      matched: true,
      intent,
      objectLabel,
      answer: `I have not seen ${getObjectPhrase(objectLabel)} yet. Place it inside a configured drop zone so Memento can start tracking it.`,
      objectState: objectState ?? null,
    };
  }

  if (intent === "when") {
    return {
      query,
      matched: true,
      intent,
      objectLabel,
      answer: `I last saw ${getObjectPhrase(objectLabel)} ${formatDateTime(objectState.lastSeenAt)}${objectState.zoneName ? ` in the ${objectState.zoneName.replace(/_/g, " ")}` : ""}.`,
      objectState,
    };
  }

  if (intent === "visible") {
    return {
      query,
      matched: true,
      intent,
      objectLabel,
      answer: objectState.isVisible
        ? `${getObjectPhrase(objectLabel)} is visible now${objectState.zoneName ? ` in the ${objectState.zoneName.replace(/_/g, " ")}` : ""}.`
        : `${getObjectPhrase(objectLabel)} is not visible right now. The last confirmed sighting was ${formatDateTime(objectState.lastSeenAt)}${objectState.zoneName ? ` in the ${objectState.zoneName.replace(/_/g, " ")}` : ""}.`,
      objectState,
    };
  }

  return {
    query,
    matched: true,
    intent,
    objectLabel,
    answer: `${getObjectPhrase(objectLabel)} was last seen ${objectState.zoneName ? `in the ${objectState.zoneName.replace(/_/g, " ")}` : "in view"} at ${formatDateTime(objectState.lastSeenAt)}.${objectState.isVisible ? " It is still visible now." : " It is currently out of view, so this is the last known location."}`,
    objectState,
  };
}
