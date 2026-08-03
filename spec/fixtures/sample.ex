# Assertions live in the comments: `<- scope` checks the marker's own column
# on the previous non-comment line, `^ scope` checks the caret's. Scopes
# match by prefix, so the trailing `.elixir` segment is left off.

defmodule Demo do
#         ^ entity.name

  def go(n), do: {:ok, n}
#       ^ punctuation.definition.arguments.begin.bracket.round
#                ^ punctuation.definition.tuple.begin.bracket.curly

end
# <- keyword

# a comment
# <- comment
