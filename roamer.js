//
// ScratchX plugin for Valiant Technology Roamer
//
// Kevin Rands 2015
//

 
(function(ext) {

    //
    // Default base port that the companion application listens on
    //
    var port = 7666;
    
    var sequence = "";


    //
    // Url of the companion app - normally just locat host
    //
    var base = "http://localhost";

    //
    // Utility function for calculating the url for the companion app for
    // a given operation 'op' and argument 'a'. Generates urls of the
    // form http://localhost:8666/forward/10, meaning 'go forward 10'
    //
    // Argument is optional
    //
    var urlFor = function(op, a) {
        url = base + ":" + port + "/" + op;

        if(typeof a !== "undefined") {
            url += "/" + a;
        }

        return url;
    };

    //
    // Async function that talks to the companion application and
    // invokes the callback once a response is received. Control is
    // not blocked and returns immediately, even though the roamer
    // still working
    //
    var roamer = function(arg, callback) {
        console.log("Calling: " + arg)
        $.ajax({
            method: 'GET',
            url: arg,
            success: function(status) {
                callback(status);
            },
            error: function(xhr, status, err) {
                callback(xhr.statusText);
            }
        });
    }

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    var status = "ready";
    var fetching = false;

    //
    // Report the status of the roamer. Only report 'ready' if we
    // can connect to the companion application and receive a poll
    // response back
    //
    // This gets called a lot by scratch, so we return a cached value
    // while we're waiting for the companion app to response (and for it
    // to talk to the roamer)
    //
    ext._getStatus = function() {

        try {
            if(!fetching) {
                fetching = true;
                roamer(urlFor("poll"), function(async_status) {
                    status = async_status;
                    fetching = false;
                });
            }
        } catch(err) {
            status = err.message;
        }

        if(status == "ready") {
            result = {status: 2, msg: 'Roamer ready'};
        } else if(status == "not ready") {
            result = {status: 1, msg: 'Roamer not connected'};
        } else {
            result = {status: 0, msg: 'Missing Roamer helper'};
        }
        
        return result;
    };

    ext.forward = function(distance) {
        if (sequence)
        {
            sequence = sequence + "F" + distance;
        }
        else
        {
            sequence = "F" + distance;
        }
    };

    ext.backward = function(distance) {
        if (sequence)
        {
            sequence = sequence + "B" + distance;
        }
        else
        {
            sequence = "B" + distance;
        }
    };
    
    ext.left = function(angle, callback) {
        if (sequence)
        {
            sequence = sequence + "L" + angle;
        }
        else
        {
            sequence = "L" + angle;
        }
    };

    ext.right = function(angle) {
        if (sequence)
        {
            sequence = sequence + "R" + angle;
        }
        else
        {
            sequence = "R" + angle;
        }
    };
    
    ext.proc = function(number) {
        if (sequence)
        {
            sequence = sequence + "P" + number;
        }
        else
        {
            sequence = "P" + number;
        }
    };
    
    ext.repeat = function(repeats) {
       return roamer(urlFor("si_cmd", "A" + repeats), callback);
    };
    
    ext.wait = function(wait, callback) {
       return roamer(urlFor("si_cmd", "W" + wait), callback);
    };

    ext.music = function(duration, pitch, callback) {
       return roamer(urlFor("si_cmd", "N" + duration + " " + pitch), callback);
    };
    
    ext.setmusic = function(tempo, octave, callback) {
       return roamer(urlFor("si_cmd", "@" + tempo + " " + octave), callback);
    };


    ext.input = function(port, callback) {
       return roamer(urlFor("si_cmd", "I" + port), callback);
    };
    
    ext.speed = function(speed, callback) {
       return roamer(urlFor("si_cmd", "V" + speed), callback);
    };
    
    ext.output = function(state, callback) {
       return roamer(urlFor("si_cmd", "V" + state), callback);
    };
    
    ext.vol = function(volume, callback) {
       return roamer(urlFor("si_cmd", "Y" + volume), callback);
    };

    ext.scalemove = function(scale, callback) {
       return roamer(urlFor("si_cmd", "Z,F" + scale), callback);
    };

   ext.scaleturn = function(turn, callback) {
       return roamer(urlFor("si_cmd", "Z,R" + turn), callback);
    };

    

    ext.open = function() {
        if (sequence)
        {
            sequence = sequence + "[";
        }
        else
        {
            sequence = "[";
        }
    };
    
    ext.close = function() {
        if (sequence)
        {
            sequence = sequence + "]";
        }
        else
        {
            sequence = "]";
        }
    };

    
    ext.go = function(callback) {
       try
       {
           if (sequence)
           {
                sequence = sequence + "G";
           }
           else
           {
                sequence = "G";
           }
           alert(sequence);
           var result = roamer(urlFor("si_cmd", sequence), callback);
           sequence = "";
           return result;
       }
       catch (err)
       {
        alert(err.message);
       }
    };
    
    ext.send = function(callback) {
       try
       {
           if (sequence)
           {
                alert(sequence);
                var result =  roamer(urlFor("si_cmd", sequence), callback);
                sequence = "";
                return result;
           }
       }
       catch (err)
       {
        alert(err.message);
       }
    };

    
    ext.clear_memory = function(callback) {
       if (sequence)
       {
            sequence = sequence + "C";
       }
       else
       {
            sequence = "C";
       }
    };
    
    ext.procedure = function(number) {
    };



//    ext.port = function(p, callback) {
//       port = p
//    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
         [' ', 'Forward %n', 'forward'],
         [' ', 'Backward %n', 'backward'],
         [' ', 'Left %n', 'left'],
         [' ', 'Right %n', 'right'],
         ['w', 'Send','send'],
         ['w', 'GO', 'go'],
         [' ', 'CM CM', 'clear_memory'],
         [' ', 'Repeat %n', 'repeat'],
         [' ', 'P %n', 'proc'],
         [' ', '[', 'open'],
         [' ', ']', 'close'],
         [' ', 'Wait %n', 'wait'],
         [' ', 'Music %n %n', 'music'],
         [' ', 'Input %n', 'input'],
         [' ', 'Speed %n', 'speed'],
         [' ', 'Output %m:output', 'output', 'on'],
         [' ', 'Vol %n', 'vol'],
         [' ', 'Set Music %n %n', 'setmusic'],
         [' ', 'Scale Move %n', 'scalemove'],
         [' ', 'Scale Turn %n', 'scaleturn'],
        
         

         //
         // Not sure if we'll keep this, but it means we
         // set the companion application in scratch
         //
         //['', 'Roamer port %n', 'port', 7666],
        ],
        
            menus: {
            output: ['on','off'],
        },

    };
    

    ScratchExtensions.register('Roamer', descriptor, ext);
})({});