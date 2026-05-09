export function log(level, fn, msg, data) {
  const tag = { info: "ℹ️", ok: "✅", err: "❌", warn: "⚠️" }[level] || "📌";
  const prefix = `[Viva][${fn}]`;

  if (data !== undefined) {
    console.log(`${tag} ${prefix} ${msg}`, data);
  } else {
    console.log(`${tag} ${prefix} ${msg}`);
  }
}