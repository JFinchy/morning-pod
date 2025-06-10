import { CheckCircle, Zap } from "lucide-react";

{{#if isDemo}}import { Button } from "@/components/ui";{{/if}}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-base-content mb-6">
              Welcome to{" "}
              <span className="text-primary">{{projectName}}</span>
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Your new Next.js application with TypeScript, Tailwind CSS, and battle-tested patterns.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-primary" />}
              title="Next.js 15"
              description="Latest Next.js with App Router and server components"
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-success" />}
              title="TypeScript"
              description="Full type safety with strict configuration"
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-info" />}
              title="Tailwind + DaisyUI"
              description="Beautiful, responsive design system"
            />
{{#if hasTrpc}}            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-warning" />}
              title="tRPC"
              description="End-to-end type-safe APIs"
            />{{/if}}
{{#if hasDatabase}}            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-secondary" />}
              title="Drizzle ORM"
              description="Type-safe database operations"
            />{{/if}}
{{#if hasAnalytics}}            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-accent" />}
              title="PostHog Analytics"
              description="Product analytics and feature flags"
            />{{/if}}
          </div>

          {/* Call to Action */}
          <div className="bg-base-200 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to build?</h2>
            <p className="text-base-content/70 mb-6">
              Check out the documentation and start building your amazing application.
            </p>
{{#if isDemo}}            <div className="flex gap-4 justify-center">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                View Docs
              </Button>
            </div>{{/if}}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-base-200 rounded-xl p-6 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-base-content/60 text-sm">{description}</p>
    </div>
  );
}