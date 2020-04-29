import * as vscode from 'vscode';
import * as child_process from 'child_process';
import {
    workspace, Disposable, ExtensionContext, languages,
    window, commands, InputBoxOptions
} from 'vscode';
import {
    LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions,
    TransportKind, TextDocumentIdentifier, TextDocumentPositionParams
} from 'vscode-languageclient';

let languageClient: LanguageClient;

let repl: vscode.Terminal | null = null;

function startRepl() {
    if (repl) {
        repl.show();
    } else {
        repl = vscode.window.createTerminal(
            "Common Lisp REPL",
            "ros",
            ["run"]
        );
        repl.show();
    }
}

function getWebviewContent() {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>`;
}

function getTextDocumentIdentifier() {
    if (vscode.window.activeTextEditor) {
        let document = vscode.window.activeTextEditor.document;
        let params: TextDocumentIdentifier = {
            uri: document.uri.toString()
        }
        return params;
    } else {
        return null;
    }
}

function compileAndLoadFile() {
    let params = getTextDocumentIdentifier();
    if (params) {
        languageClient.sendNotification("lisp/compileAndLoadFile", params);
    } else {
        vscode.window.showErrorMessage('Need to open a file to compile and load');
    }
}

function evaluate() {
    if (vscode.window.activeTextEditor) {
        let selection = vscode.window.activeTextEditor.selection;
        if (selection.isEmpty) {
            let params: TextDocumentPositionParams = {
                textDocument: getTextDocumentIdentifier()!,
                position: selection.active
            }
            languageClient.sendNotification("lisp/eval", params);
        } else {
            let params = {
                textDocument: getTextDocumentIdentifier(),
                range: selection
            }
            languageClient.sendNotification("lisp/rangeEval", params);
        }
    } else {
        vscode.window.showErrorMessage("Need an editor window to evaluate");
    }
}

function interrupt() {
    languageClient.sendNotification("lisp/interrupt", {});
}

async function newlineAndFormat() {
    let editor = vscode.window.activeTextEditor!;
    let document = editor.document;
    let position = editor.selection.active;
    await editor.edit(e => e.insert(
        position,
        "\n"));
    position = editor.selection.active;
    let edits = await languageClient.sendRequest("textDocument/onTypeFormatting", {
        textDocument: { "uri": "file://" + document.uri.fsPath },
        position,
        ch: "\n",
        options: {
            tabSize: editor.options.tabSize,
            insertSpaces: editor.options.insertSpaces,
        }
    });

    const workEdits = new vscode.WorkspaceEdit();
    workEdits.set(document.uri, edits as vscode.TextEdit[]); // give the edits
    vscode.workspace.applyEdit(workEdits); // apply the edits
    
    // let editor = vscode.window.activeTextEditor!;
    // let document = editor.document;

    // await vscode.commands.executeCommand('editor.action.format');
    // await editor.edit(e => e.delete(new vscode.Range(editor.selection.active.translate({ characterDelta: -1 }), editor.selection.active)));
}



export function activate(context: ExtensionContext) {
    let serverOptions: ServerOptions;

    serverOptions = () => new Promise<child_process.ChildProcess>((resolve, reject) => {
        function spawnServer(...args: string[]): child_process.ChildProcess {
            let lsppath = workspace.getConfiguration().get<string>('commonlisp.lsppath')!;
            console.log(lsppath);
            let childProcess = child_process.spawn(lsppath, ["stdio"]);
            return childProcess;
        }
        resolve(spawnServer());
    });

    let clientOptions: LanguageClientOptions = {
        documentSelector: ["commonlisp"],
        synchronize: {
            configurationSection: 'commonlisp'
        }
    }

    languageClient = new LanguageClient("Common Lisp Language Server", serverOptions, clientOptions);
    languageClient.onReady().then(function (x) {
        languageClient.onNotification("lisp/evalBegin", function (f) {
            window.setStatusBarMessage("Eval...");
        })
        languageClient.onNotification("lisp/evalEnd", function (f) {
            window.setStatusBarMessage("Done");
        })
    })

    context.subscriptions.push(languageClient.start());

    context.subscriptions.push(commands.registerCommand("lisp.compileAndLoadFile", () => compileAndLoadFile()));
    context.subscriptions.push(commands.registerCommand("lisp.eval", () => evaluate()));
    context.subscriptions.push(commands.registerCommand("lisp.interrupt", () => interrupt()));
    context.subscriptions.push(commands.registerCommand("lisp.replStart", () => startRepl()));
    context.subscriptions.push(commands.registerCommand("lisp.newlineAndFormat", newlineAndFormat));
    context.subscriptions.push(vscode.window.onDidCloseTerminal((terminal) => {
        if (terminal == repl) {
            repl = null;
        }
    }));
}

export function deactivate() { }
