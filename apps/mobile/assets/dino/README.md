# Dino artwork

`dino.png` here is a **placeholder**, not the mascot.

The approved artwork lives in the Claude Design project
"Online Dershanem Oyun v2" at `assets/dino.png`. It could not be pulled through
the design MCP: `DesignSync.get_file` caps a response at 256 KiB and the
artwork is larger, so every fetch arrives truncated and will not decode.

To finish the mascot, drop the real file in as `dino.png` at this path. Nothing
else has to change — `src/shared/ui/dino/dino.tsx` is the only module that
loads it, every screen sizes it by a single `size` prop, and the compositions
already reserve the right geometry.
