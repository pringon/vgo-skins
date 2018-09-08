/**
 * A function that takes the floating point value of the item wear and returns the wear tier it resides in
 * @function getItemWearCode
 * @param {float} itemWearValue the floating point value of the item wear
 * @return {String} the wear tier the item resides in
 */
function getItemWearCode(itemWearValue) {
    if(itemWearValue == null) {
        return '';
    }
    if(itemWearValue < 0.07) {
        return "FN";
    }
    if(itemWearValue < 0.15) {
        return "MW";
    }
    if(itemWearValue < 0.37) {
        return "FT";
    }
    if(itemWearValue < 0.44) {
        return "WW";
    }
    return "BS";
}

function getItemShortName(itemName) {
    let delimiterPosition = itemName.indexOf('|');
    if(delimiterPosition !== -1) {
        return itemName.substring(delimiterPosition+1, itemName.indexOf('('));
    }
    return itemName;
}