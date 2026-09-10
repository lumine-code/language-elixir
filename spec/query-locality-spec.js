const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

describe("Elixir highlight query locality", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-elixir");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.elixir"));
  });

  afterEach(() => editor?.destroy());

  async function setUp(text) {
    editor.setText(text);
    await editor.languageMode.ready;
  }

  function capturesForRows(startRow, endRow) {
    const layer = editor.languageMode.rootLanguageLayer;
    return layer.queries.highlightsQuery.captures(layer.tree.rootNode, {
      startPosition: new Point(startRow, 0),
      endPosition: new Point(endRow, 0),
    });
  }

  it("keeps definition classification local inside a 6000-row call", async () => {
    const query = fs.readFileSync(
      path.join(__dirname, "..", "grammars", "elixir-highlights.scm"),
      "utf8",
    );
    expect(query).not.toContain(
      "(call\n  target: (identifier) @keyword.control.elixir\n  (arguments",
    );

    await setUp("def greet, do: :ok");
    expect(editor.scopeDescriptorForBufferPosition([0, 4]).getScopesArray()).toContain(
      "entity.name.function.elixir",
    );

    const lines = ["def benchmark do"];
    for (let i = 0; i < 6000; i++) lines.push(`  value_${i}`);
    lines.push("end");
    await setUp(lines.join("\r\n"));
    expect(editor.languageMode.rootLanguageLayer.tree.rootNode.hasError).toBe(false);
    expect(capturesForRows(2998, 3004).length).toBeLessThanOrEqual(96);
  });

  it("keeps sigil scopes local inside a 6000-row sigil", async () => {
    const query = fs.readFileSync(
      path.join(__dirname, "..", "grammars", "elixir-highlights.scm"),
      "utf8",
    );
    expect(query).not.toMatch(/\(sigil\s+\(sigil_name\)/);
    expect(query).not.toContain("quoted_start: _ @");
    expect(query).not.toContain("quoted_end: _ @");

    await setUp("value = ~s(content)\nregex = ~r/pattern/");
    expect(editor.scopeDescriptorForBufferPosition([0, 11]).getScopesArray()).toContain(
      "string.quoted.double.elixir",
    );
    expect(editor.scopeDescriptorForBufferPosition([0, 18]).getScopesArray()).toContain(
      "string.quoted.double.elixir",
    );
    expect(editor.scopeDescriptorForBufferPosition([1, 11]).getScopesArray()).toContain(
      "string.quoted.double.regex.elixir",
    );

    const lines = ['value = ~s"""'];
    for (let i = 0; i < 6000; i++) lines.push(`line #{value_${i}}`);
    lines.push('"""');
    await setUp(lines.join("\r\n"));
    expect(editor.languageMode.rootLanguageLayer.tree.rootNode.hasError).toBe(false);
    expect(capturesForRows(2998, 3004).length).toBeLessThanOrEqual(64);

    const docLines = ['@doc ~s"""'];
    for (let i = 0; i < 6000; i++) docLines.push(`line #{value_${i}}`);
    docLines.push('"""', "def value, do: :ok");
    await setUp(docLines.join("\r\n"));
    expect(editor.languageMode.rootLanguageLayer.tree.rootNode.hasError).toBe(false);
    expect(capturesForRows(2998, 3004).length).toBeLessThanOrEqual(80);
  });
});
