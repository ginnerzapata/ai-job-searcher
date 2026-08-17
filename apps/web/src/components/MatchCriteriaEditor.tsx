import { useEffect, useState, type FormEvent } from "react";
import useSWR from "swr";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type RemotePolicy = "remote" | "hybrid" | "on_site" | "any";
type FitGrade = "S" | "A" | "B" | "C" | "D";

type MatchCriteria = {
  id?: number;
  name: string;
  isDefault: boolean;
  targetTitles: string[];
  locations: string[];
  remotePolicy: RemotePolicy;
  seniorities: string[];
  employmentTypes: string[];
  excludedKeywords: string[];
  minimumCompensation: number | null;
  compensationCurrency: string | null;
  minimumFitGrade: FitGrade;
};

const seniorityOptions = [
  "intern",
  "entry",
  "mid",
  "senior",
  "lead",
  "staff",
  "principal",
  "manager",
  "director",
  "executive",
  "any",
];

const employmentTypeOptions = [
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "internship",
  "any",
];

const emptyCriteria: MatchCriteria = {
  name: "",
  isDefault: false,
  targetTitles: [],
  locations: [],
  remotePolicy: "any",
  seniorities: ["any"],
  employmentTypes: ["any"],
  excludedKeywords: [],
  minimumCompensation: null,
  compensationCurrency: null,
  minimumFitGrade: "C",
};

function linesToItems(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function selectedValues(event: React.ChangeEvent<HTMLSelectElement>) {
  return Array.from(event.currentTarget.selectedOptions, (option) => option.value);
}

async function fetcher(url: string): Promise<MatchCriteria[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load Match Criteria: ${response.status}`);
  }

  return response.json();
}

export function MatchCriteriaEditor() {
  const { data: criteriaSets, error, isLoading, mutate } = useSWR(
    "/api/match-criteria",
    fetcher,
  );
  const [draft, setDraft] = useState<MatchCriteria>(emptyCriteria);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const defaultCriteria = criteriaSets?.find((criteria) => criteria.isDefault);

    if (defaultCriteria) {
      setDraft(defaultCriteria);
    }
  }, [criteriaSets]);

  async function saveCriteria(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/match-criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        throw new Error(`Could not save Match Criteria: ${response.status}`);
      }

      const savedCriteria = (await response.json()) as MatchCriteria;
      setDraft(savedCriteria);
      await mutate();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save Match Criteria.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Match Criteria</h2>
          <p className="text-sm text-muted-foreground">
            Saved criteria prepopulate your next Search Run.
          </p>
        </div>
        <Button onClick={() => setDraft(emptyCriteria)} type="button" variant="outline">
          New criteria set
        </Button>
      </div>

      {isLoading ? <p>Loading saved Match Criteria...</p> : null}
      {error ? <p className="text-destructive">{error.message}</p> : null}

      {criteriaSets?.length ? (
        <div className="flex flex-wrap gap-2">
          {criteriaSets.map((criteria) => (
            <Button
              key={criteria.id}
              onClick={() => setDraft(criteria)}
              type="button"
              variant={criteria.id === draft.id ? "default" : "outline"}
            >
              {criteria.name}
              {criteria.isDefault ? " (default)" : ""}
            </Button>
          ))}
        </div>
      ) : null}

      <form className="grid gap-6 lg:grid-cols-2" onSubmit={saveCriteria}>
        <label className="block">
          <span className="mb-2 block">Criteria name</span>
          <Input
            required
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </label>

        <label className="flex items-center gap-3 self-end pb-2">
          <input
            checked={draft.isDefault}
            className="size-4"
            type="checkbox"
            onChange={(event) =>
              setDraft({ ...draft, isDefault: event.target.checked })
            }
          />
          <span>Use as the default for the next Search Run</span>
        </label>

        <label className="block">
          <span className="mb-2 block">Target titles</span>
          <textarea
            className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2"
            placeholder="One title per line"
            value={draft.targetTitles.join("\n")}
            onChange={(event) =>
              setDraft({ ...draft, targetTitles: linesToItems(event.target.value) })
            }
          />
        </label>

        <label className="block">
          <span className="mb-2 block">Locations</span>
          <textarea
            className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2"
            placeholder="One location per line"
            value={draft.locations.join("\n")}
            onChange={(event) =>
              setDraft({ ...draft, locations: linesToItems(event.target.value) })
            }
          />
        </label>

        <label className="block">
          <span className="mb-2 block">Remote policy</span>
          <select
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5"
            value={draft.remotePolicy}
            onChange={(event) =>
              setDraft({ ...draft, remotePolicy: event.target.value as RemotePolicy })
            }
          >
            <option value="any">Any</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on_site">On-site</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block">Minimum Fit Grade</span>
          <select
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5"
            value={draft.minimumFitGrade}
            onChange={(event) =>
              setDraft({ ...draft, minimumFitGrade: event.target.value as FitGrade })
            }
          >
            {["S", "A", "B", "C", "D"].map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block">Seniority</span>
          <select
            multiple
            className="min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2"
            value={draft.seniorities}
            onChange={(event) =>
              setDraft({ ...draft, seniorities: selectedValues(event) })
            }
          >
            {seniorityOptions.map((seniority) => (
              <option key={seniority} value={seniority}>
                {seniority}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block">Employment type</span>
          <select
            multiple
            className="min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2"
            value={draft.employmentTypes}
            onChange={(event) =>
              setDraft({ ...draft, employmentTypes: selectedValues(event) })
            }
          >
            {employmentTypeOptions.map((employmentType) => (
              <option key={employmentType} value={employmentType}>
                {employmentType.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block lg:col-span-2">
          <span className="mb-2 block">Excluded keywords</span>
          <textarea
            className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2"
            placeholder="One keyword per line"
            value={draft.excludedKeywords.join("\n")}
            onChange={(event) =>
              setDraft({ ...draft, excludedKeywords: linesToItems(event.target.value) })
            }
          />
        </label>

        <label className="block">
          <span className="mb-2 block">Minimum compensation (optional)</span>
          <Input
            min="1"
            type="number"
            value={draft.minimumCompensation ?? ""}
            onChange={(event) =>
              setDraft({
                ...draft,
                minimumCompensation: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
          />
        </label>

        <label className="block">
          <span className="mb-2 block">Compensation currency</span>
          <Input
            maxLength={3}
            placeholder="USD"
            value={draft.compensationCurrency ?? ""}
            onChange={(event) =>
              setDraft({
                ...draft,
                compensationCurrency: event.target.value
                  ? event.target.value.toUpperCase()
                  : null,
              })
            }
          />
        </label>

        <div className="flex items-center gap-3 lg:col-span-2">
          <Button disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save Match Criteria"}
          </Button>
          {saveError ? <p className="text-destructive">{saveError}</p> : null}
        </div>
      </form>
    </section>
  );
}
