import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue, update, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";


//here
const firebaseConfig = {
    apiKey: "AIzaSyAQsx_3ptE2V0t6pEwMTygkQpV-1JZ4p9I",
    authDomain: "btom-pilot.firebaseapp.com",
    databaseURL: "https://btom-pilot-default-rtdb.firebaseio.com",
    projectId: "btom-pilot",
    storageBucket: "btom-pilot.appspot.com",
    messagingSenderId: "651654941306",
    appId: "1:651654941306:web:f5c2b902577200a46bc9c3",
    measurementId: "G-K4GBQ369W3"
};



const myapp = initializeApp(firebaseConfig);
const db = getDatabase();
const chooseParticipantNum = ref(db, "priors/completedParticipants"); //here
const runBTN = $("run");
var completionArray;
var trials;
var participantNumRef;

function $(id){
    return document.getElementById(id)
}









let requestCompletion = function(){
    //find open participant number
    onValue(chooseParticipantNum, (snapshot) => {
        completionArray = snapshot.val()
        console.log(completionArray)
    });
    checkDefined()
};

let checkDefined = function(){
    if (typeof completionArray !== "undefined"){
        selectParticipantNumber() 
    } else {
        setTimeout(checkDefined, 2000)
    }
};

let selectParticipantNumber = function(){
    var parNum = "p01"
    var counter = 1
    while(completionArray[parNum] == true){
        ++counter
        if(counter < 10){
            parNum = "p0"+counter
        } else {
            parNum = "p"+counter
        }
    };
    update(chooseParticipantNum, {
        [parNum]: true //here
    });

    let openSlot = "priors/participants/participant" + parNum.slice(1);
    //find trials for participant
    participantNumRef = ref(db, openSlot); //here
    onValue(participantNumRef, (snapshot) => {
        trials = snapshot.val()
        console.log("parNumRef: ", participantNumRef)
        console.log("Trials Snapshot val():", trials)
    });
    checkDefinedTrials()
};

let checkDefinedTrials = function(){
    if (typeof trials == "undefined"){
        setTimeout(checkDefinedTrials, 1000) 
    } else {
        runSurvey()
    }
};




var trials = {'trial01':{
    'stim1':'excitement'
},
'trial02':{
    'stim1':'misery'
},
'trial03':{
    'stim1':'alarm'
}
}

let runSurvey = function(){        
    //preallocate results
    let results = [];
    for (var i = 0; i < 3; i++){
        var trialNum;
        if (i<9){
            trialNum = "trial0"+(i+1)
        } else {
            trialNum = "trial"+(i+1)
        }
        results.push({"stim1":trials[trialNum]["stim1"], "rating":null, "rt":null});
    }    //results array is redundant now^

    let d = new Date();
    let start = d.getTime(); //Server time???
    let curq = 1;
    let question = $("question");
    question.innerHTML = ('<p>How likely is a person to be experiencing the mental state:<br> <b>' + results[curq-1]["stim1"] + '</b>?</p>')
    let submit = $("submit");
    let linescale = $("transcale"); 
    let runningCounter = $("textInput");
    let prog = 0;
    let progBar = $("progress-bar")
    let qn = results.length;
    let rt;
    let rating;
    // detect movement of slider and enable submit button
    let moved = false;
    submit.className = "btnDisabled"

    linescale.addEventListener("input", function(e){ 
        moved = true;
        if (submit.className === "btnDisabled"){
            submit.className = "btn";
        }
    });

    submit.addEventListener("click", function(e){
        if (moved){
            moved = false;
            submit.className = "btnDisabled";
            d = new Date();
            rt = d.getTime() - start;
            rating = linescale.value;
            linescale.value = 50;
            runningCounter.innerHTML = "<b>50</b>";
            results[curq-1]["rating"] = rating;
            results[curq-1]["rt"] = rt;
            if(curq == qn){                     //if its over 
                console.log("all done!");
                set(participantNumRef, results);
                window.location.href = "debrief.html";
            } else {                    
                prog = Math.round(100*(curq+1)/qn);
                progBar.style.width = prog + "%";
                progBar.innerText = (curq+1) + "/" + qn;
                question.innerHTML = ('<p>How likely is a person to be experiencing the mental state:<br> <b>' + results[curq]["stim1"] + '</b>?</p>');
                d = new Date();
                start = d.getTime();
                curq = ++curq;
            }
        }
    });


};

//requestCompletion()
runSurvey()