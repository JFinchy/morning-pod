"use client";

import { Button } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export function ApiTest() {
  const {
    data: episodes,
    isLoading,
    error,
    refetch,
  } = api.episodes.getAll.useQuery({
    limit: 5,
  });

  const { data: sources } = api.sources.getActive.useQuery();
  const { data: queueStats } = api.queue.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">API Connection Test</h2>
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span>Testing API connection...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error">API Connection Failed</h2>
          <div className="alert alert-error">
            <span>Error: {error.message}</span>
          </div>
          <div className="card-actions">
            <Button onClick={() => refetch()} variant="primary">
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-success">
          ✅ API Connected Successfully
        </h2>
        <p className="text-base-content/70">
          tRPC API is working! Here&apos;s some data from the database:
        </p>

        <div className="stats stats-vertical lg:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">Episodes</div>
            <div className="stat-value">{episodes?.episodes.length || 0}</div>
            <div className="stat-desc">Total episodes found</div>
          </div>

          <div className="stat">
            <div className="stat-title">Active Sources</div>
            <div className="stat-value">{sources?.length || 0}</div>
            <div className="stat-desc">Ready to generate</div>
          </div>

          <div className="stat">
            <div className="stat-title">Queue Items</div>
            <div className="stat-value">{queueStats?.totalInQueue || 0}</div>
            <div className="stat-desc">In processing queue</div>
          </div>
        </div>

        {episodes && episodes.episodes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Recent Episodes:</h3>
            <div className="space-y-2">
              {episodes.episodes.slice(0, 3).map((episode) => (
                <div key={episode.id} className="p-3 bg-base-200 rounded-lg">
                  <div className="font-medium">{episode.title}</div>
                  <div className="text-sm text-base-content/60">
                    Status:{" "}
                    <span className="badge badge-sm">{episode.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-actions">
          <Button onClick={() => refetch()} btnStyle="outline">
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
