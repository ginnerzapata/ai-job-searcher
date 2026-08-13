import { useState, type FormEvent } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

type CvAvailability = {
  exists: boolean;
};

type JobSearcherProfile = {
  fullName: string;
  headline: string;
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
};

const fetcher = async (url: string): Promise<CvAvailability> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  return response.json();
};

function linesToItems(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function App() {
  const {
    data: cv,
    error: cvError,
    isLoading: isCvLoading,
    mutate,
  } = useSWR<CvAvailability>("/api/profile/cv", fetcher);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<JobSearcherProfile | null>(null);
  const [deriveError, setDeriveError] = useState<string | null>(null);
  const [isDeriving, setIsDeriving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReplacingCv, setIsReplacingCv] = useState(false);

  async function uploadCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setUploadError("Choose a Markdown or PDF CV first.");
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
      setIsReplacingCv(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function deriveProfile() {
    setIsDeriving(true);
    setDeriveError(null);

    try {
      const response = await fetch("/api/profile/derive", { method: "POST" });

      if (!response.ok) {
        throw new Error(`Profile derivation failed: ${response.status}`);
      }

      setProfile(await response.json());
    } catch (error) {
      setDeriveError(
        error instanceof Error ? error.message : "Profile derivation failed.",
      );
    } finally {
      setIsDeriving(false);
    }
  }

  async function saveProfile() {
    if (!profile) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setIsSaved(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error(`Profile save failed: ${response.status}`);
      }

      setIsSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Profile save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader>
          <CardTitle>Job Searcher setup</CardTitle>
          <CardDescription>
            Provide a CV, then review the derived Job Searcher Profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCvLoading ? <p>Checking for a local CV...</p> : null}

          {cvError ? (
            <p className="text-destructive">
              Could not check local CV: {cvError.message}
            </p>
          ) : null}

          {cv?.exists && !isReplacingCv ? (
            <div className="space-y-4">
              <p>A local CV.md was found.</p>

              <div className="flex gap-2">
                <Button
                  disabled={isDeriving}
                  onClick={deriveProfile}
                  type="button"
                >
                  {isDeriving ? "Deriving profile..." : "Use local CV"}
                </Button>

                <Button
                  onClick={() => setIsReplacingCv(true)}
                  type="button"
                  variant="outline"
                >
                  Upload another CV
                </Button>
              </div>

              {deriveError ? (
                <p className="text-destructive">{deriveError}</p>
              ) : null}

              {profile ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block">Full name</span>
                    <Input
                      value={profile.fullName}
                      onChange={(event) =>
                        setProfile({ ...profile, fullName: event.target.value })
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block">Headline</span>
                    <Input
                      value={profile.headline}
                      onChange={(event) =>
                        setProfile({ ...profile, headline: event.target.value })
                      }
                    />
                  </label>

                  <label className="block lg:col-span-2">
                    <span className="mb-2 block">Summary</span>
                    <textarea
                      className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2"
                      value={profile.summary}
                      onChange={(event) =>
                        setProfile({ ...profile, summary: event.target.value })
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block">Skills</span>
                    <textarea
                      className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2"
                      value={profile.skills.join("\n")}
                      onChange={(event) =>
                        setProfile({
                          ...profile,
                          skills: linesToItems(event.target.value),
                        })
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block">Experience</span>
                    <textarea
                      className="min-h-36 w-full rounded-lg border border-input bg-transparent px-3 py-2"
                      value={profile.experience.join("\n")}
                      onChange={(event) =>
                        setProfile({
                          ...profile,
                          experience: linesToItems(event.target.value),
                        })
                      }
                    />
                  </label>

                  <label className="block lg:col-span-2">
                    <span className="mb-2 block">Education and certifications</span>
                    <textarea
                      className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2"
                      value={profile.education.join("\n")}
                      onChange={(event) =>
                        setProfile({
                          ...profile,
                          education: linesToItems(event.target.value),
                        })
                      }
                    />
                  </label>

                  <div className="flex items-center gap-3 lg:col-span-2">
                    <Button disabled={isSaving} onClick={saveProfile} type="button">
                      {isSaving ? "Saving..." : "Save profile"}
                    </Button>

                    {saveError ? (
                      <p className="text-destructive">{saveError}</p>
                    ) : null}

                    {isSaved ? <p className="text-green-600">Profile saved.</p> : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={uploadCv}>
              <label className="block">
                <span className="mb-2 block">Upload your CV</span>
                <Input
                  accept=".md,text/markdown,.pdf,application/pdf"
                  name="file"
                  type="file"
                />
              </label>

              {uploadError ? (
                <p className="text-destructive">{uploadError}</p>
              ) : null}

              <div className="flex gap-2">
                <Button disabled={isUploading} type="submit">
                  {isUploading ? "Uploading..." : "Use this CV"}
                </Button>

                {cv?.exists ? (
                  <Button
                    onClick={() => setIsReplacingCv(false)}
                    type="button"
                    variant="outline"
                  >
                    Keep local CV
                  </Button>
                ) : null}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
