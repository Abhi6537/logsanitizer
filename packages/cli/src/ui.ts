import chalk from 'chalk';
import Table from 'cli-table3';
import { EntitySummary, MaskedOccurrence } from '@cloak/core';

export const BANNER = `
   ${chalk.hex('#4F46E5')('____ _')}     ${chalk.hex('#6366F1')('___   _')}    ${chalk.hex('#818CF8')('_  __')}
  ${chalk.hex('#4F46E5')('/ ___| |')}   ${chalk.hex('#6366F1')('/ _ \\ / \\')}  ${chalk.hex('#818CF8')('| |/ /')}
 ${chalk.hex('#4F46E5')('| |   | |')}  ${chalk.hex('#6366F1')('| | | / _ \\')} ${chalk.hex('#818CF8')('| \' /')} 
 ${chalk.hex('#4F46E5')('| |___| |__|')} ${chalk.hex('#6366F1')('|_| / ___ \\')}${chalk.hex('#818CF8')('| . \\')} 
  ${chalk.hex('#4F46E5')('\\____|_____\\')}${chalk.hex('#6366F1')('___/_/   \\_\\')}${chalk.hex('#818CF8')('_|\\_\\')}  ${chalk.dim('v1.0.0')}
  ${chalk.dim('───────────────────────────────────────')}
  ${chalk.bold('Local-first privacy shield for AI logs')}
`;

export const MINI_BANNER = `${chalk.bold.hex('#6366F1')('[CLOAK]')} ${chalk.dim('v1.0.0 · Localhost Privacy Shield')}`;

export function printBanner(): void {
  console.log(BANNER);
}

export function printMiniBanner(): void {
  console.log(`\n  ${MINI_BANNER}`);
}

function truncateMiddle(str: string, maxLen = 38): string {
  if (str.length <= maxLen) return str;
  const half = Math.floor((maxLen - 3) / 2);
  return `${str.substring(0, half)}...${str.slice(-half)}`;
}

/**
 * Animated buffer spinner for model reasoning
 */
export function createSpinner(text: string) {
  const frames = ['[ - ]', '[ \\ ]', '[ | ]', '[ / ]'];
  let i = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r  ${chalk.cyan(frames[i++ % frames.length])} ${chalk.dim(text)} `);
  }, 100);

  return {
    stop: (doneMessage?: string) => {
      clearInterval(timer);
      process.stdout.write('\r' + ' '.repeat(text.length + 15) + '\r');
      if (doneMessage) {
        console.log(`  ${chalk.green('[OK]')} ${chalk.bold(doneMessage)}`);
      }
    }
  };
}

/**
 * Clean paired Red -> Green sanitization diff
 * Red (raw sensitive) beside Green (safe mock)
 */
export function printSanitizationPair(occurrences: MaskedOccurrence[], total: number, source: string): void {
  console.log(`\n  ${chalk.bold.cyan('[INPUT SANITIZATION]')} ${chalk.dim(`(Source: ${source})`)}`);
  console.log(`  ${chalk.red.bold('[-] RED: Raw Sensitive Secret')}  ${chalk.dim('->')}  ${chalk.green.bold('[+] GREEN: Safe Synthetic Mock')}\n`);

  const seen = new Set<string>();
  for (const occ of occurrences) {
    if (seen.has(occ.original)) continue;
    seen.add(occ.original);

    const redVal = chalk.red.bold(truncateMiddle(occ.original));
    const greenVal = chalk.green.bold(truncateMiddle(occ.mock));
    const catLabel = chalk.dim(`[${occ.category}]`);

    console.log(`  [-] ${redVal} ${catLabel}`);
    console.log(`   -> [+] ${greenVal}\n`);
  }

  console.log(`  ${chalk.green('[OK]')} ${chalk.dim(`Sanitized ${total} secrets locally. Payload locked for zero-knowledge query.\n`)}`);
}

/**
 * Clean paired Green -> Red rehydration diff
 * Green (mock in model response) beside Red (restored real environment value)
 */
export function printRehydrationPair(occurrences: MaskedOccurrence[]): void {
  console.log(`\n  ${chalk.bold.magenta('[OUTPUT REHYDRATION]')} ${chalk.dim('(Deterministic Local Inversion)')}`);
  console.log(`  ${chalk.green.bold('[+] GREEN: AI Synthetic Mock')}  ${chalk.dim('->')}  ${chalk.red.bold('[-] RED: Restored Local Host Value')}\n`);

  const seen = new Set<string>();
  for (const occ of occurrences) {
    if (seen.has(occ.mock)) continue;
    seen.add(occ.mock);

    const greenVal = chalk.green.bold(truncateMiddle(occ.mock));
    const redVal = chalk.red.bold(truncateMiddle(occ.original));
    const catLabel = chalk.dim(`[${occ.category}]`);

    console.log(`  [+] ${greenVal} ${catLabel}`);
    console.log(`   -> [-] ${redVal}\n`);
  }
}

/**
 * Final clean and clear solution
 */
export function printFinalSolution(solutionText: string): void {
  console.log(`  ${chalk.bold.green('[FINAL SOLUTION]')}`);
  console.log(chalk.dim('  ┌' + '─'.repeat(70)));

  const lines = solutionText.trim().split('\n');
  for (const line of lines) {
    console.log(`  ${chalk.dim('│')} ${line}`);
  }

  console.log(chalk.dim('  └' + '─'.repeat(70)));
  console.log(`  ${chalk.green('[OK]')} ${chalk.dim('All identifiers accurately restored to your real environment.\n')}`);
}

export function formatReport(summaries: EntitySummary[]): string {
  if (summaries.length === 0) {
    return chalk.green('\n  [OK] No sensitive data detected. Content is safe to share as-is.\n');
  }

  const table = new Table({
    head: [
      chalk.cyan('Entity Type'),
      chalk.cyan('Count'),
      chalk.cyan('Example Replacement')
    ],
    style: {
      head: [],
      border: ['grey']
    }
  });

  for (const s of summaries) {
    const formattedCat = s.category.replace(/_/g, ' ');
    table.push([
      formattedCat,
      chalk.yellow(String(s.count)),
      `${chalk.red(truncateMiddle(s.sampleOriginal, 25))} -> ${chalk.green(truncateMiddle(s.sampleMock, 25))}`
    ]);
  }

  return `\n${table.toString()}\n`;
}
