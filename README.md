# Wordle Solver

Uses MongoDB Atlas Search to solve the daily Wordle.

Iterativey builds regular expressions that are then passed to Atlas Search with a `$search` aggregation stage.