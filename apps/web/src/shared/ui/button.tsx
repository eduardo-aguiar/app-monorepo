"use client";

export function Button({ label }: { label: string }) {
  return (
    <button
      onClick={() => alert("Olá do monorepo!")}
      style={{
        background: "#6d5dfc",
        color: "white",
        border: "none",
        borderRadius: 10,
        padding: "10px 20px",
        fontSize: 16,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
