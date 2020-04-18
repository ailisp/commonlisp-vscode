# commonlisp-vscode

Common Lisp Editing Extension for vscode

## Features
- Common Lisp syntax highlight, Auto indenting/formating, folding.
- (Optional) Structural editing and navigation provided by [strict-paredit-vscode](https://github.com/ailisp/strict-paredit-vscode).
- Autocompletion, documentation on hover, compile & load file, REPL backed by [cl-lsp](https://github.com/cxxxr/cl-lsp) language server.

## Requirements

- Install [roswell](https://github.com/roswell/roswell) and have `~/.roswell/bin` in `PATH`
- Install [cl-lsp](https://github.com/cxxxr/cl-lsp): `ros install cxxxr/cl-lsp`
- (Recommend) Install [strict-paredit-vscode](https://github.com/ailisp/strict-paredit-vscode): `ext install ailisp.strict-paredit`, which provides best parens edit experience close to Emacs.

## Known Issues

- Auto formatting is not perfect, need improvement in common lisp language server side
- REPL is a seperate process to language server, would be nice to be the same one
- On hover document has some additional not helpful information.
- No debugger, but planned to come soon.

## Credits
[cl-lsp](https://github.com/cxxxr/cl-lsp) provides a complete common lisp language server protocol and a mostly working LSP client for vscode. This is a fix to it to support recent version of vscode and adding a few improvements: auto indenting on newline and run REPL.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of commonlisp-vscode

**Enjoy!**
