var getSubtitles = require('youtube-captions-scraper').getSubtitles;
const fs = require('fs')

// requires a file with a list of youtube videos
// write to JSON folder for json raw data from endpoint
// write to TEXT folder with .txt file with video caption. 
// return 0 if completed succesfully. 
async function getCaptions(youtubers, mainDirName) {    
    try {
        if (!fs.existsSync(`../${mainDirName}`)){
            fs.mkdirSync(mainDirName);
        }
        if (!fs.existsSync(`../${mainDirName}/JSON`)){
            fs.mkdirSync(`../${mainDirName}/JSON`);
        }
        if (!fs.existsSync(`../${mainDirName}/TEXT`)){
            fs.mkdirSync(`../${mainDirName}/TEXT`);
        }

        for (const video of youtubers) {
            if (!video.id) {
                console.error("no id found.");
                continue;
            }
            
            getSubtitles({
                videoID: video.id, // youtube video id
                lang: 'en' // default: `en`
              }).then(captions => {
                    var captionStrings = captions.map((cap) => {return cap.text});
                    var captionString = captionStrings.join(" ");
                    const jsonCAPTION = JSON.stringify(captions, null, '\t');

                    fs.writeFile(`../${mainDirName}/JSON/${video.name}.json`, jsonCAPTION, err => {
                        if (err) {
                            console.error(`Error writing file ${video.name}.json`, err)
                        } else {
                            console.log(`Successfully wrote ${video.name}.json file`)
                        }
                    })
                    fs.writeFile(`../${mainDirName}/TEXT/${video.name}.txt`, captionString, err => {
                        if (err) {
                            console.error(`Error writing file ${video.name}.txt`, err)
                        } else {
                            console.log(`Successfully wrote ${video.name}.txt file`)
                        }
                    })
              }).catch(() => console.error(`Could not find captions for video: ${video.name}`));
        }
        return 0;
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = {
    getCaptions
};
