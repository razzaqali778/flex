import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import type { ExtensionAction, ExtensionCatalogFile } from './catalogTypes';
import { runCatalogAction } from './flexApi';

let output: vscode.OutputChannel;
let catalog: ExtensionCatalogFile;

function loadCatalog(): ExtensionCatalogFile {
  const file = path.join(__dirname, '..', 'catalog.json');
  return JSON.parse(fs.readFileSync(file, 'utf8')) as ExtensionCatalogFile;
}

function apiUrl(): string {
  return vscode.workspace.getConfiguration('flex').get<string>('apiUrl') ?? catalog.defaultApiUrl;
}

function webUrl(): string {
  return vscode.workspace.getConfiguration('flex').get<string>('webUrl') ?? catalog.defaultWebUrl;
}

function show(data: unknown, title: string) {
  output.appendLine(`\n--- ${title} ---`);
  output.appendLine(JSON.stringify(data, null, 2));
  output.show(true);
}

function vscodeActions(): ExtensionAction[] {
  return catalog.actions.filter((a) => a.hosts.includes('vscode'));
}

async function executeAction(action: ExtensionAction) {
  if (action.kind === 'open-web') {
    await vscode.env.openExternal(vscode.Uri.parse(webUrl()));
    return;
  }

  if (action.kind === 'navigate' && action.route) {
    const url = `${webUrl()}${action.route}`;
    await vscode.env.openExternal(vscode.Uri.parse(url));
    return;
  }

  const result = await runCatalogAction(action, apiUrl());
  if (!result.ok) {
    vscode.window.showErrorMessage(result.error ?? `${action.label} failed`);
    return;
  }

  show(result.data, action.label);
  if (action.kind === 'produce') {
    vscode.window.showInformationMessage(`${action.label} — check Flex Governance`);
  } else if (action.kind === 'connect') {
    vscode.window.showInformationMessage(`Flex API connected (${apiUrl()})`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  catalog = loadCatalog();
  output = vscode.window.createOutputChannel('Flex FinOps');

  for (const action of vscodeActions()) {
    const commandId = action.commandId ? `flex.${action.commandId}` : `flex.action.${action.id}`;
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, () => executeAction(action))
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('flex.runAction', async () => {
      const pick = await vscode.window.showQuickPick(
        vscodeActions().map((a) => ({
          label: a.label,
          description: a.description,
          detail: `${a.kind}${a.pluginId ? ` · ${a.pluginId}` : ''}`,
          action: a,
        })),
        { placeHolder: 'Flex plugin actions (same catalog as Chrome)' }
      );
      if (pick) await executeAction(pick.action);
    })
  );

  output.appendLine('Flex FinOps — multi-host plugin catalog loaded.');
  output.appendLine(`API: ${apiUrl()} · Web: ${webUrl()}`);
  output.appendLine('Run "Flex: Connect to API" or "Flex: Run Plugin Action…"');
}

export function deactivate() {
  output?.dispose();
}
