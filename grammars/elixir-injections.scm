((sigil
  (sigil_name) @_sigil_name
  (quoted_content) @injection.content) @injection.owner
  (#eq? @_sigil_name "BASH")
  (#set! injection.language "bash")
  (#set! injection.newlines-between))

((comment) @injection.owner @injection.content
  (#set! injection.language "hyperlink")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))
((comment) @injection.owner @injection.content
  (#set! injection.language "todo")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))
