"use client";

export function Button({ label }: { label: string }) {
  return (
    <button
      onClick={() => alert("Ola do monorepo!")}
      className="rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
    >
      {label}
    </button>
  );
}
