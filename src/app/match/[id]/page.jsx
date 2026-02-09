"use client";

import { use } from "react";
import TossPage from "@/components/Match/TossPage";

export default function TossPageWrapper({ params }) {
  const { id } = use(params);
  return <TossPage matchId={id} />;
}
