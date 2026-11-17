; Bash sigils have no Elixir interpolations. Match their body once so an
; interpolating sigil does not invoke the name predicate for every fragment.
; Preserve quoted fragments when the parser recovers around an edit.
((sigil
  (sigil_name) @_sigil_name
  . [(escape_sequence) (comment) (ERROR)]*
  . (quoted_content) @injection.content
  . [(escape_sequence)
     (comment)
     (ERROR)
     (quoted_content) @injection.content]*
  . (sigil_modifiers)?
  .) @injection.owner
  (#eq? @_sigil_name "BASH")
  (#set! injection.language "bash")
  (#set! injection.newlines-between)
  (#set! injection.content-edit-policy "content-words"))

((comment) @injection.owner @injection.content
  (#set! injection.language "hyperlink")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))
((comment) @injection.owner @injection.content
  (#set! injection.language "todo")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))
