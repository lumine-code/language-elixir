describe("Elixir upstream grammar and injection regressions", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-elixir");
    await lumine.packages.activatePackage("language-shellscript");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.elixir"));
  });

  afterEach(() => editor?.destroy());

  it("injects Bash into the BASH sigil", async () => {
    editor.setText('command = ~BASH"echo $HOME"\n');
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.scopeDescriptorForBufferPosition([0, 23]).getScopesArray()).toContain(
      "source.shell",
    );
  });

  it("keeps Bash fragments around escaped delimiters and parser recovery", async () => {
    const text = String.raw`command = ~}BASH"echo \"quoted\" $HOME"`;
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
    const root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    expect(root.hasError).toBe(true);
    for (const fragment of ["echo", "quoted", "HOME"]) {
      expect(
        editor.scopeDescriptorForBufferPosition([0, text.indexOf(fragment)]).getScopesArray(),
      ).toContain("source.shell");
    }
  });

  it("attaches do/end blocks to anonymous function calls", async () => {
    editor.setText("callback.() do\n  :ok\nend\n");
    expect(await editor.whenGrammarSettled()).toBe(true);
    const root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    expect(root.hasError).toBe(false);
    const call = root.descendantsOfType("call")[0];
    expect(call.descendantsOfType("do_block").length).toBe(1);

    editor.getBuffer().clearUndoStack();
    editor.setTextInBufferRange(
      [
        [1, 2],
        [1, 5],
      ],
      ":changed",
    );
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent).hasError).toBe(
      false,
    );
    editor.undo();
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.getText()).toBe("callback.() do\n  :ok\nend\n");
  });

  it("keeps clause patterns whose identifiers start with word operators", async () => {
    const patterns = ["invalid", "android", "order", "whenever"];
    editor.setText(
      patterns
        .map(
          (pattern) =>
            `case value do\n  other ->\n    f(s)\n    %{s | id: 1}\n\n  ${pattern} ->\n    result\nend\n`,
        )
        .join("\n"),
    );
    expect(await editor.whenGrammarSettled()).toBe(true);
    const root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    expect(root.hasError).toBe(false);
    const clauses = root.descendantsOfType("stab_clause");
    expect(clauses.map((clause) => clause.namedChildren[0].text)).toEqual(
      patterns.flatMap((pattern) => ["other", pattern]),
    );
  });
});
