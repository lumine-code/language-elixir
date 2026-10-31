; Reindent changes code structure, never the contents of multiline literals
; or the alignment a user chose inside a block comment.
([(string) (charlist) (sigil) (quoted_atom) (comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

; Only explicit delimiters change the inherited indentation. Layout,
; operators and unfinished expressions deliberately keep the current level.
; Interpolation has a distinct opener and must not close an outer container.
(interpolation "}" @_IGNORE_ (#set! capture.final true))

["(" "[" "{"] @indent
[")" "]" "}"] @dedent

; Only block DO opens a body; the inline `do:` keyword does not.
(do_block "do" @indent "end" @dedent)
(after_block "after" @dedent @indent)
(catch_block "catch" @dedent @indent)
(else_block "else" @dedent @indent)
(rescue_block "rescue" @dedent @indent)
