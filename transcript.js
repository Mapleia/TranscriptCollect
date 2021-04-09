var getSubtitles = require('youtube-captions-scraper').getSubtitles;
const fs = require('fs')

// requires a file with a list of youtube videos ./TRANSCRIPTS/youtube_vids.json
// write to JSON folder for json raw data from endpoint
// write to TEXT folder with .txt file with video caption. 
// return 0 if completed succesfully. 
function getCaptions(mainDirName) {
    if (!fs.existsSync(`${mainDirName}`)){
        fs.mkdirSync(mainDirName);
    }
    try {
        if (fs.existsSync(`./${mainDirName}/youtube_vids.json`)) {
          console.log("Main youtube_vids.json file exist. Continue...");
        } 
    } catch(err) {
        throw new Error(err);
    }

    fs.readFile(`./${mainDirName}/youtube_vids.json`, 'utf8', (err, jsonString) => {
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
                            if (!fs.existsSync(`${mainDirName}/JSON`)){
                                fs.mkdirSync("JSON");
                            }

                            if (!fs.existsSync(`${mainDirName}/TEXT`)){
                                fs.mkdirSync("TEXT");
                            }

                            fs.writeFile(`./${mainDirName}/JSON/${video.name}.json`, jsonCAPTION, err => {
                                if (err) {
                                    console.log('Error writing file', err)
                                } else {
                                    console.log('Successfully wrote file')
                                }
                            })
                            fs.writeFile(`./${mainDirName}/TEXT/${video.name}.txt`, captionString, err => {
                                if (err) {
                                    console.log('Error writing file', err)
                                } else {
                                    console.log('Successfully wrote file')
                                }
                            })
                      }).catch(err => console.log(err + " " + video.name));
                }
                return 0;
                
            } catch(err) {
                console.log('Error parsing JSON string:', err)
            }        
        }
    });
}

export {getCaptions}
