//const youtube = require('@googleapis/youtube');
const fs = require('fs').promises;
const {google} = require('googleapis');
const youtube = google.youtube('v3');

// from the youtube video list, ./TRANSCRIPTS/youtube_vids.json return a array of ids
async function getIds(mainDirName) {
    const data = await fs.readFile(`../${mainDirName}/youtube_vids.json`, 'utf8');
    try {
        const VIDEOS = JSON.parse(data);
        var ids = VIDEOS.map((vid) => {
            return vid['id']
        });

        return ids;
    } catch(err) {
        console.error('Error parsing JSON string:', err)
    } 
}

// from a json file with the dislikes and likes ./TRANSCRIPTS/dis_likes.json,
// process to get the vital information and output to ./TRANSCRIPTS/DISLIKES_LIST.json
async function processDisLikes(mainDirName) {
    const data = await fs.readFile(`dis_likes_raw.json`, 'utf8');
    try {
        const VIDEOS = JSON.parse(data);
        var result = {};
        
        for (const vid of VIDEOS.items) {
            result[vid.id] = {
                    likes: vid.statistics.likeCount ? parseInt(vid.statistics.likeCount): null,
                    dislikes: vid.statistics.dislikeCount ? parseInt(vid.statistics.dislikeCount): null
                }
        }

        const YOUTUBERS_FILE = await fs.readFile(`../${mainDirName}/youtube_vids.json`, 'utf8')
        const YOUTUBERS = JSON.parse(YOUTUBERS_FILE);
        var ratio_list = [];

        var missing = "";
        for (const youtuber of YOUTUBERS) {
            var likes = result[youtuber['id']]['likes']
            var dislikes = result[youtuber['id']]['dislikes']
            console.log(`Likes: ${likes}`, `Dislikes: ${dislikes}`)
            if (likes && dislikes) {
                var ratio = likes/dislikes
                var obj = {
                        'id': youtuber['id'],
                        'name': youtuber['name'],
                        'like': likes,
                        'dislikes': dislikes,
                        'ratio': ratio
                }
                ratio_list.push(obj)
            } else {
                missing += `name: ${youtuber['name']}, ${youtuber['link']}\n`
            }
        }
        console.log(ratio_list);
        console.log(ratio_list.length);

        const jsonDIS_LIKES = JSON.stringify(ratio_list, null, '\t');
        fs.writeFile(`../${mainDirName}/ratio_list.json`, jsonDIS_LIKES, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        });

        fs.writeFile(`../${mainDirName}/missing_ratio.txt`, missing, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })

        return result;
    } catch(err) {
        console.error('Error parsing JSON string:', err)
    } 
}

async function getMissingCaptionPeople(mainDirName) {
    try {
        var files = await fs.readdir(`../${mainDirName}/TEXT`);
        files = files.map((file) => {
            return file.slice(0, -4)
        })
        const data = await fs.readFile(`../${mainDirName}/youtube_vids.json`, 'utf8');

        const VIDEOS = JSON.parse(data);

        const missingPeople = VIDEOS.filter((video) => {
            return !files.includes(video['name'])
        })
        var missing = "";
        for (const person of missingPeople) {
            missing += `name: ${person['name']}, ${person['link']}\n`
        }
        fs.writeFile(`../${mainDirName}/missing_captions.txt`, missing, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })

    } catch(err) {
        console.error('Error parsing JSON string:', err)
    } 
    
}

// connect to youtube API and get the statistics from all of the videos given in 
// an array of video ids
// Writes to ./TRANSCRIPTS/dis_likes.json, but also returns the data.
async function getStatistics(IDS) {
    const secret_file = process.env.SECRET_FILE? process.env.SECRET_FILE : "secret_account.json";

    const auth = new google.auth.GoogleAuth({
        keyFilename: secret_file, // gcloud service account
        scopes: 'https://www.googleapis.com/auth/youtube.readonly'
      });
      const authClient = await auth.getClient();
      google.options({auth: authClient});
      
      const stringed = IDS.join(",");
      const createResponse = await youtube.videos.list({
            part: 'statistics',
            id: stringed
          }
      );
          
      const jsonDIS_LIKES = JSON.stringify(createResponse.data, null, '\t');
      fs.writeFile(`dis_likes_raw.json`, jsonDIS_LIKES, err => {
          if (err) {
              console.log('Error writing file', err)
          } else {
              console.log('Successfully wrote file')
          }
      });

      return createResponse.data;
}

async function getList(mainDirName) {
    try {
        const data = await fs.readFile(`../TRANSCRIPTS/youtube_vids.json`, 'utf8');
        const VIDEOS = JSON.parse(data);

        var links = "";

        for (const video of VIDEOS) {
            const {link, other, transcript} = video;
            links += `${link}\n`
            if (other) links += `${other}\n`
            if (transcript) links += `${transcript}\n`
        }
        fs.writeFile(`../${mainDirName}/list_youtuber.txt`, links, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        })
    } catch(err) {
        console.error('Error parsing JSON string:', err)
    } 
}

module.exports = {
    getIds, processDisLikes, getStatistics, getMissingCaptionPeople, getList
}