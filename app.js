const prompt = require('prompt');
const {getIds, getStatistics, processDisLikesDate} = require('./dis_likes.js');
const {getCaptions} = require('./transcript.js');

module.exports.main = async function() {
    prompt.start();
    prompt.get(['folder'], async function (err, result) {
        if (err) { return onErr(err); }
        console.log('Command-line input received:');
        console.log('  Main transcript folder name: ' + result.folder);

        getCaptions(result.folder);
        const IDS = await getIds(result.folder);
        await getStatistics(IDS, result.folder);
        await processDisLikesDate(result.folder);
    });
    
    function onErr(err) {
        console.log(err);
        return 1;
    }    
}

module.exports.processDisLikes = async function() {
    processDisLikes('TRANSCRIPTS');
}