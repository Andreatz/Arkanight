"use client";

const KEY = "arkanight:voter_id";

export function getVoterId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

const VOTED_KEY = (pollId: string) => `arkanight:voted:${pollId}`;

export function getVotedOption(pollId: string): number | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(VOTED_KEY(pollId));
  return v === null ? null : Number(v);
}

export function setVotedOption(pollId: string, optionIndex: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VOTED_KEY(pollId), String(optionIndex));
}
