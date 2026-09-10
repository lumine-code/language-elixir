; Punctuation

; `%` introduces a map or a struct literal.
"%" @punctuation.definition.map.elixir

"," @punctuation.separator.comma.elixir
";" @punctuation.terminator.statement.elixir

"(" @punctuation.definition.arguments.begin.bracket.round.elixir
")" @punctuation.definition.arguments.end.bracket.round.elixir
"[" @punctuation.definition.list.begin.bracket.square.elixir
"]" @punctuation.definition.list.end.bracket.square.elixir
"{" @punctuation.definition.tuple.begin.bracket.curly.elixir
"}" @punctuation.definition.tuple.end.bracket.curly.elixir

; `<< >>` delimits a binary.
"<<" @punctuation.definition.binary.begin.elixir
">>" @punctuation.definition.binary.end.elixir

; Literals

[
  (boolean)
  (nil)
] @constant.other.elixir

[
  (integer)
  (float)
] @constant.numeric.elixir

(char) @constant.other.elixir

; Identifiers

; * regular
(identifier) @variable.other.elixir

; * unused
(
  (identifier) @comment.line.unused.elixir
  (#match? @comment.line.unused.elixir "^_")
)

; * special
(
  (identifier) @constant.language.elixir
  (#any-of? @constant.language.elixir "__MODULE__" "__DIR__" "__ENV__" "__CALLER__" "__STACKTRACE__")
)

; Comment

((comment) @comment.line.elixir
  (#set! adjust.endBeforeFirstMatchOf "\\r?$"))

; Quoted content

(interpolation
  "#{" @punctuation.section.embedded.begin.elixir
  "}" @punctuation.section.embedded.end.elixir) @meta.embedded.line.interpolation.elixir

(escape_sequence) @constant.character.escape.elixir

[
  (string)
  (charlist)
] @string.quoted.double.elixir

[
  (atom)
  (quoted_atom)
  (keyword)
  (quoted_keyword)
] @constant.other.symbol.elixir

; Note that we explicitly target sigil quoted start/end, so they are not overridden by delimiters

(sigil) @string.other.elixir

([
  "\""
  "\"\"\""
  "'"
  "'''"
  "("
  ")"
  "/"
  "<"
  ">"
  "["
  "]"
  "{"
  "}"
  "|"
] @string.other.elixir
  (#is? test.childOfType sigil))

((sigil) @string.quoted.double.elixir
  (#is? test.matchAt "firstNamedChild ^[sS]$"))

([
  "\""
  "\"\"\""
  "'"
  "'''"
  "("
  ")"
  "/"
  "<"
  ">"
  "["
  "]"
  "{"
  "}"
  "|"
] @string.quoted.double.elixir
  (#is? test.childOfType sigil)
  (#is? test.matchAt "parent.firstNamedChild ^[sS]$"))

((sigil) @string.quoted.double.regex.elixir
  (#is? test.matchAt "firstNamedChild ^[rR]$"))

([
  "\""
  "\"\"\""
  "'"
  "'''"
  "("
  ")"
  "/"
  "<"
  ">"
  "["
  "]"
  "{"
  "}"
  "|"
] @string.quoted.double.regex.elixir
  (#is? test.childOfType sigil)
  (#is? test.matchAt "parent.firstNamedChild ^[rR]$"))

; Calls

; * local function call
(call
  target: (identifier) @entity.name.function.elixir)

; * remote function call
(call
  target: (dot
    right: (identifier) @entity.name.function.elixir))

; * field without parentheses or block
(call
  target: (dot
    right: (identifier) @variable.other.member.elixir)
  .)

; * remote call without parentheses or block (overrides above)
(call
  target: (dot
    left: [
      (alias)
      (atom)
    ]
    right: (identifier) @entity.name.function.elixir)
  .)

; * definition keyword
(call
  target: (identifier) @keyword.control.elixir
  (#any-of? @keyword.control.elixir "def" "defdelegate" "defexception" "defguard" "defguardp" "defimpl" "defmacro" "defmacrop" "defmodule" "defn" "defnp" "defoverridable" "defp" "defprotocol" "defstruct"))

; * kernel or special forms keyword
(call
  target: (identifier) @keyword.control.elixir
  (#any-of? @keyword.control.elixir "alias" "case" "cond" "for" "if" "import" "quote" "raise" "receive" "require" "reraise" "super" "throw" "try" "unless" "unquote" "unquote_splicing" "use" "with"))

; * just identifier in function definition
((identifier) @entity.name.function.elixir
  (#is? test.childOfType arguments)
  (#is? test.matchAt "parent.previousNamedSibling ^def(?:delegate|guardp?|macrop?|n|np|p)?$"))

; * guarded identifier in function definition
(binary_operator
  left: (identifier) @entity.name.function.elixir
  operator: "when"
  (#is? test.matchAt "parent.parent.previousNamedSibling ^def(?:delegate|guardp?|macrop?|n|np|p)?$"))

; * pipe into identifier (function call)
(binary_operator
  operator: "|>"
  right: (identifier) @entity.name.function.elixir)

; * pipe into identifier (definition)
(binary_operator
  operator: "|>"
  right: (identifier) @variable.other.elixir
  (#is? test.matchAt "parent.parent.previousNamedSibling ^def(?:delegate|guardp?|macrop?|n|np|p)?$"))

; * pipe into field without parentheses (function call)
(binary_operator
  operator: "|>"
  right: (call
    target: (dot
      right: (identifier) @entity.name.function.elixir)))

; Operators

; * capture operand
(unary_operator
  operator: "&"
  operand: (integer) @keyword.operator.elixir)

(operator_identifier) @keyword.operator.elixir

(unary_operator
  operator: _ @keyword.operator.elixir)

(binary_operator
  operator: _ @keyword.operator.elixir)

(dot
  operator: _ @keyword.operator.elixir)

(stab_clause
  operator: _ @keyword.operator.elixir)

; * module attribute
(unary_operator
  operator: "@" @entity.other.attribute-name.elixir
  operand: [
    (identifier) @entity.other.attribute-name.elixir
    (call
      target: (identifier) @entity.other.attribute-name.elixir)
    (boolean) @entity.other.attribute-name.elixir
    (nil) @entity.other.attribute-name.elixir
  ])

; * doc string
(unary_operator
  operator: "@" @comment.line.doc.elixir
  operand: (call
    target: (identifier) @comment.line.doc.__attribute__.elixir
    (arguments
      [
        (string) @comment.line.doc.elixir
        (charlist) @comment.line.doc.elixir
        (sigil) @comment.line.doc.elixir
        (boolean) @comment.line.doc.elixir
      ]))
  (#any-of? @comment.line.doc.__attribute__.elixir "moduledoc" "typedoc" "doc"))

([
  "\""
  "\"\"\""
  "'"
  "'''"
  "("
  ")"
  "/"
  "<"
  ">"
  "["
  "]"
  "{"
  "}"
  "|"
] @comment.line.doc.elixir
  (#is? test.childOfType sigil)
  (#is? test.typeAt "parent.parent arguments")
  (#is? test.typeAt "parent.parent.parent call")
  (#is? test.typeAt "parent.parent.parent.parent unary_operator")
  (#is? test.matchAt "parent.parent.parent.firstNamedChild ^(?:moduledoc|typedoc|doc)$"))

; Module

(alias) @entity.name.namespace.elixir

(call
  target: (dot
    left: (atom) @entity.name.namespace.elixir))

; Reserved keywords

["when" "and" "or" "not" "in" "not in" "fn" "do" "end" "catch" "rescue" "after" "else"] @keyword.control.elixir
