
export function QuizQuestion (question, choices){
    this.Question = question;
    this.Choices = choices;
}

export const questions = [
    new QuizQuestion("How are you feeling today?", 
        ["Happy", "Sad", "Angry", "Relaxed", "Excited", "Anxious", "Nostalgic"]
    ),
    new QuizQuestion("Do you want your playlist to match your current mood or change it?", 
        ["Match My Mood", "Change My Mood", "Surprise Me"]
    ),
    new QuizQuestion("What kind of energy do you want your playlist to have?", 
        ["Chill", "Balanced", "Upbeat", "High-Energy", "Varied"]
    ),
    new QuizQuestion("Which genres best fit your music taste?", 
        ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop", "Electronic", "Folk", "R&B", "Indie"]
    ),
    new QuizQuestion("Where will you be listening?", 
        ["At Home", "Studying", "Commuting", "Exercising", "Working", "Socializing"]
    ),
    new QuizQuestion("What kind of music do you want more of?", 
        ["New Artists", "Familiar Favorites", "A Mix of Both"]
    ),
    new QuizQuestion("Do you prefer music with lyrics or mostly instrumental?", 
        ["Lyrics", "Instrumental", "No Preference"]
    ),
    new QuizQuestion("How important are lyrics to your mood?", 
        ["Very Important", "Somewhat Important", "Not Important"]
    ),
    new QuizQuestion("Would you like to include ambient sounds (like rain or waves)?", 
        ["Yes, please", "No, just music"]
    ),
    new QuizQuestion("Do you enjoy music influenced by specific cultures?", 
        ["Latin", "African", "Asian", "Western", "Middle Eastern", "No Preference"]
    )
];

export function QuizResponse (question, response){
    this.Question = question;
    this.Response = response;
}