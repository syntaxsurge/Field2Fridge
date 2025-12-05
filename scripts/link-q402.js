// Ensure q402 monorepo packages are resolvable under @q402/*
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const targets = [
  {
    name: "@q402/core",
    from: path.join(root, "node_modules", "q402", "packages", "core"),
    to: path.join(root, "node_modules", "@q402", "core"),
  },
  {
    name: "@q402/middleware-express",
    from: path.join(root, "node_modules", "q402", "packages", "middleware-express"),
    to: path.join(root, "node_modules", "@q402", "middleware-express"),
  },
];

for (const pkg of targets) {
  if (!fs.existsSync(pkg.from)) {
    console.warn(`[q402-link] Skipping ${pkg.name}: source not found at ${pkg.from}`);
    continue;
  }

  if (fs.existsSync(pkg.to)) {
    console.log(`[q402-link] ${pkg.name} already linked`);
    continue;
  }

  fs.mkdirSync(path.dirname(pkg.to), { recursive: true });
  fs.symlinkSync(pkg.from, pkg.to, "dir");
  console.log(`[q402-link] Linked ${pkg.name} → ${pkg.from}`);
}
