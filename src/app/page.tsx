import { ApiTest } from "@/components/features";
import { MainLayout } from "@/components/layouts";
import {
  Button,
  Progress,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  Slider,
} from "@/components/ui";

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="hero bg-base-200 rounded-lg">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-base-content">
                Welcome to Morning Pod
              </h1>
              <p className="py-6 text-base-content/70">
                AI-powered podcast generation from your favorite news sources.
                Start your day with personalized audio content.
              </p>
              <Button variant="primary" size="lg">
                Generate Your First Episode
              </Button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">UI Component Showcase</h2>
            <p className="text-base-content/70 mb-4">
              🎨 Try different themes using the theme switcher in the navigation
              to see how all components adapt automatically!
            </p>

            {/* Button Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button btnStyle="outline" variant="primary">
                  Outline
                </Button>
                <Button btnStyle="ghost">Ghost</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button loading>Loading</Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Progress</h3>
              <div className="space-y-2">
                <Progress value={32} variant="primary" />
                <Progress value={70} variant="success" />
                <Progress value={45} variant="warning" />
              </div>
            </div>

            {/* Select */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select</h3>
              <div className="max-w-xs">
                <Select variant="primary" defaultValue="">
                  <option disabled value="">
                    Choose a news source
                  </option>
                  <option>TLDR Newsletter</option>
                  <option>Hacker News</option>
                  <option>Morning Brew</option>
                </Select>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Audio Controls</h3>
              <div className="space-y-2">
                <label className="text-sm text-base-content/70">Volume</label>
                <Slider variant="primary" defaultValue={50} />
                <label className="text-sm text-base-content/70">
                  Playback Speed
                </label>
                <Slider
                  variant="accent"
                  defaultValue={100}
                  min={50}
                  max={200}
                />
              </div>
            </div>

            {/* Dialog */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dialog</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="info">Open Settings</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Podcast Settings</DialogTitle>
                    <DialogDescription>
                      Configure your podcast generation preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Voice Model</span>
                      </label>
                      <Select defaultValue="Alloy">
                        <option>Alloy</option>
                        <option>Echo</option>
                        <option>Fable</option>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button btnStyle="outline">Cancel</Button>
                    <Button variant="primary">Save Settings</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* API Test Component */}
        <ApiTest />

        {/* Theme Preview Cards */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Theme System Demo</h2>
            <p className="text-base-content/70 mb-4">
              All components use semantic colors that automatically adapt to any
              theme:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="alert alert-info">
                <span>Info: Uses semantic info color</span>
              </div>
              <div className="alert alert-success">
                <span>Success: Adapts to theme</span>
              </div>
              <div className="alert alert-warning">
                <span>Warning: Always readable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
