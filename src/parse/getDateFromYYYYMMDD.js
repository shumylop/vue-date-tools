// YYYY-MM-DD

export default function getDateFromYYYYMMDD(timestamp){
    if(!timestamp){
        return null
    }
    if(!( typeof timestamp === 'string' || timestamp instanceof String)){
        timestamp = timestamp + ''
    }
    if(timestamp.length !== 10){
        return null
    }
    let dateParts = timestamp.split('-')
    if(dateParts.length !== 3) {
        return null
    }
    const day = parseInt(dateParts[2])
    const month = parseInt(dateParts[1]) - 1
    const year = parseInt(dateParts[0])

    if(isNaN(day) || day < 0 || day > 31 || isNaN(month) || month < 0 || month > 11 || isNaN(year) || year < 1980 || year > 2100 ){
        return null
    }

    return new Date(
        year,
        month,
        day
    )
}
