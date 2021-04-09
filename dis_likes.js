//const youtube = require('@googleapis/youtube');
const fs = require('fs').promises;
const {google} = require('googleapis');
const youtube = google.youtube('v3');

// from the youtube video list, ./TRANSCRIPTS/youtube_vids.json return a array of ids
async function getIds(mainDirName) {
    const data = await fs.readFile(`./${mainDirName}/youtube_vids.json`, 'utf8');
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
    const data = await fs.readFile(`./${mainDirName}/dis_likes.json`, 'utf8');
    try {
        const VIDEOS = JSON.parse(data);
        var result = {};

        const arr = VIDEOS.items.map((vid) => {
            return {
                id: vid.id,
                likes: vid.statistics.likeCount ? vid.statistics.likeCount: null,
                dislikes: vid.statistics.dislikeCount ? vid.statistics.dislikeCount: null
            }
        });

        for (const vid of arr) {
            let likes = vid.likes ? parseInt(vid.likes) : vid.likes;
            let dislikes = vid.dislikes ? parseInt(vid.dislikes) : vid.dislikes;
            
            result[vid.id] = {likes: likes, dislikes: dislikes};
        }

        const jsonDIS_LIKES = JSON.stringify(result, null, '\t');
        fs.writeFile(`./${mainDirName}/DISLIKES_LIST.json`, jsonDIS_LIKES, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
            }
        });

        return result;
    } catch(err) {
        console.error('Error parsing JSON string:', err)
    } 
}

// connect to youtube API and get the statistics from all of the videos given in 
// an array of video ids
// Writes to ./TRANSCRIPTS/dis_likes.json, but also returns the data.
async function getStatistics(IDS, mainDirName) {
    const auth = new google.auth.GoogleAuth({
        keyFilename: process.env.SECRET_FILE, // gcloud service account
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
      fs.writeFile(`./${mainDirName}/dis_likes.json`, jsonDIS_LIKES, err => {
          if (err) {
              console.log('Error writing file', err)
          } else {
              console.log('Successfully wrote file')
          }
      });

      return createResponse.data;
}

export {
    getIds, processDisLikes, getStatistics
}