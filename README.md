# commonlisp-vscode

Common Lisp Editing Extension for vscode

## Update
**cl-lsp is updated with a cleaner REPL! Please update by do `git pull` in `~/.roswell/local-projects/ailisp/cl-lsp`**

## Features
- Common Lisp syntax highlight, Auto indenting/formating, folding.
- (Optional) Structural editing and navigation provided by [strict-paredit-vscode](https://github.com/ailisp/strict-paredit-vscode).
- Autocompletion, documentation on hover, go to definition, compile & load file, REPL backed by [cl-lsp](https://github.com/ailisp/cl-lsp) language server.

## Requirements

- Install [roswell](https://github.com/roswell/roswell) and have `~/.roswell/bin` in `PATH`
- Install [cl-lsp](https://github.com/ailisp/cl-lsp), above two is required because original package doesn't have readline support in prepl.
  - `ros install ailisp/linedit`
  - `ros install ailisp/prepl`
  - `ros install ailisp/cl-lsp`
- (Recommend) Install [strict-paredit-vscode](https://github.com/ailisp/strict-paredit-vscode): `ext install ailisp.strict-paredit`, which provides best parens edit experience close to Emacs.
- (Recommend) Use sbcl instead of sbcl_bin in roswell, to get go to definition with symbols in `common-lisp` package:
  - `ros install sbcl`
  - `ros use sbcl`

## Known Issues

- No debugger, but planned to come soon.

## Credits
[cl-lsp](https://github.com/cxxxr/cl-lsp) provides a complete common lisp language server protocol and a mostly working LSP client for vscode. I forked cl-lsp to fix some issues on it and this repo is fix to its vscode plugin to support recent version of vscode and adding a few improvements: auto indenting on newline and run REPL.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.3.0
- avoid lsp server error mixed with REPL, record error in log

### 0.2.0

- support readline editing (arrow key works, history, etc.) in repl
- default keybinding to eval (Ctrl+Enter) and to start REPL (Ctrl+Shift+Enter) 

### 0.1.1

- Support open multiple commonlisp-vscode in multiple vscode window

### 0.1.0

- REPL doesn't show lsp messages, is a clean PREPL now

### 0.0.4

- LSP and REPL use same lisp process, so evaluate in file is available to REPL now

### 0.0.3

- Fix auto indenting on newline, close to edit lisp file in emacs

### 0.0.2

- Fix on lsp side to recognize lisp symbols on hover
- Add option to set lsp path

### 0.0.1

Initial release of commonlisp-vscode, support all features mentioned in readme

**Enjoy!**
