"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image as ImageExtension } from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 sm:size-9",
        active && "bg-slate-200 text-slate-900",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (https://...)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(url.trim())) {
      window.alert("Use um endereço começando com https://, mailto: ou tel:");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const c = () => editor.chain().focus();

  return (
    <div className="sticky top-14 z-10 flex flex-wrap gap-0.5 border-b bg-white/95 p-1 backdrop-blur lg:top-0">
      <ToolbarButton label="Negrito" active={state.bold} onClick={() => c().toggleBold().run()}><Bold className="size-4" /></ToolbarButton>
      <ToolbarButton label="Itálico" active={state.italic} onClick={() => c().toggleItalic().run()}><Italic className="size-4" /></ToolbarButton>
      <ToolbarButton label="Sublinhado" active={state.underline} onClick={() => c().toggleUnderline().run()}><Underline className="size-4" /></ToolbarButton>
      <span className="mx-1 my-2 w-px bg-slate-200" aria-hidden />
      <ToolbarButton label="Título" active={state.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className="size-4" /></ToolbarButton>
      <ToolbarButton label="Subtítulo" active={state.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className="size-4" /></ToolbarButton>
      <ToolbarButton label="Lista" active={state.bullet} onClick={() => c().toggleBulletList().run()}><List className="size-4" /></ToolbarButton>
      <ToolbarButton label="Lista numerada" active={state.ordered} onClick={() => c().toggleOrderedList().run()}><ListOrdered className="size-4" /></ToolbarButton>
      <ToolbarButton label="Citação" active={state.quote} onClick={() => c().toggleBlockquote().run()}><Quote className="size-4" /></ToolbarButton>
      <ToolbarButton label="Linha divisória" onClick={() => c().setHorizontalRule().run()}><Minus className="size-4" /></ToolbarButton>
      <span className="mx-1 my-2 w-px bg-slate-200" aria-hidden />
      <ToolbarButton label="Inserir link" active={state.link} onClick={setLink}><Link2 className="size-4" /></ToolbarButton>
      {state.link && (
        <ToolbarButton label="Remover link" onClick={() => c().extendMarkRange("link").unsetLink().run()}><Unlink className="size-4" /></ToolbarButton>
      )}
      <ToolbarButton label="Inserir imagem" onClick={onImage}><ImagePlus className="size-4" /></ToolbarButton>
      <span className="mx-1 my-2 w-px bg-slate-200" aria-hidden />
      <ToolbarButton label="Desfazer" disabled={!state.canUndo} onClick={() => c().undo().run()}><Undo2 className="size-4" /></ToolbarButton>
      <ToolbarButton label="Refazer" disabled={!state.canRedo} onClick={() => c().redo().run()}><Redo2 className="size-4" /></ToolbarButton>
    </div>
  );
}

/** Editor de texto rico. O HTML vai no formulário pelo input oculto `name`. */
export function RichTextEditor({ name, defaultValue, id }: { name: string; defaultValue: string; id?: string }) {
  const [html, setHtml] = useState(defaultValue);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      ImageExtension,
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "rich-text tiptap !text-base",
        "aria-label": "Conteúdo",
        ...(id ? { id } : {}),
      },
    },
    onUpdate: ({ editor: e }) => setHtml(e.isEmpty ? "" : e.getHTML()),
  });

  return (
    <div className="overflow-clip rounded-lg border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40">
      <input type="hidden" name={name} value={html} />
      {editor ? (
        <>
          <Toolbar editor={editor} onImage={() => setLibraryOpen(true)} />
          <EditorContent editor={editor} />
          <MediaLibraryDialog
            open={libraryOpen}
            onOpenChange={setLibraryOpen}
            onSelect={(media) => editor.chain().focus().setImage({ src: media.url, alt: media.alt || "" }).run()}
          />
        </>
      ) : (
        <div className="min-h-64 animate-pulse bg-slate-50" />
      )}
    </div>
  );
}
