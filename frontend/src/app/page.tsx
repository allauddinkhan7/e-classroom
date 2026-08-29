import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>E-Classroom</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>It&apos;s working</Button>
        </CardContent>
      </Card>
    </main>
  );
}