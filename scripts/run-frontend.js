const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Read .env file from root directory
const envPath = path.join(__dirname, "..", ".env");
let port = 3000; // default port

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("NEXT_APP_PORT=")) {
            const value = trimmedLine.split("=")[1];
            if (value) {
                port = parseInt(value, 10);
            }
            break;
        }
    }
}

console.log(`Starting frontend on port ${port}...`);

const proc = spawn("npm", ["run", "dev", "--", "-p", port.toString()], {
    cwd: path.join(process.cwd(), "front-end"),
    stdio: "inherit",
    shell: true,
    env: {
        ...process.env,
        PORT: port.toString(),
    },
});

proc.on("exit", (code) => {
    process.exit(code);
});
