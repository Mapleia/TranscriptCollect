//const youtube = require('@googleapis/youtube');
const fs = require('fs').promises;
const {google} = require('googleapis');
const youtube = google.youtube('v3');

// './youtube_vids.json'
async function getIds() {
    const data = await fs.readFile('./youtube_vids.json', 'utf8');
    try {
        const VIDEOS = JSON.parse(data);
        //console.log(VIDEOS)
        var ids = VIDEOS.map((vid) => {
            //onconsole.log(vid['id']);
            return vid['id']
        });
        //console.log(ids)
        return ids;
    } catch(err) {
        console.error('Error parsing JSON string:', err)
    } 
}

const main = async function() {
    const IDS = await getIds();
    //console.log(IDS);
    const cred = await getCredentials();
    const auth = new google.auth.GoogleAuth({
      keyFilename: 'thermal-cathode-245321-abe573604ec3.json',
      //clientId: cred.installed.client_id,
        // Scopes can be specified either as an array or as a single, space-delimited string.
      scopes: 'https://www.googleapis.com/auth/youtube.readonly'
    });
    const authClient = await auth.getClient();
    google.options({auth: authClient});
    
    const stringed = IDS.join(",");
    console.log(stringed);
    const createResponse = await youtube.videos.list({
          part: 'statistics',
          id: stringed
        }
    );
    
    console.log(createResponse.data);
    
    const jsonDIS_LIKES = JSON.stringify(createResponse.data, null, '\t');
    fs.writeFile(`./TRANSCRIPTS/dis_likes.json`, jsonDIS_LIKES, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

main();