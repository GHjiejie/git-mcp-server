// Git 命令执行器

import { exec } from "child_process";
import { promisify } from "util";
import { MAX_BUFFER_SIZE } from "./config.js";

const execAsync = promisify(exec);

export interface GitCommandResult {
  stdout: string;
  stderr: string;
}

export async function executeGitCommand(
  directory: string,
  command: string
): Promise<GitCommandResult> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: directory,
      shell: process.env.SHELL || "/bin/zsh",
      maxBuffer: MAX_BUFFER_SIZE,
    });
    return { stdout, stderr };
  } catch (error: any) {
    throw new Error(`Git 命令执行失败: ${error.message}`);
  }
}
