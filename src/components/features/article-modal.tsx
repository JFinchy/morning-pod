import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GenerationModal } from "@/components/features/generation-modal";
import { Zap, ExternalLink, Calendar, BookOpen } from "lucide-react";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: any | null;
}

export function ArticleModal({ isOpen, onClose, article }: ArticleModalProps) {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full p-0 gap-0 bg-base-100">
        <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur-md border-b border-base-200 p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-primary badge-outline badge-sm uppercase text-[10px] font-black tracking-widest py-2 px-3">
                {article.source}
              </span>
              <span className="text-xs text-base-content/50 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(article.publishedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <DialogTitle className="text-2xl md:text-3xl font-black leading-tight mb-2 pr-8">
              {article.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 md:px-10 py-8 md:py-12 space-y-10 max-w-4xl mx-auto">
          {article.summary && (
            <div className="p-5 bg-base-200 rounded-2xl border border-base-300">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Summary
                </span>
              </div>
              <p className="text-base-content/80 text-lg leading-relaxed font-medium">
                {article.summary}
              </p>
            </div>
          )}

          <div className="prose prose-lg max-w-none text-base-content/80 prose-p:leading-8 prose-headings:font-bold prose-a:text-primary mt-12 mb-8">
            {/* If we have full content, split by double newlines for basic paragraphs */}
            {article.content ? (
              <div className="flex flex-col gap-6 text-[1.1rem]">
                {article.content
                  .split("\n\n")
                  .map((paragraph: string, i: number) => (
                    <p
                      key={i}
                      className="leading-relaxed whitespace-pre-line tracking-wide"
                    >
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="italic text-base-content/50 border-l-4 border-base-300 pl-4 py-2">
                Full article content not available in cache.
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 bg-base-100/95 backdrop-blur-md border-t border-base-200 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Button
            className="w-full md:w-auto btn-ghost text-base-content/60 hover:text-base-content"
            onClick={() => window.open(article.url, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Read Original
          </Button>

          <GenerationModal
            autoStart={true}
            initialSource={{
              id:
                article.sourceId ||
                article.source.toLowerCase().replace(/\s+/g, "-"),
              name: article.source,
              url: article.url,
            }}
            trigger={
              <Button
                className="w-full md:w-auto btn-primary rounded-xl h-12 px-8 gap-2 shadow-lg hover:shadow-primary/20 transition-all font-bold"
                onClick={onClose}
              >
                <Zap className="w-5 h-5" />
                Generate Audio Episode
              </Button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
