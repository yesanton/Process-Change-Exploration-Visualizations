// in this file the main system is set up to be running

dfg = configDFG();

// let count = 50
// let count_actual = 25
let data = {}
data.count = 50
data.count_actual = 25
// data.timestamps - timestamps
// data.dfrs - directly follow relations for each constraints
// data.dfrs[].series[]
// data.dfrs.act1
// data.dfrs.act2
// data.dfrs.technique
data.dfrs = []


d3.csv("bpi12-50-25-25.csv",
  // When reading the csv, I must format variables:
    function(d,i){        
        if (i == 0) {
            // let d_new = d.slice(4,5);
            let timestamps = []
            for (let j = 0 ; j < data.count ; j+=1){
                // https://github.com/d3/d3-time-format
                let temp_date = d3.timeParse("%Y-%m-%d %H:%M:%S.%f%Z")(d[j])
                timestamps.push(temp_date)    
            }
            // should we add here also unnecessary columns?
            data.timestamps = timestamps;
            // return timestamps
        }
        if (i > 1) {
            temp = []
            temp.series = []
            for (let j = 0 ; j < data.count ; j+=1){
                temp.series.push(+d[j])
            }
            temp.act1 = d.act1
            temp.act2 = d.act2
            temp.technique = d.technique
            data.dfrs.push(temp)
            // return dfrs;
        }
    })
    .then( (d,i) => {
        console.log("dfg")
        console.log(dfg)
        drawDFG(dfg, data)

})
.catch(function(error){
  console.log('cannot import file')
})