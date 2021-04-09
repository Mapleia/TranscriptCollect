import {getIds, getStatistics, processDisLikes} from './dis_likes';
import {getCaptions} from './transcript';
const prompt = require('prompt');

const main = async function() {
    prompt.start();
    prompt.get(['folder'], function (err, result) {
        if (err) { return onErr(err); }
        console.log('Command-line input received:');
        console.log('  Main transcript folder name: ' + result.folder);

        getCaptions(result.folder);
        const IDS = await getIds(result.folder);
        await getStatistics(IDS, result.folder);
        await processDisLikes(result.folder);
    });
    
    function onErr(err) {
        console.log(err);
        return 1;
    }    
}

main();