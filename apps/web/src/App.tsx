import { useState, type FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import useSWR from "swr";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

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
    mutate,
  } = useSWR<CvAvailability>("/api/profile/cv", fetcher);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadCv = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setUploadError("Choose a Markdown or PDF CV first");
      return;
    }
    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/profile/cv", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      await mutate();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

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
              <form className="space-y-4" onSubmit={uploadCv}>
                <label className="block">
                  <span className="mb-2 block">Upload your Markdown CV</span>
                  <Input
                    name="file"
                    type="file"
                    accept=".md,text/markdown,.pdf,application/pdf"
                  />
                </label>

                {uploadError ? (
                  <p className="text-destructive">{uploadError}</p>
                ) : null}

                <Button
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                  disabled={isUploading}
                  type="submit"
                >
                  {isUploading ? "Uploading..." : "Use this CV"}
                </Button>
              </form>
            )}
          </CardContent>
        </CardHeader>
      </Card>
    </main>
  );
}
export default App;
