"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";

const Map = dynamic(() => import("./map-component"), { ssr: false });

export default function Dashboard() {
  return (
    <div className="relative">
      <Map className="absolute z-0" />
      <Navbar className="sticky bottom-0 z-50" />
    </div>
  );
}
