
export function QuizQuestion (question, choices){
    this.Question = question;
    this.Choices = choices;
}

export const questions = [
    new QuizQuestion("How are you feeling today?", 
        ["Happy", "Sad", "Angry", "Relaxed", "Excited", "Anxious"]
    ),
    new QuizQuestion("What genre of music do you prefer when you're happy?", 
        ["Pop", "Rock", "Classical", "Jazz", "Hip-Hop", "Country"]
    ),
    new QuizQuestion("What genre of music do you prefer when you're sad?", 
        ["Blues", "Classical", "Acoustic", "Indie", "R&B", "Folk"]
    ),
    new QuizQuestion("What genre of music do you prefer when you're angry?", 
        ["Rock", "Metal", "Punk", "Hip-Hop", "Electronic", "Hardcore"]
    ),
    new QuizQuestion("What genre of music do you prefer when you're relaxed?", 
        ["Classical", "Ambient", "Jazz", "Acoustic", "Chillout", "Soft Rock"]
    ),
    new QuizQuestion("What genre of music do you prefer when you're excited?", 
        ["Pop", "Dance", "Electronic", "Rock", "Hip-Hop", "Upbeat Indie"]
    ),
    new QuizQuestion("What genre of music do you prefer when you're anxious?", 
        ["Classical", "Ambient", "Acoustic", "Soft Rock", "Jazz", "Meditative"]
    ),
    new QuizQuestion("What genre of music do you prefer when you're feeling nostalgic?", 
        ["Classic Rock", "Oldies", "Folk", "Singer-Songwriter", "Blues", "Jazz"]
    ),
    new QuizQuestion("What tempo of music do you prefer?", 
        ["Slow", "Medium", "Fast", "Varied", "Depends on Mood"]
    ),
    new QuizQuestion("What genre do you prefer in general", 
        ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop", "Electronic"]
    ),
    new QuizQuestion("Do you want to be recommended new artists or familiar ones?", 
        ["New", "Familiar", "A Mix of Both"]
    ),
    new QuizQuestion("What cultural music influences do you enjoy?", 
        ["African", "Asian", "Latin", "Middle Eastern", "Western", "Indigenous"]
    ),
    new QuizQuestion("What musical eras do you prefer?", 
        ["Baroque", "Classical", "Romantic", "20th Century", "Contemporary"]
    ),
    new QuizQuestion("What instrumentation do you prefer?", 
        ["Strings", "Brass", "Woodwinds", "Percussion", "Electronic", "Vocals"]
    )
];  

export function QuizResponse (question, response){
    this.Question = question;
    this.Response = response;
}