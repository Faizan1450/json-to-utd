const asyncHandler = require('express-async-handler');
const { getRowsByIflow, getRowsBySenderInterface } = require('../utils/dataStore');

const searchIflow = asyncHandler(async (iflowObj) => {
  const { iflow, senderInterface, region} = iflowObj;
  let resJson = [];

  //! If user wants UTD on basis of SenderInterface and Region
  if (senderInterface && region) {
    resJson = getRowsBySenderInterface(senderInterface,region);
    if (!resJson) {
      throw new Error(`❌ No match for Sender Interface "${iflowIdInput}" Or Its Descoped`);
    }
    return resJson;
  }

  //! If user wants UTD on basis of Iflows
  const iflows = Array.isArray(iflow) ? iflow : [iflow];
  iflows.forEach(iflowIdInput => {
    console.log("iflowidinput")
    console.log(iflowIdInput)
    if(!iflowIdInput) {
      throw new Error("IFLOW ID Not found");
    }
    const iflowJson = getRowsByIflow(iflowIdInput);
    resJson.push(...iflowJson);
  });

  if (resJson.length === 0) {
    throw new Error(`No match found for iFlow ID Or Its Descoped`);
  }
  return resJson;
});

module.exports = searchIflow;