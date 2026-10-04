#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { sanitize, rehydrate } from '@cloak/core';
import {
  printBanner,
  printMiniBanner,
  formatReport,
  createSpinner,
  printSanitizationPair,
  printRehydrationPair,
  printFinalSolution
} from './ui.js';
import { readClipboard, writeClipboard } from './clipboard.js';
import { queryGemma, getLocalGemmaModel } from './ai.js';
import { launchWebDashboard } from './server.js';

const program = new Command();

program
  .name('cloak')
  .description('Local-first developer privacy CLI and proxy for AI logs')
  .version('1.0.0');

// Subcommand: clip (Inspects clipboard, masks secrets, overwrites with safe text)
program
  .command('clip')
  .description('Sanitize current clipboard buffer and update with safe placeholders')
  .option('-v, --verbose', 'Show full masked replacement report')
  .action(async () => {
    try {
      console.log(chalk.dim('  cloak › reading clipboard buffer...'));
      const text = await readClipboard();

      if (!text || text.trim().length === 0) {
        console.log(chalk.yellow('  [!] Clipboard is empty. Nothing to sanitize.\n'));
        return;
      }

      const res = sanitize(text);
      await writeClipboard(res.sanitized);

      console.log(formatReport(res.summary));

      if (res.totalMasked > 0) {
        console.log(chalk.green(`  [OK] Clipboard updated with safe context (${res.totalMasked} secrets masked)`));
        console.log(chalk.dim(`  Session: ${chalk.cyan(res.sessionId)} · safe to paste into AI assistants.`));
        console.log(chalk.dim(`  To restore AI fixes, run: ${chalk.bold('cloak restore')}\n`));
      }
    } catch (err) {
      console.error(chalk.red(`  [ERR] Error: ${err instanceof Error ? err.message : String(err)}\n`));
      process.exit(1);
    }
  });

// Subcommand: restore (Reads AI response on clipboard, restores real environment values)
program
  .command('restore')
  .description('Rehydrate clipboard contents (substitute synthetic mocks back to real values)')
  .option('-s, --session <id>', 'Target specific session ID')
  .action(async (opts) => {
    try {
      console.log(chalk.dim('  cloak › restoring clipboard buffer...'));
      const text = await readClipboard();

      if (!text || text.trim().length === 0) {
        console.log(chalk.yellow('  [!] Clipboard is empty.\n'));
        return;
      }

      const res = rehydrate(text, { sessionId: opts.session });
      await writeClipboard(res.rehydrated);

      if (res.replacementsCount > 0) {
        console.log(chalk.green(`\n  [OK] Restored ${res.replacementsCount} real environment identifiers in clipboard.`));
        console.log(chalk.dim(`  Ready to apply to your local codebase/terminal.\n`));
      } else {
        console.log(chalk.yellow(`\n  [i] No active mock tokens found in clipboard for session ${res.sessionId}.\n`));
      }
    } catch (err) {
      console.error(chalk.red(`  [ERR] Error: ${err instanceof Error ? err.message : String(err)}\n`));
      process.exit(1);
    }
  });

// Subcommand: ask (Sanitizes input/stdin, asks Gemma 4, rehydrates response automatically)
program
  .command('ask [question]')
  .description('Sanitize context, query Gemma 4, and return rehydrated fix')
  .option('-f, --file <path>', 'Path to log or context file to sanitize')
  .option('--local', 'Fast flag: Use local offline Ollama instance directly')
  .option('-m, --model <name>', 'Fast flag: Specific model name')
  .action(async (questionArg, opts) => {
    try {
      const question = questionArg && questionArg.trim().length > 0 
        ? questionArg 
        : 'Analyze this incident log: explain what failed, the root cause, and give the exact fix command.';

      let rawContext = '';
      let contextSource = 'clipboard';

      // 1. Check if a file was provided via -f / --file
      if (opts.file) {
        const { readFileSync, existsSync } = await import('fs');
        if (existsSync(opts.file)) {
          rawContext = readFileSync(opts.file, 'utf-8');
          contextSource = `file (${opts.file})`;
        } else {
          console.error(chalk.red(`\n  [ERR] File not found: ${opts.file}\n`));
          process.exit(1);
        }
      }

      // 2. Check if data was piped in through stdin
      if (!rawContext && !process.stdin.isTTY) {
        rawContext = await new Promise<string>((resolve) => {
          let data = '';
          const onData = (chunk: string) => { data += chunk; };
          const onEnd = () => { cleanup(); resolve(data); };
          const cleanup = () => {
            process.stdin.removeListener('data', onData);
            process.stdin.removeListener('end', onEnd);
            clearTimeout(timer);
          };
          const timer = setTimeout(() => { cleanup(); resolve(data); }, 150);
          process.stdin.setEncoding('utf-8');
          process.stdin.on('data', onData);
          process.stdin.once('end', onEnd);
          process.stdin.resume();
        });
        if (rawContext && rawContext.trim().length > 0) {
          contextSource = 'stdin pipe';
        }
      }

      // 3. Fallback to clipboard if no file or stdin pipe was provided
      if (!rawContext || rawContext.trim().length === 0) {
        try {
          rawContext = await readClipboard();
          if (rawContext && rawContext.trim().length > 0) {
            contextSource = 'clipboard';
          }
        } catch {
          // Ignore if clipboard is not accessible
        }
      }

      const hasContext = rawContext && rawContext.trim().length > 0;
      let sanitizedContext = '';
      let sessionId: string | undefined;
      let occurrences: import('@cloak/core').MaskedOccurrence[] = [];
      let totalMasked = 0;

      if (hasContext) {
        // Step 1: Sanitize and show Red/Green paired diff
        const sanitizedRes = sanitize(rawContext);
        sanitizedContext = sanitizedRes.sanitized;
        sessionId = sanitizedRes.sessionId;
        occurrences = sanitizedRes.occurrences;
        totalMasked = sanitizedRes.totalMasked;

        if (totalMasked > 0) {
          printSanitizationPair(occurrences, totalMasked, contextSource);
        } else {
          console.log(chalk.dim(`\n  cloak › 0 sensitive secrets detected in context.\n`));
        }
      } else {
        console.log(chalk.dim(`\n  cloak › no log context provided (pipe | or use -f <file> or copy error to clipboard)`));
      }

      // Step 2: Runtime engine selection
      const localGemmaName = await getLocalGemmaModel();
      let selectedProvider: 'api' | 'local' = opts.local ? 'local' : 'api';
      let selectedModel: string = opts.model ?? (opts.local ? localGemmaName : 'gemma-4-26b-a4b-it');

      if (!opts.local && !opts.model) {
        const { select } = await import('@inquirer/prompts');
        try {
          const choice = await select<{ provider: 'api' | 'local'; model: string } | 'exit'>({
            message: 'Select Gemma runtime engine:',
            choices: [
              {
                name: `${chalk.bold('Gemma 4 26B-A4B')} ${chalk.cyan('(API)')} · ${chalk.dim('Fast Mixture-of-Experts')}`,
                value: { provider: 'api' as const, model: 'gemma-4-26b-a4b-it' }
              },
              {
                name: `${chalk.bold('Gemma 4 31B')} ${chalk.cyan('(API)')} · ${chalk.dim('Flagship deep reasoning')}`,
                value: { provider: 'api' as const, model: 'gemma-4-31b-it' }
              },
              {
                name: `${chalk.bold('Gemma Local')} ${chalk.green(`(Ollama: ${localGemmaName})`)} · ${chalk.dim('100% Offline')}`,
                value: { provider: 'local' as const, model: localGemmaName }
              },
              {
                name: `${chalk.red('[X] Cancel / Exit')}`,
                value: 'exit'
              }
            ]
          });

          if (choice === 'exit') {
            console.log(chalk.dim('\n  cloak › cancelled by user.\n'));
            process.exit(0);
          }

          selectedProvider = choice.provider;
          selectedModel = choice.model;
        } catch (promptErr: unknown) {
          const err = promptErr as { name?: string };
          if (err?.name === 'ExitPromptError') {
            console.log(chalk.dim('\n  cloak › cancelled by user.\n'));
            process.exit(0);
          }
          throw promptErr;
        }
      }

      // Step 3: Buffer animation while model reasoning
      const fullPrompt = hasContext
        ? `Here are the sanitized logs/context:\n\`\`\`\n${sanitizedContext}\n\`\`\`\n\nQuestion: ${question}`
        : question;

      const systemInstruction =
        'You are an expert systems engineer and software architect. ' +
        'Analyze the user error or logs and provide a direct, precise, actionable fix. ' +
        'Preserve all hostnames, IDs, and placeholders in your commands verbatim so they can be rehydrated.';

      const spinner = createSpinner(`Querying ${selectedModel} (${selectedProvider === 'local' ? 'Ollama Offline' : 'Gemini API'})...`);

      let rawAiResponse = '';
      try {
        rawAiResponse = await queryGemma(fullPrompt, systemInstruction, {
          provider: selectedProvider,
          model: selectedModel
        });
        spinner.stop('Model reasoning complete.');
      } catch (queryErr) {
        spinner.stop();
        throw queryErr;
      }

      // Step 4: Rehydration and clean Green -> Red pair display
      let finalResponse = rawAiResponse;
      if (sessionId) {
        const rehydrateRes = rehydrate(rawAiResponse, { sessionId });
        finalResponse = rehydrateRes.rehydrated;
      }

      if (hasContext && totalMasked > 0) {
        printRehydrationPair(occurrences);
      }

      // Step 5: Final clean solution
      printFinalSolution(finalResponse);
      process.exit(0);
    } catch (err) {
      console.error(chalk.red(`\n  [ERR] Error: ${err instanceof Error ? err.message : String(err)}\n`));
      process.exit(1);
    }
  });

// Subcommand: ui (Launches local companion web dashboard)
program
  .command('ui')
  .description('Launch local companion web dashboard on localhost:3000')
  .action(() => {
    launchWebDashboard();
  });

// Default pipe / stdin mode if arguments are piped directly to cloak
async function handleStdin() {
  let input = '';
  process.stdin.setEncoding('utf-8');

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  if (input.trim().length > 0) {
    const res = sanitize(input);
    process.stdout.write(res.sanitized);
    process.exit(0);
  }
}

const isPiped = !process.stdin.isTTY && process.argv.length <= 2;

if (!isPiped) {
  // Always display the full beautiful ASCII art banner on all commands & help
  printBanner();
}

if (process.argv.length <= 2 && !isPiped) {
  program.outputHelp();
} else if (isPiped) {
  // Pure pipe mode (e.g. cat log | cloak) -> keep stdout clean for piping
  handleStdin();
} else {
  // Named commands (e.g. cloak clip, cloak restore, cloak ask, cloak --help)
  program.parse(process.argv);
}
