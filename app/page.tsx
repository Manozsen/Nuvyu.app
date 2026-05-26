import { redirect } from "next/navigation";

export default function Home() {
  // 🧠 GLOBAL RUNTIME STABILIZATION
  // Safely intercept root navigation to prevent edge-runtime conflicts
  redirect("/dashboard");
}
