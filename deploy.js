import { NodeSSH } from "node-ssh";
import path from "node:path";

const ssh = new NodeSSH();

await ssh.connect({
  host: "143.198.161.137",
  username: "root",
  privateKey: "C:/Users/anyah/.ssh/id_ed25519",
});

await ssh.putDirectory(path.resolve("."), "/root/AgroSense_AI", {
  recursive: true,
  concurrency: 5,
  validate: (itemPath) => {
    const base = path.basename(itemPath);

    if (base === "node_modules") return false;
    if (base === ".git") return false;
    if (base.startsWith(".")) return false;
    if (base.endsWith(".log")) return false;

    return true;
  },
});

console.log("Upload complete");
ssh.dispose();
