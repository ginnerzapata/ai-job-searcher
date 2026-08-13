import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import useSWR from "swr";

type CvAvailability = {
  exists: boolean;
};
const fetcher = async (url: string): Promise<CvAvailability> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  return response.json();
};

function App() {
  const {
    data: cv,
    error: cvError,
    isLoading: isCvLoading,
  } = useSWR<CvAvailability>("/api/profile/cv", fetcher);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Local Application</CardTitle>
          <CardDescription>
            Brower-to-api healt check trought vite proxy
          </CardDescription>
          <CardContent>
            {isCvLoading ? (
              <p className="space-y-4">Cheking for a local CV</p>
            ) : null}
            {cvError ? (
              <p className="text-destructive">
                Could not check local CV: {cvError.message}
              </p>
            ) : null}
            {cv?.exists ? (
              <p>A local CV.md was found and can be used as your source</p>
            ) : (
              <label className="block">
                <span className="mb-2 block">Upload your CV</span>
                <input type="file" accept=".md,application/pdf" />
              </label>
            )}
          </CardContent>
        </CardHeader>
      </Card>
    </main>
  );
}
export default App;
