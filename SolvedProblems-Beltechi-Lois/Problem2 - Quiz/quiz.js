// Will take up to ~10 seconds for generating the questions set
class Question {
    constructor(questionId, text, choices, correctAnswer) {
        this.questionId = questionId;
        this.text = text;
        this.choices = choices;
        this.correctAnswer = correctAnswer;
    }
}

let Questions = [];
const ques = document.getElementById("ques")
const answeredQuestions = [];
let totalQuestions = 0;  // Global variable to track the total number of questions

async function fetchQuestions(url) {
    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Something went wrong!! Unable to fetch the data\n${errorText}`);
    }

    const data = await response.json();
    // Assign a unique questionId to each question
    const questions = data.results.map((question, index) => {
        totalQuestions++;
        return new Question(totalQuestions, question.question, [...question.incorrect_answers, question.correct_answer], question.correct_answer);
    });
    return questions;
}

//Generate random questions on different categories using a public trivia API
async function fetchQuestionsFromAllCategories() {
    // This API has been used for generating pool questions https://opentdb.com/api_config.php
    const url1 = 'https://opentdb.com/api.php?amount=16&category=17&type=multiple'; // Science (16)
    const url2 = 'https://opentdb.com/api.php?amount=17&category=23&type=multiple'; // History (17)
    const url3 = 'https://opentdb.com/api.php?amount=17&category=19&type=multiple'; // Math    (17) 
                                                                                    // TOTAL:  (50)

    try {
        const questions1 = await fetchQuestions(url1);
        await new Promise(resolve => setTimeout(resolve, 5000));

        const questions2 = await fetchQuestions(url2);
        await new Promise(resolve => setTimeout(resolve, 5000));

        const questions3 = await fetchQuestions(url3);

        const allQuestions = [...questions1, ...questions2, ...questions3];
        return allQuestions;
    } catch (error) {
        console.error(error);
    }
}

fetchQuestionsFromAllCategories().then(questions => {
    Questions = questions;  // Populate the Questions array
    console.log(Questions);  // All Questions displayed

    if (Questions.length === 0) {
        ques.innerHTML = `<h5>Please Wait!! Loading Questions...</h5>`;
    } else {
        setTimeout(() => {
            loadQues();
            if (Questions.length === 0) {
                ques.innerHTML = `<h5 style='color: red'>Unable to fetch data, Please try again!!</h5>`;
            }
        }, 2000);
    }
});

let currQuestion = 0
let score = 0

if (Questions.length === 0) {
    ques.innerHTML = `<h5>Please Wait!! Loading Questions...</h5>`
}

function loadQues() {
    const opt = document.getElementById("opt");

    // Keep generating a random question until an unanswered one is found;
    let randomQuestionIndex;
    do {
        randomQuestionIndex = Math.floor(Math.random() * Questions.length);
    } while (answeredQuestions[randomQuestionIndex]);

    const currentQuestion = Questions[randomQuestionIndex];

    // Mark the question as answered
    answeredQuestions[randomQuestionIndex] = true;  // Mark as true in order to not have repeating questions

    const questionNumber = currQuestion + 1;

    ques.innerHTML = `<p>${questionNumber}. ${currentQuestion.text}</p>`;

    opt.innerHTML = "";
    const options = [...currentQuestion.choices];
    options.sort(() => Math.random() - 0.5);
    options.forEach((option) => {
        const choicesdiv = document.createElement("div");
        const choice = document.createElement("input");
        const choiceLabel = document.createElement("label");
        choice.type = "radio";
        choice.name = "answer";
        choice.value = option;
        choiceLabel.textContent = option;
        choicesdiv.appendChild(choice);
        choicesdiv.appendChild(choiceLabel);
        opt.appendChild(choicesdiv);
    });
}

setTimeout(() => {
    loadQues();
    if (Questions.length === 0) {
        ques.innerHTML = `<h5 style='color: red'>Unable to fetch data, Please try again!!</h5>`
    }
}, 2000)

function loadScore() {
    const totalScore = document.getElementById("score");
    totalScore.textContent = `You scored ${score} out of ${Questions.length}`;
    totalScore.innerHTML += "<h3>Correct Answers</h3>"
    Questions.forEach((el, index) => {
        totalScore.innerHTML += `<p>${index + 1}. ${el.correct_answer}</p>`
    })
}

function nextQuestion() {
    if (currQuestion < Questions.length - 1) {
        currQuestion++;
        loadQues();
    } else {
        document.getElementById("opt").remove()
        document.getElementById("ques").remove()
        document.getElementById("btn").remove()
        loadScore();
    }
}

//Keep the score
function checkAns() {
    const selectedAns = document.querySelector('input[name="answer"]:checked').value;

    if (selectedAns === Questions[currQuestion].correct_answer) {
        score++;
        nextQuestion();
    } else {
        nextQuestion();
    }
}
