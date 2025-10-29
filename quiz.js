import { questions } from './questions.js';

// Welcome message
alert("Welcome to Emotitunes! \nThis website will ask you a series of questions about your music preferences and emotions. \n\nYou'll need to answer at least 10 questions, and then you can choose to continue or finish. \n\nYour responses will help us understand your preferences better. \n\nEnjoy your musical journey with EmotiTunes!");

// Initialize variables
let currentQuestionIndex = 0;
let questionResponses = [];
let currentQuestion = null;

// Function to display a question
function displayQuestion() {
    currentQuestion = questions[currentQuestionIndex];
    document.getElementById('questionText').textContent = currentQuestion.Question;
    
    // Update the counter
    document.getElementById('currentQuestion').textContent = questionResponses.length + 1;
    
    // Clear and populate choices
    const choicesContainer = document.getElementById('choicesContainer');
    choicesContainer.innerHTML = '';
    
    currentQuestion.Choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'emotion-button';
        button.textContent = choice;
        button.addEventListener('click', () => handleResponse(choice));
        choicesContainer.appendChild(button);
    });
}

// Function to handle user response
function handleResponse(choice) {
    const response = new QuizResponse(currentQuestion, choice);
    questionResponses.push(response);

    // Check if we've reached 10 questions
    if (questionResponses.length === 10) {
        document.getElementById('continuePrompt').style.display = 'block';
    } else {
        moveToNextQuestion();
    }
}

// Function to move to next question
function moveToNextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    displayQuestion();
}

// Function to continue after 10 questions
function continueQuestions() {
    document.getElementById('continuePrompt').style.display = 'none';
    moveToNextQuestion();
}

// Function to finish the questionnaire
function finishQuestions() {
    // Store final results
    console.log('Final responses:', questionResponses);
    alert('Thank you for completing the questionnaire! Your responses have been recorded.');
    // Here you could add code to send the results to a server or process them further
}

// Display the first question when the page loads
displayQuestion();