const prompt = require('prompt');
const {getIds, getStatistics, processDisLikes, getMissingCaptionPeople, getList} = require('./dis_likes.js');
const {getCaptions} = require('./transcript.js');

module.exports.main = async function() {
    prompt.start();
    prompt.get(['folder'], async function (err, result) {
        if (err) { return onErr(err); }
        console.log('Command-line input received:');
        console.log('  Main transcript folder name: ' + result.folder);

        getCaptions(result.folder);
        const IDS = await getIds(result.folder);
        await getStatistics(IDS);
        await processDisLikes(result.folder);
    });
    
    function onErr(err) {
        console.log(err);
        return 1;
    }    
}

module.exports.processDisLikes = async function() {
    processDisLikes('TRANSCRIPTS');
}

module.exports.getMissingCaptionPeople = async function() {
    getMissingCaptionPeople('TRANSCRIPTS')
}

module.exports.getList = async function() {
    getList('TRANSCRIPTS')
}