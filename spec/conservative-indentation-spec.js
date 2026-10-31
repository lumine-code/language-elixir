describe("Conservative elixir indentation", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-elixir");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.elixir"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });

  afterEach(() => editor?.destroy());

  for (const [name, source, row, columns] of [
    ["an open list", "values = [\n]", 0, 4],
    ["a complete expression", "values = [1, 2]", 0, 0],
    ["interpolation in an open list", 'values = ["#{value}",\n]', 0, 4],
    ["a literal", 'value = "([{"', 0, 0],
    ["a comment", "# ([{", 0, 0],
    ["a do block", "if ready do\nend", 0, 4],
    ["an inline keyword argument", "if ready, do: work()", 0, 0],
    ["an else header", "if ready do\n    work()\nelse\nend", 2, 4],
  ]) {
    it(`keeps the intended level after ${name}`, async () => {
      editor.setText(source);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([row, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(row + 1)).toBe(" ".repeat(columns));
      expect(editor.getCursorBufferPosition().column).toBe(columns);
    });
  }

  it("dedents a closing delimiter only when it is typed at the start of a row", async () => {
    editor.setText("values = [" + "\n    ");
    await editor.whenGrammarSettled();
    editor.setCursorBufferPosition([1, Infinity]);
    editor.insertText("]", { autoIndent: true, autoDecreaseIndent: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(1)).toBe("]");
  });

  it("preserves multiline literal contents during explicit reindent", async () => {
    const source = 'text = """\n\tkeep this tab\n  keep these spaces\n"""\n';
    editor.setText(source);
    await editor.whenGrammarSettled();
    editor.getBuffer().clearUndoStack();
    editor.autoIndentBufferRows(0, editor.getLastBufferRow() - 1);
    await editor.whenGrammarSettled();
    expect(editor.getText()).toBe(source);
    editor.autoIndentBufferRows(0, editor.getLastBufferRow() - 1);
    expect(editor.getText()).toBe(source);
  });

  it("does not treat unfinished sigil delimiters as code containers", async () => {
    for (const source of [
      "value = ~r({",
      "value = ~s{raw",
      "value = ~s[raw",
      "value = ~S(raw",
      'value = "{',
    ]) {
      editor.setText(source);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([0, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(1)).withContext(source).toBe("");
    }
  });

  it("retains the inherited margin inside an unfinished sigil", async () => {
    for (const value of ["~r({", "~s{raw", "~s[raw"]) {
      editor.setText(`if ready do\n    value = ${value}`);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([1, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(2)).withContext(value).toBe("    ");
    }
  });

  it("keeps real code containers and interpolation independent of sigil delimiters", async () => {
    for (const source of [
      "values = [",
      "values = {",
      "if ready do",
      "values = [~r(foo),",
      "values = {~s[foo],",
      "value = ~s{#{[\n]}}",
    ]) {
      editor.setText(source);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([0, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(1)).withContext(source).toBe("    ");
    }
  });
});
