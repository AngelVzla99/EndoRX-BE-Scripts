import { MongoSingleton } from "./clients/mongo.client";
import { LLMResearchPapersService } from "./research_paper/llm_research_papers/llm_research_papers.service";
import { ScrapperResearchPaperService } from "./research_paper/scrapper_research_papers/scrapper_research_paper.service";
import { ScriptRunnerService } from "./script_runner/script_runner.service";


// DO NOT REMOVE THIS LINE
await MongoSingleton.getInstance().getConnection();






// const names =[
//     // 'Andrea+Vidali',
//     // 'Mauricio+Abrão',
//     // 'Alessandra+Di+Giovanni',
//     // 'Madhu+Bagaria',
//     // 'Mallory+Stuparich',
//     // 'Marcello+Ceccaroni',
//     // 'Mario+Malzoni',
//     'Alessio+Pigazzi',
//     'Joseph+Raccuia',
//     'Francesco+Di+Chiara',
//     'Marco+Zoccali',
//     'Henrique+Abrão',
// ]

// const service = new ScrapperResearchPaperService();
// for (const name of names) {
//     console.log('Getting and saving research paper for '+name);
//     await service.getAndSaveResearchPubsubScrapper(name);
//     console.log('Research paper saved for '+name);
// }




// const service = new LLMResearchPapersService();
// await service.populateDatabase();



const service = new ScriptRunnerService();
await service.testExtractor();







// do not remove this line
await MongoSingleton.getInstance().disconnect();
console.log('Script completed successfully');