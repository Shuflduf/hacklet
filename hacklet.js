javascript: (async function () {
  const inQuestionText = document.querySelector(
    '[class*="question-title__Title-"]'
  );
  const inPreQuestionText = document.querySelector(
    '[class*="block-title__Title-"]'
  );
  let text = inQuestionText
    ? inQuestionText.textContent
    : inPreQuestionText
      ? inPreQuestionText.textContent
      : null;

  let answers = [];
  document.querySelectorAll(
    '[data-functional-selector*="question-choice-text-"]',
  ).forEach((item) => {
    answers.push(item.children[0].textContent);
  });

  if (answers.length !== 0) {
    const answer = answers.join("\n");
    text += "\n"
    text += "ANSWERS:\n"
    text += answer;
  }

  const GEMINI_API_KEY = localStorage.getItem("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    localStorage.setItem(
      "GEMINI_API_KEY",
      prompt(
        "Enter your Gemini API key. You can get an API key from https://aistudio.google.com/apikey: ",
      ),
    );
    return;
  }
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    GEMINI_API_KEY;
  const geminiRequest = fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: "You are a Kahoot AI. You will be given the text of a question and you will have to answer it correctly. Keep your answer short and concise. Do not add any extra information.",
          },
        ],
      },
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 100,
      },
      contents: [
        {
          parts: [
            {
              text: text,
            },
          ],
        },
      ],
    }),
  });
  const result = await geminiRequest;
  const json = await result.json();
  console.log(json);
  const answer = json.candidates[0].content.parts[0].text;
  alert(answer);
})();
