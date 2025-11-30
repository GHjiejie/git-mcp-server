// Git 工具处理器

import { executeGitCommand } from "../git-executor.js";
import { generateWeeklyReport } from "../tools/weekly-report.js";
import { GitCommandArgs, WeeklyReportArgs } from "../types.js";

export async function handleGitStatus(args: GitCommandArgs) {
  const { directory } = args;
  const result = await executeGitCommand(directory, "git status");
  return {
    content: [
      {
        type: "text",
        text: result.stdout || result.stderr,
      },
    ],
  };
}

export async function handleGitLog(args: GitCommandArgs) {
  const { directory, limit = 10 } = args;
  const result = await executeGitCommand(
    directory,
    `git log --oneline -n ${limit}`
  );
  return {
    content: [
      {
        type: "text",
        text: result.stdout || "没有提交记录",
      },
    ],
  };
}

export async function handleGitDiff(args: GitCommandArgs) {
  const { directory, file, staged = false } = args;
  const stagedFlag = staged ? "--staged" : "";
  const fileArg = file ? `-- ${file}` : "";
  const result = await executeGitCommand(
    directory,
    `git diff ${stagedFlag} ${fileArg}`.trim()
  );
  return {
    content: [
      {
        type: "text",
        text: result.stdout || "没有变更",
      },
    ],
  };
}

export async function handleGitAdd(args: GitCommandArgs) {
  const { directory, files } = args;
  const filesArg = files.join(" ");
  const result = await executeGitCommand(directory, `git add ${filesArg}`);
  return {
    content: [
      {
        type: "text",
        text: result.stdout || `成功添加文件: ${filesArg}`,
      },
    ],
  };
}

export async function handleGitCommit(args: GitCommandArgs) {
  const { directory, message } = args;
  const result = await executeGitCommand(
    directory,
    `git commit -m "${message.replace(/"/g, '\\"')}"`
  );
  return {
    content: [
      {
        type: "text",
        text: result.stdout || result.stderr,
      },
    ],
  };
}

export async function handleGitPush(args: GitCommandArgs) {
  const { directory, remote = "origin", branch } = args;
  const branchArg = branch ? branch : "";
  const result = await executeGitCommand(
    directory,
    `git push ${remote} ${branchArg}`.trim()
  );
  return {
    content: [
      {
        type: "text",
        text: result.stdout || result.stderr || "推送成功",
      },
    ],
  };
}

export async function handleGitPull(args: GitCommandArgs) {
  const { directory, remote = "origin", branch } = args;
  const branchArg = branch ? branch : "";
  const result = await executeGitCommand(
    directory,
    `git pull ${remote} ${branchArg}`.trim()
  );
  return {
    content: [
      {
        type: "text",
        text: result.stdout || result.stderr,
      },
    ],
  };
}

export async function handleGitBranch(args: GitCommandArgs) {
  const { directory, action, branchName } = args;

  let command = "";
  if (action === "list") {
    command = "git branch -a";
  } else if (action === "create" && branchName) {
    command = `git branch ${branchName}`;
  } else if (action === "delete" && branchName) {
    command = `git branch -d ${branchName}`;
  } else {
    throw new Error("无效的分支操作或缺少分支名称");
  }

  const result = await executeGitCommand(directory, command);
  return {
    content: [
      {
        type: "text",
        text: result.stdout || result.stderr,
      },
    ],
  };
}

export async function handleGitCheckout(args: GitCommandArgs) {
  const { directory, branch } = args;
  const result = await executeGitCommand(directory, `git checkout ${branch}`);
  return {
    content: [
      {
        type: "text",
        text: result.stdout || result.stderr,
      },
    ],
  };
}

export async function handleGitRemote(args: GitCommandArgs) {
  const { directory, action, name, url } = args;

  let command = "";
  if (action === "list") {
    command = "git remote -v";
  } else if (action === "add" && name && url) {
    command = `git remote add ${name} ${url}`;
  } else if (action === "remove" && name) {
    command = `git remote remove ${name}`;
  } else {
    throw new Error("无效的远程仓库操作或缺少必要参数");
  }

  const result = await executeGitCommand(directory, command);
  return {
    content: [
      {
        type: "text",
        text: result.stdout || result.stderr || "操作成功",
      },
    ],
  };
}

export async function handleGitWeeklyReport(args: WeeklyReportArgs) {
  const report = await generateWeeklyReport(args);
  return {
    content: [
      {
        type: "text",
        text: report,
      },
    ],
  };
}
