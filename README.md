# commonlisp-vscode

Common Lisp Editing Extension for vscode

## Features
- Common Lisp syntax highlight, Auto indenting/formating, folding.
- (Optional) Structural editing and navigation provided by [strict-paredit-vscode](https://github.com/ailisp/strict-paredit-vscode).
- Autocompletion, documentation on hover, go to definition, compile & load file, REPL backed by [cl-lsp](https://github.com/ailisp/cl-lsp) language server.

## Requirements

- Install [roswell](https://github.com/roswell/roswell) and have `~/.roswell/bin` in `PATH`
- Install [cl-lsp](https://github.com/ailisp/cl-lsp): `ros install ailisp/cl-lsp`
- (Recommend) Install [strict-paredit-vscode](https://github.com/ailisp/strict-paredit-vscode): `ext install ailisp.strict-paredit`, which provides best parens edit experience close to Emacs.

## Known Issues

- REPL is a seperate process to language server, would be nice to be the same one
- On hover document has some additional not helpful information.
- No debugger, but planned to come soon.

## Credits
[cl-lsp](https://github.com/cxxxr/cl-lsp) provides a complete common lisp language server protocol and a mostly working LSP client for vscode. I forked cl-lsp to fix some issues on it and this repo is fix to its vscode plugin to support recent version of vscode and adding a few improvements: auto indenting on newline and run REPL.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.3

- Fix auto indenting on newline, close to edit lisp file in emacs

### 0.0.2

- Fix on lsp side to recognize lisp symbols on hover
- Add option to set lsp path

### 0.0.1

Initial release of commonlisp-vscode, support all features mentioned in readme

**Enjoy!**
