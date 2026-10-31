describe("language-elixir editing defaults", () => {
  let editor;
  beforeEach(async () => {
    jasmine.useRealClock();
    await lumine.packages.activatePackage("language-source");
    await lumine.packages.activatePackage("language-elixir");

    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.elixir"));
    editor.setText("empty?(value)");
    await editor.whenGrammarSettled();
  });
  afterEach(() => editor?.destroy());

  it("selects a complete language identifier without including adjacent syntax", () => {
    const index = editor.getText().indexOf("empty?");
    editor.setCursorBufferPosition(editor.getBuffer().positionForCharacterIndex(index + 2));
    editor.selectWordsContainingCursors();
    expect(editor.getSelectedText()).toBe("empty?");
  });
  it("keeps explicit user word-boundary overrides", () => {
    const options = { scopeSelector: ".source.elixir" };
    try {
      lumine.config.set("editor.nonWordCharacters", "?", options);
      const index = editor.getText().indexOf("empty?");
      editor.setCursorBufferPosition(editor.getBuffer().positionForCharacterIndex(index + 2));
      editor.selectWordsContainingCursors();
      expect(editor.getSelectedText()).not.toBe("empty?");
    } finally {
      lumine.config.unset("editor.nonWordCharacters", options);
    }
  });

  it("selects an extensionless executable from an exact interpreter shebang", () => {
    for (const text of [
      "#!/usr/bin/env elixir.bat",
      "#!/elixir/bin/elixir.bat",
      "#!C:\\elixir\\bin\\elixir.bat",
      "#!/usr/bin/env.exe -S elixir.bat --version",

      "#!/usr/bin/elixir",
      "#!/usr/bin/env elixir\n",
      "#!/usr/bin/env -S elixir --version\n",
    ]) {
      expect(lumine.grammars.selectGrammar("executable", text).scopeName).toBe("source.elixir");
    }
    for (const text of [
      "#!/usr/bin/not-elixir",
      "#!/usr/bin/env elixir-wrapper",
      "#!/usr/bin/env elixir.exe",
      "#!/elixir/bin/elixir.exe",
      "#!/usr/bin/env elixir.exe-wrapper",
      "some elixir prose",
    ]) {
      expect(lumine.grammars.selectGrammar("executable", text).scopeName).not.toBe("source.elixir");
    }
  });
});
