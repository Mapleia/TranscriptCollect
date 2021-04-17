const prompt = require('prompt');
const {getIds, getStatistics, processDisLikesDate, getMissingCaptionPeople, getList, readYoutubeVids} = require('./dis_likes.js');
const {getCaptions} = require('./transcript.js');

module.exports.main = async function() {
    prompt.start();
    prompt.get(['folder'], async function (err, result) {
        if (err) { return onErr(err); }
        console.log('Command-line input received:');
        console.log('  Main transcript folder name: ' + result.folder);
        const youtubers = await readYoutubeVids(result.folder);
        await getCaptions(youtubers, result.folder);
        await getStatistics(youtubers, result.folder);
    });
    
    function onErr(err) {
        console.error(err);
        return 1;
    }    
}

module.exports.getMissingCaptionPeople = async function() {
    const youtubers = readYoutubeVids(result.folder);
    getMissingCaptionPeople(youtubers, 'TRANSCRIPTS')
}

module.exports.getList = async function() {
    const youtubers = readYoutubeVids(result.folder);
    getList(youtubers, 'TRANSCRIPTS')
}