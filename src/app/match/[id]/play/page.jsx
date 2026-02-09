"use client";

import { use } from "react";
import PlayMatch from "@/components/Match/PlayMatch";

export default function PlayMatchPage({ params }) {
  const { id } = use(params);
  return <PlayMatch matchId={id} />;
}
