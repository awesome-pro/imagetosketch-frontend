import { Sketchify } from "@/components/sketchify";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Sketchify</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Transform your photos into beautiful pencil sketches with AI
            </p>
          </div>
          <Sketchify />
        </div>
      </div>
    </main>
  );
}
