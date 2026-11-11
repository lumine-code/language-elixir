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

  function reportSettlementFailure(languageMode) {
    try {
      const brief = (value, limit = 128) => String(value ?? "").slice(0, limit);
      const errorState = (error, depth = 0) =>
        !error || depth > 1
          ? null
          : {
              name: brief(error.name),
              code: brief(error.code),
              reason: brief(error.reason),
              message: brief(error.message, 512),
              stack: brief(error.stack, 2048),
              failure: error.failure && {
                code: brief(error.failure.code),
                reason: brief(error.failure.reason),
                activeParseMs: error.failure.activeParseMs,
                allocatedMemoryBytes: error.failure.allocatedMemoryBytes,
              },
              cause: errorState(error.cause, depth + 1),
            };
      const buffer = editor.getBuffer(),
        currentMode = buffer.getLanguageMode();
      const availability = editor.getSyntaxAvailability();
      const logged = console.error(
        "ELIXIR_QUERY_LOCALITY_SETTLEMENT_FAILURE " +
          JSON.stringify({
            mode: languageMode?.constructor?.name,
            currentMode: currentMode?.constructor?.name,
            sameMode: currentMode === languageMode,
            destroyed: languageMode?.destroyed,
            synchronous: languageMode?.shouldParseSynchronously?.(),
            asynchronousSyntax: languageMode?.asynchronousSyntax,
            parseError: errorState(languageMode?.lastTransactionParseError),
            availability: {
              available: availability.available,
              reason: availability.reason,
              failure: errorState({ failure: availability.failure }),
            },
            buffer: {
              revision: buffer.getTextRevision(),
              length: buffer.getLength(),
              rows: buffer.getLineCount(),
            },
          }),
      );
      logged?.catch?.(() => {});
    } catch {
      // Preserve the original failed expectation even if diagnostics fail.
    }
  }

  async function setUp(text) {
    editor.setText(text);
    let languageMode;
    try {
      languageMode = editor.getBuffer().getLanguageMode();
    } catch {
      // A diagnostic read must not change the settlement result.
    }
    const settled = await editor.whenGrammarSettled();
    if (!settled) reportSettlementFailure(languageMode);
    expect(settled).toBe(true);
  }

  function rootNode() {
    return editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
  }

  async function capturesForRows(startRow, endRow) {
    const queryCaptures = (await editor.getGrammar().getQuery("highlightsQuery")).captures(
      rootNode(),
      {
        startPosition: new Point(startRow, 0),
        endPosition: new Point(endRow, 0),
      },
    );
    return queryCaptures;
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
    expect(rootNode().hasError).toBe(false);
    expect((await capturesForRows(2998, 3004)).length).toBeLessThanOrEqual(96);
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
    expect(rootNode().hasError).toBe(false);
    expect((await capturesForRows(2998, 3004)).length).toBeLessThanOrEqual(64);

    const docLines = ['@doc ~s"""'];
    for (let i = 0; i < 6000; i++) docLines.push(`line #{value_${i}}`);
    docLines.push('"""', "def value, do: :ok");
    await setUp(docLines.join("\r\n"));
    expect(rootNode().hasError).toBe(false);
    expect((await capturesForRows(2998, 3004)).length).toBeLessThanOrEqual(80);
  });
});
