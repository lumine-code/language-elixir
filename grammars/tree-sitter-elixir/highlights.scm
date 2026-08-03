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

(comment) @comment.line.elixir

; Quoted content

(interpolation "#{" @punctuation.special "}" @punctuation.special) @embedded

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

(sigil
  (sigil_name) @_IGNORE_.name__
  quoted_start: _ @string.other.elixir
  quoted_end: _ @string.other.elixir) @string.other.elixir

(sigil
  (sigil_name) @_IGNORE_.name__
  quoted_start: _ @string.quoted.double.elixir
  quoted_end: _ @string.quoted.double.elixir
  (#match? @_IGNORE_.name__ "^[sS]$")) @string.quoted.double.elixir

(sigil
  (sigil_name) @_IGNORE_.name__
  quoted_start: _ @string.quoted.double.regex.elixir
  quoted_end: _ @string.quoted.double.regex.elixir
  (#match? @_IGNORE_.name__ "^[rR]$")) @string.quoted.double.regex.elixir

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
(call
  target: (identifier) @keyword.control.elixir
  (arguments
    [
      (identifier) @entity.name.function.elixir
      (binary_operator
        left: (identifier) @entity.name.function.elixir
        operator: "when")
    ])
  (#any-of? @keyword.control.elixir "def" "defdelegate" "defguard" "defguardp" "defmacro" "defmacrop" "defn" "defnp" "defp"))

; * pipe into identifier (function call)
(binary_operator
  operator: "|>"
  right: (identifier) @entity.name.function.elixir)

; * pipe into identifier (definition)
(call
  target: (identifier) @keyword.control.elixir
  (arguments
    (binary_operator
      operator: "|>"
      right: (identifier) @variable.other.elixir))
  (#any-of? @keyword.control.elixir "def" "defdelegate" "defguard" "defguardp" "defmacro" "defmacrop" "defn" "defnp" "defp"))

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
        (sigil
          quoted_start: _ @comment.line.doc.elixir
          quoted_end: _ @comment.line.doc.elixir) @comment.line.doc.elixir
        (boolean) @comment.line.doc.elixir
      ]))
  (#any-of? @comment.line.doc.__attribute__.elixir "moduledoc" "typedoc" "doc"))

; Module

(alias) @entity.name.namespace.elixir

(call
  target: (dot
    left: (atom) @entity.name.namespace.elixir))

; Reserved keywords

["when" "and" "or" "not" "in" "not in" "fn" "do" "end" "catch" "rescue" "after" "else"] @keyword.control.elixir
