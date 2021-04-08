var getSubtitles = require('youtube-captions-scraper').getSubtitles;
const fs = require('fs')

fs.readFile('./youtube_vids.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.error("File read failed:", err);
        return
    } else {
        try {
            const VIDEOS = JSON.parse(jsonString);
            for (const video of VIDEOS) {
                if (!video.id) throw new Error("no id found.");

                getSubtitles({
                    videoID: video.id, // youtube video id
                    lang: 'en' // default: `en`
                  }).then(captions => {
                        var captionStrings = captions.map((cap) => {return cap.text});
                        var captionString = captionStrings.join(" ");

                        const jsonCAPTION = JSON.stringify(captions, null, '\t');
                        fs.writeFile(`./TRANSCRIPTS/JSON/${video.name}.json`, jsonCAPTION, err => {
                            if (err) {
                                console.log('Error writing file', err)
                            } else {
                                console.log('Successfully wrote file')
                            }
                        })
                        fs.writeFile(`./TRANSCRIPTS/TEXT/${video.name}.txt`, captionString, err => {
                            if (err) {
                                console.log('Error writing file', err)
                            } else {
                                console.log('Successfully wrote file')
                            }
                        })
                  }).catch(err => console.log(err + " " + video.name));
            }
            
        } catch(err) {
            console.log('Error parsing JSON string:', err)
        }        
    }
});