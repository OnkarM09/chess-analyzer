import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoachingResponse } from "@/lib/coaching/schema";

interface CoachCardProps {
  coaching: CoachingResponse | null;
  isLoading: boolean;
}

export function CoachCard({ coaching, isLoading }: CoachCardProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-2"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6"></div>
        </CardContent>
      </Card>
    );
  }

  if (!coaching) return null;

  return (
    <Card className="border-blue-200 dark:border-blue-900 shadow-sm">
      <CardHeader className="pb-3 bg-blue-50/50 dark:bg-blue-900/20">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-blue-900 dark:text-blue-300">
            {coaching.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-white dark:bg-zinc-950">
            {coaching.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-sm leading-relaxed">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">What happened?</p>
          <p className="text-zinc-600 dark:text-zinc-300">{coaching.explanation}</p>
        </div>
        
        <div>
          <p className="font-semibold text-red-600 dark:text-red-400 mb-1">What did you miss?</p>
          <p className="text-zinc-600 dark:text-zinc-300">{coaching.whatYouMissed}</p>
        </div>
        
        {coaching.immediateThreat && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-100 dark:border-red-900/50">
            <p className="font-medium text-red-800 dark:text-red-300 mb-1">⚠️ Threat Alert</p>
            <p className="text-red-700 dark:text-red-200 text-xs">{coaching.immediateThreat}</p>
          </div>
        )}
        
        <div>
          <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Why is the suggested move better?</p>
          <p className="text-zinc-600 dark:text-zinc-300">{coaching.whyBestMoveWorks}</p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
          <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">💡 Lesson</p>
          <p className="text-blue-700 dark:text-blue-200 text-xs italic">{coaching.lesson}</p>
        </div>
        
        {coaching.tags && coaching.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {coaching.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] uppercase">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
