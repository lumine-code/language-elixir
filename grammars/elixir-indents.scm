; An unfinished DO block may drop the heredoc/sigil owner but keep its content.
((quoted_content) @preserve
  (#is? test.childOfType ERROR)
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

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

; A sigil's paired delimiters quote text rather than opening a code container.
; Ignore both ends so a complete sigil cannot cancel an enclosing list's hint.
(sigil ["(" ")" "[" "]" "{" "}"] @_IGNORE_
  (#set! capture.final true))
; A surrounding incomplete DO block can drop the sigil wrapper as well.
(ERROR "~" . (sigil_name) . ["(" "[" "{"] @_IGNORE_
  (#set! capture.final true))

["(" "[" "{"] @indent
[")" "]" "}"] @dedent

; Only block DO opens a body; the inline `do:` keyword does not.
(do_block "do" @indent "end" @dedent)
(after_block "after" @dedent @indent)
(catch_block "catch" @dedent @indent)
(else_block "else" @dedent @indent)
(rescue_block "rescue" @dedent @indent)
