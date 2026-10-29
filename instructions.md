Jeopardy Board Generator; Claude Code Project Instructions
Purpose
These instructions tell Claude how to convert any study material into a Jeopardy-style board formatted in Markdown.
Input
The user will provide source material. It could be a document, a webpage paste, notes, or a topic name. The source should contain enough information to generate 25 distinct questions across 5 categories.
Output Format
The output is a single Markdown document using this exact repeatable structure.
# [Topic] Jeopardy
 
## Categories
1. **[Category 1]**
2. **[Category 2]**
3. **[Category 3]**
4. **[Category 4]**
5. **[Category 5]**
 
---
 
### [Category 1]
 
**$100**
Q: [Easiest question]
A: [Answer phrased as a question, e.g. "What is...?" or "Who is...?"]
 
**$200**
Q: [Slightly harder]
A: [Answer as question]
 
**$300**
Q: [Medium difficulty]
A: [Answer as question]
 
**$400**
Q: [Hard]
A: [Answer as question]
 
**$500**
Q: [Hardest; requires synthesis, obscure detail, or multi-step reasoning]
A: [Answer as question]
 
---
 
(Repeat for each category)
Rules for Category Selection
 
Categories must span the full breadth of the source material. Do not cluster around one subtopic.
If the material covers history, structure, key figures, technical details, and consequences, those are natural category boundaries. Adapt as needed per subject.
Category names should be short (2-4 words) and descriptive.
 
Rules for Question Design
 
$100 questions should be surface-level recall. A student skimming the material once would get these right.
$200-$300 questions require understanding relationships, timelines, or definitions beyond the most obvious facts.
$400-$500 questions should require deeper knowledge. These can involve connecting multiple facts, identifying lesser-known details, or applying a concept to a specific scenario.
Every answer must be phrased as a question ("What is...?", "Who is...?", "What are...?").
Questions should be self-contained. A player should not need to see the source material to understand what is being asked.
Avoid repeating the same fact across multiple questions.
Avoid trick questions. Difficulty should come from depth of knowledge, not from misleading phrasing.
 
Rules for Formatting
 
Use the exact Markdown structure shown above. No deviations.
Separate each category section with a horizontal rule (---).
Bold the dollar values.
Use Q: and A: prefixes for every question and answer.
Do not use em dashes. Use semicolons, commas, or rewrite the sentence if a structural break is needed.
Do not use bullet points or numbered lists inside questions or answers.
Keep questions to one or two sentences. Keep answers to one sentence.
 
Rules for Math Notation
 
Write all math in LaTeX wrapped in single dollar signs, inline with the text. Example: Q: What is $\frac{1}{2} + \frac{1}{3}$? A: What is $\frac{5}{6}$?
Use LaTeX for fractions ($\frac{a}{b}$), exponents ($x^2$, $e^{-x}$), roots ($\sqrt{x}$, $\sqrt[3]{x}$), Greek letters ($\pi$, $\theta$), and symbols ($\times$, $\div$, $\le$, $\ge$, $\ne$, $\infty$, $\pm$, $^\circ$).
Never write fractions as plain text like 3/4. Never use Unicode math symbols like ½, ², or √; use the LaTeX form instead.
Put an entire expression in one pair of dollar signs ($2x + 3 = 7$), not each piece separately.
For a larger standalone expression (an integral, a big fraction, a matrix), use double dollar signs: $$\int_0^1 x^2\,dx$$
No space directly after an opening $ or directly before a closing $.
For a literal dollar amount, write \$ (example: \$5). Never put a dollar amount inside math.
Each Q: and A: must stay on a single line; do not break LaTeX across lines.
The 100 character limit applies to the text as displayed, not the LaTeX source.
 
Process
 
Read the full source material.
Identify 5 categories that cover the material broadly.
For each category, write 5 questions at escalating difficulty ($100 through $500).
Review for duplicate facts, ambiguous phrasing, and formatting compliance.
Output in a code block. Keep the questions and answers to around 100 characters in length, maximum.
