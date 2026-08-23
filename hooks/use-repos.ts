"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type Repository } from "@/lib/api";
import { num } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/components/ui/toast";



const INDEXING_POLL_MS = 2000;

/** A watcher stops following an index after this long instead of spinning forever. */
const INDEX_WATCH_LIMIT_MS = 15 * 60_000;

function hasIndexingRepos(repos: Repository[] | undefined) {
  return repos?.some((repo) => repo.indexStatus === "INDEXING") ?? false;
}

function updateRepoInListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  repo: Repository
) {
  queryClient.setQueryData<Repository[]>(queryKeys.repos.list(), (current) => {
    if (!current) return current;
    return current.map((item) => (item.id === repo.id ? repo : item));
  });
}

/**
 * Base UI never auto-dismisses a `type: "loading"` toast, and the view that
 * starts an index is usually gone before that index finishes — indexing from a
 * tile navigates straight into the repository's chat. So the toast is settled by
 * a watcher that lives outside React: it follows the status endpoint on its own
 * and rewrites the toast in place once the index reaches a terminal state, which
 * is also what finally arms the auto-dismiss timer.
 */
type IndexWatch = { token: symbol; toastId: string };

const watches = new Map<string, IndexWatch>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function watchIndexing(
  repo: Repository,
  queryClient: ReturnType<typeof useQueryClient>
) {
  // A reindex supersedes the run before it; close its toast rather than leave a
  // second spinner for the same repository behind. `close()` with no id would
  // close every toast on screen, so this only ever runs with one in hand.
  const previous = watches.get(repo.id);
  if (previous) {
    toast.close(previous.toastId);
  }

  const token = Symbol(repo.fullName);
  const toastId = toast.add({
    title: "Indexing started",
    description: `Indexing ${repo.fullName}…`,
    type: "loading",
    // Dismissing the toast dismisses the watcher: there is nothing left to report to.
    onClose: () => {
      if (watches.get(repo.id)?.token === token) {
        watches.delete(repo.id);
      }
    },
  });

  watches.set(repo.id, { token, toastId });
  void followIndexing(repo, token, toastId, queryClient);
}

async function followIndexing(
  repo: Repository,
  token: symbol,
  toastId: string,
  queryClient: ReturnType<typeof useQueryClient>
) {
  const deadline = Date.now() + INDEX_WATCH_LIMIT_MS;

  while (watches.get(repo.id)?.token === token && Date.now() < deadline) {
    await sleep(INDEXING_POLL_MS);
    if (watches.get(repo.id)?.token !== token) return;

    // Going through the cache means a mounted view already polling this
    // repository serves the watcher for free instead of doubling the requests.
    const status = await queryClient
      .fetchQuery({
        queryKey: queryKeys.repos.status(repo.id),
        queryFn: () => api.indexStatus(repo.id),
        staleTime: INDEXING_POLL_MS,
      })
      // A poll that failed says nothing about the index; the next one may answer.
      .catch(() => null);

    if (!status || status.indexStatus === "INDEXING") continue;
    if (status.indexStatus === "PENDING") continue;

    watches.delete(repo.id);
    // The list and detail records still read INDEXING, so whatever is mounted
    // catches up in the same beat the toast settles.
    void queryClient.invalidateQueries({ queryKey: queryKeys.repos.all });

    if (status.indexStatus === "READY") {
      toast.update(toastId, {
        title: "Indexing complete",
        description: `${repo.fullName} · ${num(status.chunkCount)} chunks queryable`,
        type: "success",
      });
    } else {
      toast.update(toastId, {
        title: "Indexing failed",
        description:
          status.errorMessage ?? `${repo.fullName} did not finish indexing.`,
        type: "error",
        timeout: 10_000,
      });
    }
    return;
  }

  // Out of patience rather than out of index. Still settle the toast — a spinner
  // that outlives the thing watching it is the bug this whole watcher exists for.
  if (watches.get(repo.id)?.token === token) {
    watches.delete(repo.id);
    toast.update(toastId, {
      title: "Still indexing",
      description: `${repo.fullName} is taking longer than usual — the dashboard tracks it live.`,
      type: "info",
    });
  }
}

export function useRepos() {
  return useQuery({
    queryKey: queryKeys.repos.list(),
    queryFn: async () => {
      const repos = await api.listRepos(false);
      if (repos.length === 0) {
        return api.listRepos(true);
      }
      return repos;
    },
    staleTime: 30_000,
    refetchInterval: (query) =>
      hasIndexingRepos(query.state.data) ? INDEXING_POLL_MS : false,
  });
}

export function useRepository(repoId: string) {
  return useQuery({
    queryKey: queryKeys.repos.detail(repoId),
    queryFn: () => api.getRepo(repoId),
    enabled: Boolean(repoId),
    refetchInterval: (query) =>
      query.state.data?.indexStatus === "INDEXING" ? INDEXING_POLL_MS : false,
  });
}

export function useIndexStatus(repoId: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.repos.status(repoId),
    queryFn: () => api.indexStatus(repoId),
    enabled: Boolean(repoId) && enabled,
    refetchInterval: (query) =>
      query.state.data?.indexStatus === "INDEXING" ? 1500 : false,
  });
}

export function useStartIndexing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repoId: string) => api.startIndex(repoId),
    onSuccess: (repo) => {
      queryClient.setQueryData(queryKeys.repos.detail(repo.id), repo);
      updateRepoInListCache(queryClient, repo);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.repos.status(repo.id),
      });
      watchIndexing(repo, queryClient);
    },
    onError: (error: Error) => {
      toast.add({
        title: "Could not start indexing",
        description: error.message,
        type: "error",
      });
    },
  });
}

export function useRefreshRepos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      toast.promise(api.listRepos(true), {
        loading: {
          title: "Syncing repositories",
          description: "Fetching the latest repos from GitHub…",
          type: "loading",
        },
        success: (repos) => ({
          title: "Sync successful",
          description: `${repos.length} repositories loaded`,
          type: "success",
        }),
        error: (error: Error) => ({
          title: "Sync failed",
          description:
            error instanceof Error ? error.message : "Could not sync repositories",
          type: "error",
        }),
      }),
    onSuccess: (repos) => {
      queryClient.setQueryData(queryKeys.repos.list(), repos);
    },
  });
}

export function getRepoProgress(repo: Pick<
  Repository,
  "filesProcessed" | "filesTotal"
>) {
  if (!repo.filesTotal) return 0;
  return Math.min(100, Math.round((repo.filesProcessed / repo.filesTotal) * 100));
}
