describe("Elixir upstream injection regressions", () => {
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
});
