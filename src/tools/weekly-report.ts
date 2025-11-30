// 周报生成器

import { executeGitCommand } from "../git-executor.js";
import { generateSummaryWithOllama } from "../ollama-client.js";
import { GitCommit, GitStats, WeeklyReportArgs } from "../types.js";
import { DEFAULT_MODEL } from "../config.js";

export async function generateWeeklyReport(
  args: WeeklyReportArgs
): Promise<string> {
  const {
    directory,
    author,
    branch,
    days = 7,
    model = DEFAULT_MODEL,
    useAI = true,
  } = args;

  // 获取最近 N 天的提交
  const sinceDate = `${days}.days.ago`;
  const authorArg = author ? `--author="${author}"` : "";
  const sinceArg = `--since="${sinceDate}"`;
  const branchArg = branch ? `"${branch}"` : "";

  const buildLogCommand = (extra: string) =>
    ["git log", authorArg, sinceArg, extra, branchArg]
      .filter((part) => part && part.trim())
      .join(" ");

  // 获取详细的提交信息
  const logCommand = buildLogCommand(
    '--pretty=format:"%h|%an|%ae|%ad|%s" --date=short'
  );
  const logResult = await executeGitCommand(directory, logCommand);

  // 获取统计信息
  const statsCommand = buildLogCommand("--pretty=tformat: --numstat");
  const statsResult = await executeGitCommand(directory, statsCommand);

  // 获取参与的作者列表
  const authorsCommand = [
    "git log",
    sinceArg,
    '--pretty=format:"%an"',
    branchArg,
    "| sort -u",
  ]
    .filter((part) => part && part.trim())
    .join(" ");
  const authorsResult = await executeGitCommand(directory, authorsCommand);

  if (!logResult.stdout.trim()) {
    return `📊 最近 ${days} 天内没有提交记录`;
  }

  // 解析提交记录
  const commits: GitCommit[] = logResult.stdout
    .trim()
    .split("\n")
    .map((line) => {
      const [hash, authorName, email, date, message] = line.split("|");
      return { hash, authorName, email, date, message };
    });

  // 计算代码统计
  const stats = calculateStats(statsResult.stdout);
  const authors = authorsResult.stdout
    .trim()
    .split("\n")
    .filter((a) => a);

  // 按日期分组提交
  const commitsByDate = groupCommitsByDate(commits);

  // 生成周报
  return buildReport({
    commits,
    stats,
    authors,
    commitsByDate,
    days,
    branch,
    author,
    useAI,
    model,
  });
}

function calculateStats(stdout: string): GitStats {
  let additions = 0;
  let deletions = 0;

  if (stdout.trim()) {
    stdout
      .trim()
      .split("\n")
      .forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const add = parseInt(parts[0]) || 0;
          const del = parseInt(parts[1]) || 0;
          additions += add;
          deletions += del;
        }
      });
  }

  return { additions, deletions };
}

function groupCommitsByDate(commits: GitCommit[]): Record<string, GitCommit[]> {
  const commitsByDate: Record<string, GitCommit[]> = {};

  commits.forEach((commit) => {
    if (!commitsByDate[commit.date]) {
      commitsByDate[commit.date] = [];
    }
    commitsByDate[commit.date].push(commit);
  });

  return commitsByDate;
}

async function buildReport(options: {
  commits: GitCommit[];
  stats: GitStats;
  authors: string[];
  commitsByDate: Record<string, GitCommit[]>;
  days: number;
  branch?: string;
  author?: string;
  useAI: boolean;
  model: string;
}): Promise<string> {
  const {
    commits,
    stats,
    authors,
    commitsByDate,
    days,
    branch,
    author,
    useAI,
    model,
  } = options;

  const report: string[] = [];
  const commitCount = commits.length;

  // 标题和基本信息
  report.push("# 📊 Git 提交周报\n");
  report.push(`📅 统计周期：最近 ${days} 天`);
  if (branch) {
    report.push(`🌿 分支：${branch}`);
  }
  if (author) {
    report.push(`👤 作者：${author}`);
  }
  report.push("");

  // 总体统计
  report.push("## 📈 总体统计\n");
  report.push(`- 📝 总提交次数：${commitCount} 次`);
  report.push(`- 👥 参与人数：${authors.length} 人`);
  report.push(`- ➕ 新增代码：${stats.additions} 行`);
  report.push(`- ➖ 删除代码：${stats.deletions} 行`);
  report.push(`- 📊 净增代码：${stats.additions - stats.deletions} 行\n`);

  // 参与人员
  if (authors.length > 0) {
    report.push("## 👥 参与人员\n");
    authors.forEach((authorName) => {
      const authorCommits = commits.filter(
        (c) => c.authorName === authorName
      ).length;
      report.push(`- ${authorName}：${authorCommits} 次提交`);
    });
    report.push("");
  }

  // 提交详情
  report.push("## 📝 提交详情\n");
  const sortedDates = Object.keys(commitsByDate).sort().reverse();

  sortedDates.forEach((date) => {
    report.push(`### ${date}\n`);
    commitsByDate[date].forEach((commit) => {
      report.push(`- **[${commit.hash}]** ${commit.message}`);
      report.push(`  👤 ${commit.authorName}`);
    });
    report.push("");
  });

  // 工作总结
  report.push("## 💡 工作总结\n");

  if (useAI) {
    // 使用 AI 生成总结
    report.push("_正在使用 AI 生成智能总结..._\n");

    const commitsText = commits
      .map((c) => `[${c.date}] ${c.authorName}: ${c.message}`)
      .join("\n");

    const aiSummary = await generateSummaryWithOllama(commitsText, model);
    report.push(aiSummary);
    report.push("");
  } else {
    // 使用传统分类总结
    const categorizedSummary = generateCategorizedSummary(commits);
    report.push(...categorizedSummary);
  }

  return report.join("\n");
}

function generateCategorizedSummary(commits: GitCommit[]): string[] {
  const report: string[] = [];
  report.push("本周主要工作内容：");

  const featureCommits = commits.filter(
    (c) =>
      c.message.toLowerCase().includes("feat") ||
      c.message.toLowerCase().includes("feature") ||
      c.message.includes("新增") ||
      c.message.includes("添加")
  );

  const fixCommits = commits.filter(
    (c) =>
      c.message.toLowerCase().includes("fix") ||
      c.message.includes("修复") ||
      c.message.includes("bug")
  );

  const refactorCommits = commits.filter(
    (c) =>
      c.message.toLowerCase().includes("refactor") ||
      c.message.includes("重构") ||
      c.message.includes("优化")
  );

  if (featureCommits.length > 0) {
    report.push(`\n**新功能开发** (${featureCommits.length} 项)：`);
    featureCommits.slice(0, 5).forEach((c) => {
      report.push(`- ${c.message}`);
    });
  }

  if (fixCommits.length > 0) {
    report.push(`\n**问题修复** (${fixCommits.length} 项)：`);
    fixCommits.slice(0, 5).forEach((c) => {
      report.push(`- ${c.message}`);
    });
  }

  if (refactorCommits.length > 0) {
    report.push(`\n**代码优化** (${refactorCommits.length} 项)：`);
    refactorCommits.slice(0, 5).forEach((c) => {
      report.push(`- ${c.message}`);
    });
  }

  return report;
}
