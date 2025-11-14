"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/api";
import { Play, CreditCard, Users, Shield } from "lucide-react";

export default function Home() {
  return <HomeClient />;
}