import { cn } from "@/lib/utils";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/**
 * Renders AI chat messages with markdown & basic HTML support.
 * Supports: **bold**, *italic*, [links](url), ## headings, - lists, line breaks.
 * Content comes from our own AI so dangerouslySetInnerHTML is safe here.
 */
export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const html = parseMarkdown(content);
  return (
    <div
      className={cn(
        "text-sm leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-all [&_hr]:my-2 [&_hr]:border-current [&_hr]:opacity-20",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyInline(text: string): string {
  return (
    text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em style="opacity:0.9">$1</em>')
      // Links — only allow https for security; inherit color from parent
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;text-underline-offset:2px;opacity:0.85;word-break:break-all" onclick="event.stopPropagation()">$1 ↗</a>'
      )
      // Inline code
      .replace(
        /`([^`]+)`/g,
        '<code style="background:rgba(0,0,0,0.1);border-radius:3px;padding:1px 4px;font-size:11px;font-family:monospace">$1</code>'
      )
  );
}

function parseMarkdown(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = escapeHtml(rawLine);

    // Heading 3
    if (line.startsWith("### ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<p style="font-weight:700;font-size:0.85em;margin-top:8px;margin-bottom:2px">${applyInline(line.slice(4))}</p>`);
      continue;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<p style="font-weight:700;font-size:0.95em;margin-top:10px;margin-bottom:3px">${applyInline(line.slice(3))}</p>`);
      continue;
    }

    // Heading 1
    if (line.startsWith("# ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<p style="font-weight:700;font-size:1.05em;margin-top:10px;margin-bottom:4px">${applyInline(line.slice(2))}</p>`);
      continue;
    }

    // List item (- or •)
    if (/^[-•] /.test(line)) {
      if (!inList) { result.push('<ul style="margin:4px 0;padding:0">'); inList = true; }
      result.push(`<li style="display:flex;gap:6px;align-items:flex-start;margin:2px 0"><span style="opacity:0.6;flex-shrink:0;margin-top:1px;font-size:11px">•</span><span>${applyInline(line.slice(2))}</span></li>`);
      continue;
    }

    // Close list on non-list line
    if (inList && line.trim() !== "") {
      result.push("</ul>");
      inList = false;
    }

    // Empty line → spacer
    if (line.trim() === "") {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push('<div style="height:5px"></div>');
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***") {
      result.push('<hr style="margin:6px 0;border:none;border-top:1px solid currentColor;opacity:0.2" />');
      continue;
    }

    // Regular paragraph
    result.push(`<p style="line-height:1.55">${applyInline(line)}</p>`);
  }

  if (inList) result.push("</ul>");
  return result.join("");
}
