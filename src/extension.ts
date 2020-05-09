import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as net from 'net';
import * as portfinder from 'portfinder';
import * as util from 'util';
import {
    workspace, Disposable, ExtensionContext, languages,
    window, commands, InputBoxOptions
} from 'vscode';
import {
    LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions,
    TransportKind, TextDocumentIdentifier, TextDocumentPositionParams,
    StreamInfo
} from 'vscode-languageclient';

let languageClient: LanguageClient;

let repl: vscode.Terminal | null = null;

let lspPort: number | null = null;

async function startLSP() {
    lspPort = await portfinder.getPortPromise({
        port: 10003
    });
    return vscode.window.createTerminal({
        name: "Common Lisp REPL",
        shellPath: "cl-lsp",
        shellArgs: ["tcp", lspPort.toString()],
        hideFromUser: true,
    });
}

async function startRepl() {
    if (repl) {
        repl.show();
    } else {
        let repl = await startLSP();
        repl.show();
    }
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
}

function retry<T>(retries: number, fn: () => Promise<T>): Promise<T> {
    return fn().catch((err) => retries > 1 ? retry(retries - 1, fn) : Promise.reject(err));
}
const pause = (duration: number) => new Promise(res => setTimeout(res, duration));
function backoff<T>(retries: number, fn: () => Promise<T>, delay = 500): Promise<T> {
    return fn().catch(err => retries > 1
        ? pause(delay).then(() => backoff(retries - 1, fn, delay * 2))
        : Promise.reject(err));
}

export async function activate(context: ExtensionContext) {
    let serverOptions: ServerOptions;
    serverOptions = async () => {
        let lsppath = workspace.getConfiguration().get<string>('commonlisp.lsppath')!;
        let client = new net.Socket();
        repl = await startLSP();
        return await backoff(5, () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error("Connection to lsp times out"))
                }, 1000);
                client.connect(lspPort!, "127.0.0.1");
                client.once('connect', () => {
                    resolve({
                        reader: client,
                        writer: client,
                    });
                });
            })
        });
    };

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
    context.subscriptions.push(vscode.window.onDidCloseTerminal(async (terminal) => {
        if (terminal == repl) {
            repl = null;
            repl = await startLSP();
        }
    }));
}

export function deactivate() {
}
