"use client";

import { Session } from "next-auth";

interface Props {
  comment: any;
  session: Session | null;
  lang: "fr" | "en";
  editingId: string | null;
  editContent: string;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditChange: (v: string) => void;
  onEditSave: () => void;
  onDelete: () => void;
}

export function CommentItem({
  comment, session, lang,
  editingId, editContent,
  onEditStart, onEditCancel, onEditChange, onEditSave, onDelete,
}: Props) {
  const isOwner = session?.user?.id === comment.authorId;
  const isEditing = editingId === comment.id;

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-medium text-neutral-500">
          {comment.author?.name?.[0] ?? "?"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-neutral-900">{comment.author?.name}</span>
          <span className="text-xs text-neutral-400">
            {new Date(comment.createdAt).toLocaleDateString(
              lang === "fr" ? "fr-FR" : "en-US",
              { day: "numeric", month: "short" }
            )}
          </span>
          {isOwner && !isEditing && (
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={onEditStart}
                className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1 transition"
              >
                <i className="ti ti-edit text-sm" aria-hidden="true" /> {lang === "fr" ? "Modifier" : "Edit"}
              </button>
              <button
                onClick={onDelete}
                className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1 transition"
              >
                <i className="ti ti-trash text-sm" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
            <textarea
              value={editContent}
              onChange={(e) => onEditChange(e.target.value)}
              rows={2}
              className="w-full bg-transparent text-sm text-neutral-900 resize-none focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={onEditCancel}
                className="text-xs px-3 py-1 border border-neutral-200 rounded-lg text-neutral-500 hover:bg-neutral-100 transition"
              >
                {lang === "fr" ? "Annuler" : "Cancel"}
              </button>
              <button
                onClick={onEditSave}
                className="text-xs px-3 py-1 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition"
              >
                {lang === "fr" ? "Enregistrer" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-600 leading-relaxed">{comment.content}</p>
        )}
      </div>
    </div>
  );
}