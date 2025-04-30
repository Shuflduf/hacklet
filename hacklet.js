javascript: (async function () {
  const inQuestionText = document.querySelector(
    '[class*="question-title__Title-"]',
  );
  const inPreQuestionText = document.querySelector(
    '[class*="block-title__Title-"]',
  );
  let inQuestion = inQuestionText !== null;
  let text = inQuestion
    ? inQuestionText.textContent
    : inPreQuestionText.textContent;

  let answers = [];
  let answerHtml = document
    .querySelectorAll('[data-functional-selector*="question-choice-text-"]');
  for (let i = 0; i < answerHtml.length; i++) {
    const element = answerHtml[i];
    const answerText = element.textContent;
    answers.push({index: i, text: answerText});
  }

  if (answers.length !== 0) {
    text += "\n";
    text += "ANSWERS:\n";
    answers.forEach(element => {
      text += element.index + ": " + element.text + "\n";
    });
  }

  const GEMINI_API_KEY = localStorage.getItem("GEMINI_API_KEY");
  let generationConfig = {
    temperature: 0.0,
    maxOutputTokens: 100,
  };
  if (inQuestion) {
    generationConfig["response_mime_type"] = "application/json";
    generationConfig["response_schema"] = {
      type: "integer",
      format: "int32",
    }
  }
  let systemInstruction = "You are a Kahoot AI. You will be given the text of a question and you will have to answer it correctly. Keep your answer short and concise. Do not add any extra information. "
  if (inQuestion) {
    systemInstruction += "You will also be given the answers to the question. You have to choose the correct answer from the answers given and answer with the number representing the answer. If none of the answers are correct, answer with -1. "
  }

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
            text: systemInstruction,
          },
        ],
      },
      generationConfig: generationConfig,
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

  if (inQuestion) {
    let index = parseInt(answer);
    console.log("Answer: " + index);
    if (index === -1) {
      alert("No correct answer found.");
      return;
    }

    const targetButton = document.querySelector(
      '[data-functional-selector="answer-' + answer + '"]'
    );
    if (targetButton) {
      targetButton.setAttribute("style", 
        targetButton.getAttribute("style") + "border: 5px solid white; "
      );
    } else {
      alert("Answer not found in the options.");
    }
  } else {
    alert(answer);
  }
})();
