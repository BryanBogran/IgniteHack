import "server-only";

import { getLatestObjectState } from "@/lib/anchor/store";
import type { AnchorObjectName, AnchorQueryResult } from "@/lib/anchor/types";
import { formatDateTime } from "@/lib/utils";

const aliases: Record<string, AnchorObjectName> = {
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

type QueryIntent = AnchorQueryResult["intent"];

const queryPatterns: Array<{
  intent: Extract<QueryIntent, "where" | "when" | "visible">;
  pattern: RegExp;
}> = [
  {
    intent: "where",
    pattern: /^(?:where(?:\s+(?:are|is))?|where did (?:i|you))\s+(?:my\s+)?(.+?)\??$/,
  },
  {
    intent: "when",
    pattern: /^when (?:did you last see|was|were)\s+(?:my\s+)?(.+?)\??$/,
  },
  {
    intent: "visible",
    pattern: /^(?:is|are)\s+(?:my\s+)?(.+?)\s+(?:visible|here|out|still visible)(?:\s+right now)?\??$/,
  },
];

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

function parseAnchorQuery(query: string) {
  const normalized = query.trim().toLowerCase();

  for (const candidate of queryPatterns) {
    const match = normalized.match(candidate.pattern);
    if (match) {
      return {
        intent: candidate.intent,
        objectLabel: normalizeObjectName(match[1] ?? ""),
      };
    }
  }

  return {
    intent: "unsupported" as const,
    objectLabel: null,
  };
}

function getObjectPhrase(objectLabel: string) {
  return `your ${objectLabel}`;
}

export function answerAnchorQuery(query: string): AnchorQueryResult {
  const parsed = parseAnchorQuery(query);

  if (!parsed.objectLabel) {
    return {
      query,
      matched: false,
      intent: "unsupported",
      objectLabel: null,
      answer:
        "Anchor can answer questions like “Where are my keys?”, “When did you last see my glasses?”, or “Is my wallet visible right now?”",
      objectState: null,
    };
  }

  const objectState = getLatestObjectState(parsed.objectLabel);

  if (!objectState?.lastSeenAt) {
    return {
      query,
      matched: true,
      intent: parsed.intent,
      objectLabel: parsed.objectLabel,
      answer: `I have not seen ${getObjectPhrase(parsed.objectLabel)} yet. Place it inside a configured drop zone so Anchor can start tracking it.`,
      objectState: objectState ?? null,
    };
  }

  if (parsed.intent === "when") {
    return {
      query,
      matched: true,
      intent: "when",
      objectLabel: parsed.objectLabel,
      answer: `I last saw ${getObjectPhrase(parsed.objectLabel)} ${formatDateTime(objectState.lastSeenAt)}${objectState.zoneName ? ` in the ${objectState.zoneName.replace(/_/g, " ")}` : ""}.`,
      objectState,
    };
  }

  if (parsed.intent === "visible") {
    return {
      query,
      matched: true,
      intent: "visible",
      objectLabel: parsed.objectLabel,
      answer: objectState.isVisible
        ? `${getObjectPhrase(parsed.objectLabel)} is visible now${objectState.zoneName ? ` in the ${objectState.zoneName.replace(/_/g, " ")}` : ""}.`
        : `${getObjectPhrase(parsed.objectLabel)} is not visible right now. The last confirmed sighting was ${formatDateTime(objectState.lastSeenAt)}${objectState.zoneName ? ` in the ${objectState.zoneName.replace(/_/g, " ")}` : ""}.`,
      objectState,
    };
  }

  return {
    query,
    matched: true,
    intent: "where",
    objectLabel: parsed.objectLabel,
    answer: `${getObjectPhrase(parsed.objectLabel)} was last seen ${objectState.zoneName ? `in the ${objectState.zoneName.replace(/_/g, " ")}` : "in view"} at ${formatDateTime(objectState.lastSeenAt)}.${objectState.isVisible ? " It is still visible now." : " It is currently out of view, so this is the last known location."}`,
    objectState,
  };
}
