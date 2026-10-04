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
      `${chalk.red(s.sampleOriginal.substring(0, 20))} -> ${chalk.green(s.sampleMock)}`
    ]);
  }

  return `\n${table.toString()}\n`;
}

/**
 * Visual display of raw captured error log
 */
export function printRawContext(content: string, source: string): void {
  const lines = content.trim().split('\n');
  const previewLines = lines.slice(0, 8);
  const remaining = lines.length - previewLines.length;

  console.log(`\n  ${chalk.bold.cyan('[1/4 RAW CONTEXT CAPTURED]')}`);
  console.log(`  ${chalk.dim(`Source: ${source} · Size: ${content.length} bytes · ${lines.length} lines`)}`);
  console.log(chalk.dim('  ┌' + '─'.repeat(70)));
  for (const line of previewLines) {
    console.log(`  ${chalk.dim('│')} ${chalk.dim(line.substring(0, 95))}`);
  }
  if (remaining > 0) {
    console.log(`  ${chalk.dim('│')} ${chalk.dim.italic(`... [${remaining} more lines loaded in memory]`)}`);
  }
  console.log(chalk.dim('  └' + '─'.repeat(70)));
}

/**
 * Visual Red/Green sanitization diff
 * Red: Sensitive real-world secret
 * Green: Synthetic safe mock replacement
 */
export function printSanitizationDiff(occurrences: MaskedOccurrence[], total: number): void {
  console.log(`\n  ${chalk.bold.magenta('[2/4 LOCAL PRIVACY SANITIZATION]')}`);
  console.log(`  ${chalk.dim(`Redacted ${total} sensitive values locally. Network transmission payload is safe.`)}`);
  console.log(`  ${chalk.red.bold('[-] RED')} ${chalk.dim('= sensitive host secret')}  ->  ${chalk.green.bold('[+] GREEN')} ${chalk.dim('= synthetic mock')}\n`);

  // Deduplicate occurrences by original string for clean readable diff display
  const seen = new Set<string>();
  const uniqueOccurrences = occurrences.filter((occ) => {
    if (seen.has(occ.original)) return false;
    seen.add(occ.original);
    return true;
  });

  for (const occ of uniqueOccurrences) {
    const catLabel = chalk.dim(`[${occ.category}]`);
    console.log(`  ${chalk.red.bold('[-]')} ${chalk.red(occ.original)} ${catLabel}`);
    console.log(`  ${chalk.green.bold('[+]')} ${chalk.green(occ.mock)}`);
    console.log('');
  }
}

/**
 * Intermediate step: Payload sent to LLM
 */
export function printStepPayload(payload: string): void {
  console.log(`\n  ${chalk.bold.yellow('[INTERMEDIATE STEP: CLOAKED PAYLOAD SENT TO LLM]')}`);
  console.log(`  ${chalk.dim('All sensitive identifiers replaced with synthetic mocks. Zero secret leakage.')}`);
  console.log(chalk.dim('  ┌' + '─'.repeat(70)));
  const lines = payload.trim().split('\n');
  for (const line of lines.slice(0, 25)) {
    console.log(`  ${chalk.dim('│')} ${line.substring(0, 95)}`);
  }
  if (lines.length > 25) {
    console.log(`  ${chalk.dim('│')} ${chalk.dim.italic(`... [${lines.length - 25} more lines in full payload]`)}`);
  }
  console.log(chalk.dim('  └' + '─'.repeat(70)));
}

/**
 * Intermediate step: Raw model response before rehydration
 */
export function printRawAiResponse(rawResponse: string): void {
  console.log(`\n  ${chalk.bold.yellow('[INTERMEDIATE STEP: RAW LLM RESPONSE (UNREHYDRATED)]')}`);
  console.log(`  ${chalk.dim('Notice the AI response references synthetic mocks (e.g. cloak-db-mock).')}`);
  console.log(chalk.dim('  ┌' + '─'.repeat(70)));
  const lines = rawResponse.trim().split('\n');
  for (const line of lines.slice(0, 30)) {
    console.log(`  ${chalk.dim('│')} ${line.substring(0, 95)}`);
  }
  if (lines.length > 30) {
    console.log(`  ${chalk.dim('│')} ${chalk.dim.italic(`... [${lines.length - 30} more lines]`)}`);
  }
  console.log(chalk.dim('  └' + '─'.repeat(70)));
}

/**
 * Intermediate step: Token inversion ledger
 */
export function printRehydrationLedger(occurrences: MaskedOccurrence[]): void {
  console.log(`\n  ${chalk.bold.yellow('[INTERMEDIATE STEP: REHYDRATION LEDGER]')}`);
  console.log(`  ${chalk.dim('Local deterministic inversion from synthetic mock back to host identifier:')}\n`);

  const seen = new Set<string>();
  for (const occ of occurrences) {
    if (seen.has(occ.mock)) continue;
    seen.add(occ.mock);
    console.log(`  ${chalk.green(occ.mock)}  ->  ${chalk.bold.white(occ.original)}  ${chalk.dim(`(${occ.category})`)}`);
  }
  console.log('');
}

/**
 * Final rehydrated solution display
 */
export function printFinalOutput(finalResponse: string, restoredCount: number): void {
  console.log(`\n  ${chalk.bold.green('[4/4 FINAL REHYDRATED FIX]')}`);
  console.log(chalk.dim('  ' + '─'.repeat(72)));
  console.log(finalResponse);
  console.log(chalk.dim('  ' + '─'.repeat(72)));
  if (restoredCount > 0) {
    console.log(`  ${chalk.green(`[OK] Successfully rehydrated ${restoredCount} original host identifiers.`)}`);
  }
  console.log(`  ${chalk.dim('Ready to paste or apply to your local terminal / codebase.\n')}`);
}
