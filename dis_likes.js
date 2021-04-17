//const youtube = require('@googleapis/youtube');
const fs = require('fs');
const {google} = require('googleapis');
const youtube = google.youtube('v3');
const {readFile} = fs.promises;
const moment = require('moment');


async function readYoutubeVids(mainDirName) {
    try {
        const data = await readFile(`../${mainDirName}/youtube_vids.json`, 'utf8');
        const VIDEOS = JSON.parse(data);
        return VIDEOS;
    } catch (err) {
        console.error(`Could not find ${mainDirName}/youtube_vids.json`);
        process.exit(1);
    }
    
}

function formatDate(date) {
    var dt = new Date(date);

    return `${dt.getFullYear().toString().padStart(4, '0')}-${
            (dt.getMonth()+1).toString().padStart(2, '0')}-${
            dt.getDate().toString().padStart(2, '0')} ${
            dt.getHours().toString().padStart(2, '0')}:${
            dt.getMinutes().toString().padStart(2, '0')}:${
            dt.getSeconds().toString().padStart(2, '0')}`;
}

// from a json file with the dislikes and likes ./TRANSCRIPTS/dis_likes.json,
// process to get the vital information and output to ./TRANSCRIPTS/DISLIKES_LIST.json
async function processDisLikesDate(YOUTUBERS, mainDirName, raw_data) {
    try {
        var result = {};
        for (const vid of raw_data.items) {
            result[vid.id] = {
                likes: vid.statistics.likeCount ? parseInt(vid.statistics.likeCount): null,
                dislikes: vid.statistics.dislikeCount ? parseInt(vid.statistics.dislikeCount): null,
                date: vid.snippet.publishedAt ? formatDate(vid.snippet.publishedAt): null
            }
        }

        var ratio_list = [];
    
        var missing = "";
        for (const youtuber of YOUTUBERS) {
            var likes = result[youtuber['id']]['likes']
            var dislikes = result[youtuber['id']]['dislikes']
            var date = result[youtuber['id']]['date']
            var initial = youtuber['initial_contro'];

            console.log(`Likes: ${likes}`, `Dislikes: ${dislikes}`)
            if (likes && dislikes) {
                var ratio = likes/dislikes
                var obj = {
                    'id': youtuber['id'],
                    'name': youtuber['name'],
                    'date': date,
                    'like': likes,
                    'dislikes': dislikes,
                    'ratio': ratio,
                    'dateDiff': moment(date).diff(moment(initial), 'days')
                }
                ratio_list.push(obj)
            } else {
                missing += `name: ${youtuber['name']}, ${youtuber['link']}\n`
            }
        }
        console.log('Length of ratio list', ratio_list.length);
    
        const jsonDIS_LIKES = JSON.stringify(ratio_list, null, '\t');
        fs.writeFile(`../${mainDirName}/ratio_list.json`, jsonDIS_LIKES, err => {
            if (err) {
                console.error('Error writing file', err)
            } else {
                console.log('Successfully wrote file ratio_list.json')
            }
        });
    
        fs.writeFile(`../${mainDirName}/missing_ratio.txt`, missing, err => {
            if (err) {
                console.error('Error writing file', err)
            } else {
                console.log('Successfully wrote file missing_ratio.txt')
            }
        })
    
        return ratio_list;
    } catch(err) {
        console.error(err)
        process.exit(1);
    }
}

async function getMissingCaptionPeople(youtubers, mainDirName) {
    try {
        var files = await fs.promises.readdir(`../${mainDirName}/TEXT`);
        files = files.map((file) => {
            return file.slice(0, -4)
        })
        const missingPeople = youtubers.filter((video) => {
            return !files.includes(video['name'])
        })
        var missing = "";
        for (const person of missingPeople) {
            missing += `name: ${person['name']}, ${person['link']}\n`
        }
        fs.writeFile(`../${mainDirName}/missing_captions.txt`, missing, err => {
            if (err) {
                console.error('Error writing file missing_captions.txt', err)
            } else {
                console.log('Successfully wrote file missing_captions.txt')
            }
        })

    } catch(err) {
        console.error('Error parsing JSON string', err)
        process.exit(1);
    } 
    
}

// connect to youtube API and get the statistics from all of the videos given in 
// an array of video ids
// Writes to ./TRANSCRIPTS/dis_likes.json, but also returns the data.
async function getStatistics(youtubers, mainDirName) {
    
    const secret_file = process.env.SECRET_FILE? process.env.SECRET_FILE : "service_account.json";
    if (!fs.existsSync(`${secret_file}`)){
        console.error('No service account secret file found.');
        process.exit(1);
    }
    try {
        const auth = new google.auth.GoogleAuth({
            keyFilename: secret_file, // gcloud service account
            scopes: 'https://www.googleapis.com/auth/youtube.readonly'
        });
        const authClient = await auth.getClient();
        google.options({auth: authClient});

        const IDS = youtubers.map((vid) => {return vid['id']});
        const stringed = IDS.join(",");
        const createResponse = await youtube.videos.list({
            part: ['statistics', 'snippet'],
            id: stringed
        });
              
        const ratios = await processDisLikesDate(youtubers, mainDirName, createResponse.data)
    
        return ratios;
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
    
}

async function getList(youtubers, mainDirName) {
    try {
        var links = "";

        for (const video of youtubers) {
            const {link, other, transcript} = video;
            links += `${link}\n`
            if (other) links += `${other}\n`
            if (transcript) links += `${transcript}\n`
        }
        fs.writeFile(`../${mainDirName}/list_youtuber.txt`, links, err => {
            if (err) {
                console.error('Error writing file list_youtuber.txt', err)
            } else {
                console.log('Successfully wrote file list_youtuber.txt')
            }
        })
    } catch(err) {
        console.error('Error parsing JSON string:', err);
        process.exit(1);
    } 
}

module.exports = {
    processDisLikesDate, getStatistics, getMissingCaptionPeople, getList, readYoutubeVids
}