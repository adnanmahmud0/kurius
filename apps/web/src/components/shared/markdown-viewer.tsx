"use client";

import React from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  if (!content || !content.trim()) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm italic">
        No content available.
      </div>
    );
  }

  return (
    <div
      className={`prose prose-neutral dark:prose-invert text-foreground/90 max-w-none leading-relaxed ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node: _node, ...props }) => (
            <h1
              className="text-foreground border-border/60 mt-6 mb-4 border-b pb-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
              {...props}
            />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2
              className="text-foreground mt-6 mb-3 flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl"
              {...props}
            />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3
              className="text-foreground mt-4 mb-2 text-lg font-semibold tracking-tight sm:text-xl"
              {...props}
            />
          ),
          h4: ({ node: _node, ...props }) => (
            <h4 className="text-foreground mt-3 mb-1.5 text-base font-semibold" {...props} />
          ),
          p: ({ node: _node, ...props }) => (
            <p
              className="text-muted-foreground my-2.5 text-sm leading-relaxed sm:text-base"
              {...props}
            />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul
              className="text-muted-foreground my-3 ml-6 list-disc space-y-1 text-sm sm:text-base"
              {...props}
            />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol
              className="text-muted-foreground my-3 ml-6 list-decimal space-y-1 text-sm sm:text-base"
              {...props}
            />
          ),
          li: ({ node: _node, ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="bg-primary/5 border-primary text-foreground my-4 rounded-r-lg border-l-4 p-4 text-sm italic sm:text-base"
              {...props}
            />
          ),
          hr: ({ node: _node, ...props }) => <hr className="border-border/80 my-6" {...props} />,
          a: ({ node: _node, ...props }) => (
            <a
              className="text-primary font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          table: ({ node: _node, ...props }) => (
            <div className="border-border my-6 w-full overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          thead: ({ node: _node, ...props }) => (
            <thead
              className="bg-muted/50 border-border text-foreground border-b text-xs font-semibold uppercase"
              {...props}
            />
          ),
          th: ({ node: _node, ...props }) => (
            <th className="text-foreground px-4 py-3 font-semibold" {...props} />
          ),
          td: ({ node: _node, ...props }) => (
            <td className="border-border/50 text-muted-foreground border-t px-4 py-3" {...props} />
          ),
          strong: ({ node: _node, ...props }) => (
            <strong className="text-foreground font-bold" {...props} />
          ),
          code: ({ node: _node, className: codeClass, children, ...props }) => {
            const isInline = !codeClass;
            if (isInline) {
              return (
                <code
                  className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-muted/80 border-border text-foreground my-4 overflow-x-auto rounded-lg border p-4 font-mono text-xs">
                <code {...props}>{children}</code>
              </pre>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
