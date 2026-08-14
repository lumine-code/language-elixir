# language-elixir

Elixir language support.

## Features

- **Grammars**: provides Tree-sitter grammars, built from [tree-sitter-elixir](https://github.com/elixir-lang/tree-sitter-elixir).
- **Syntax highlighting**: full tree-sitter grammar coverage for Elixir files.
- **Folding**: folds blocks from the parse tree rather than by indentation.

## Installation

To install `language-elixir` search for it in the Install pane of the Lumine settings, or run the command `lumine --install lumine-code/language-elixir`.

## Services

- `hyperlink.injection`: consumed to highlight URLs inside Elixir files as clickable links.
- `todo.injection`: consumed to highlight `TODO`-style markers inside comments.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
