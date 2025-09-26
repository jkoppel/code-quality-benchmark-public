import { execa } from "execa";

interface RequiredCmd {
  cmd: "git" | "diffstat";
  helpIfMissing: string;
}

const REQUIRED_COMMANDS: RequiredCmd[] = [
  {
    cmd: "git" as const,
    helpIfMissing: "git - Install from: https://git-scm.com/downloads",
  },
  {
    cmd: "diffstat" as const,
    helpIfMissing:
      "diffstat - Install from: https://invisible-island.net/diffstat/",
  },
];

async function checkCommand(command: RequiredCmd): Promise<string | null> {
  try {
    await execa(command.cmd, ["--version"], { stdio: "ignore" });
    return null;
  } catch {
    return command.helpIfMissing;
  }
}

export async function checkDependenciesPresent(): Promise<void> {
  const missing = (
    await Promise.all(REQUIRED_COMMANDS.map(checkCommand))
  ).filter((result): result is string => result !== null);

  if (missing.length > 0) {
    console.error("❌ Missing required dependencies:");
    console.error();
    for (const dep of missing) {
      console.error(`• ${dep}`);
    }
    console.error();
    console.error("Please install the missing dependencies and try again.");
    process.exit(1);
  }

  console.log("✅ All required dependencies are available");
}
