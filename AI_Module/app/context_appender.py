import json


def appendPreviousArtificats(artifact_type: str, previous_artifacts, fullPrompt: str):
    if not previous_artifacts:
        return fullPrompt

    prevDumps = json.dumps(previous_artifacts)
    appendex = f"""
### PREVIOUS ARTIFACT CONTEXT (THE SOURCE OF TRUTH) ###
The following JSON represents the ONLY valid tasks and IDs for this project. 
{prevDumps}

### SYNCHRONIZATION RULES ###
1. MANDATORY ID & NAME PERSISTENCE: 
   - You MUST reuse the "id" and "name" for every item found in the context. 
   - DO NOT rename "Backend Development" to "Server Side Logic". 
   - DO NOT change ID "T1" to "1.1".

2. STRUCTURAL INTEGRATION: 
   - If generating a WBS: Use the existing tasks as the leaf nodes. You may create "Parent" nodes to group them, but the original tasks must remain intact with their original IDs.
   - If generating a Gantt: Every task from a previously generated WBS or User Story list MUST appear on the timeline. 
   - If generating User Stories: Create exactly one User Story for every atomic task ID provided.

3. HIERARCHICAL ID NAMING (FOR NEW ITEMS): 
   - If you must create a sub-task for an existing ID (e.g., T3), the new ID must be a child of the original (e.g., T3.1, T3.2).

4. ATTRIBUTE PRESERVATION & PASS-THROUGH: 
   - You must include ALL fields from the previous context in your output, even if they aren't required for the {artifact_type} (e.g., keep 'start_date' in the WBS output). This is a "merge" operation, not a "replace" operation.

5. GAP FILLING: Only generate entirely new top-level IDs if the project scope is objectively incomplete without them."""

    return fullPrompt + "\n\n" + appendex

