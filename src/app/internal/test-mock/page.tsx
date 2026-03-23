import { GenerationModal } from "@/components/features/generation-modal";

/**
 * Mock Testing Page
 *
 * This page is used to test the mock episode generation flow
 * without affecting the main application.
 */
export default function TestMockPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Mock Generation Testing</h1>
        <p className="text-base-content/70">
          Use this page to test the mock episode generation flow using the NASA
          audio sample. No actual AI costs will be incurred.
        </p>
        <div className="badge badge-info mt-2">Development Mode</div>
      </div>

      <div className="card bg-base-200 shadow-xl p-6 max-w-2xl mx-auto">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <span className="i-lucide-beaker text-info text-xl"></span>
            Test Mock Generation
          </h2>
          <p className="mb-4">
            Click the button below to test the generation modal with mock data.
            This uses the NASA audio file without making real API calls.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="alert alert-info text-sm">
              <div>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Using mock NASA audio file from{" "}
                  <code>/public/nasa-mock.mp3</code>
                </span>
              </div>
            </div>

            <GenerationModal
              trigger={
                <button className="btn btn-primary btn-lg">
                  Generate Mock Episode
                </button>
              }
              onEpisodeGenerated={(episode) => {
                console.log("Mock episode generated:", episode);
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-base-content/60">
        <p>Mock data integration for development without incurring AI costs.</p>
        <p>NASA audio sample used for demonstration purposes.</p>
      </div>
    </div>
  );
}
