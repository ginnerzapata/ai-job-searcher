import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import useSWR from "swr";
type HealthResponse = {
  ok: boolean;
};

const fetcher = async (url: string): Promise<HealthResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  return response.json();
};

function App() {
  const { data, error, isLoading } = useSWR<HealthResponse>(
    "/api/health",
    fetcher,
  );

  const status = isLoading
    ? "Checking"
    : error
      ? `Failed: ${error.message}`
      : data?.ok
        ? "Healthy"
        : "Unhealthy";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Local Application</CardTitle>
          <CardDescription>
            Brower-to-api healt check trought vite proxy
          </CardDescription>
          <CardContent>
            <p>
              API status: <strong>{status}</strong>
            </p>
          </CardContent>
        </CardHeader>
      </Card>
    </main>
  );
}
export default App;
