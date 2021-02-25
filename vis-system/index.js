// in this file the main system is set up to be running

config_dfg = configDFG();
config_lineplot = configLineplot()

// let count = 50
// let count_actual = 25
let data = {}
data.count = 50
data.count_actual = 25
// data.timestamps - timestamps
// data.dfrs - directly follow relations for each constraints
// data.dfrs[].series[]
// data.dfrs[].act1
// data.dfrs[].act2
// data.dfrs[].technique
data.dfrs = []
data.series_sum = new Array(data.count).fill(0)// this is for the sum of the time series to build the graph

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
                let temp_v = +d[j]
                temp.series.push(temp_v)
                // calculate additional timeseries for line chart
                data.series_sum[j] += temp_v
            }
            temp.act1 = d.act1
            temp.act2 = d.act2
            temp.technique = d.technique
            // add comdined info about the arcs
            temp.series_sum_each_arc = d3.sum(temp.series)
            data.dfrs.push(temp)
            // return dfrs;
        }
    })
    .then( (d,i) => {
        console.log("---------dfg")
        console.log(data)
        drawDFG(config_dfg, data)
        drawLineplot(config_lineplot, data)

})
.catch(function(error){
  console.log('cannot import file')
})

// this function receives the selections of the 1-2 brushes of the linechart
// it then updates the dfg 
function updateSelection(selections_dates){
    console.log(selections_dates)

    

    // filter data    
    // for the case of one brush only
    if (selections_dates.length === 1){
        new_data_1 = filterDataByDate(selections_dates[0]);
        // initialize the dfg againt
        config_dfg = configDFG();
        // remove the previous plot
        d3.select("#DFGChart").selectAll("*").remove();
        // draw new plot
        drawDFG(config_dfg, new_data_1);
    }
    else { // here is when two regions are brushed
        new_data_1 = filterDataByDate(selections_dates[0]);
        new_data_2 = filterDataByDate(selections_dates[1]);


        // now calculate the difference between two datasets to be representeed in dfg
        diff_data = differenceData(new_data_1, new_data_2);

        // initialize the dfg againt
        config_dfg = configDFG();
        // remove the previous plot
        d3.select("#DFGChart").selectAll("*").remove();

        

        console.log('difference between calculated');

        drawDFG(config_dfg, new_data_2);


        // console.log(new_data_1)
        // // initialize the dfg againt
        // config_dfg = configDFG();

        // // remove the previous plot
        // d3.select("#DFGChart").selectAll("*").remove()
        
        // // draw new plot
        // // drawDFGDiff(new_data_1, new_data_2, config_dfg)
        // // drawDFG(new_data_1, config_dfg)
    }
}



// this function filters the dataset by the dates, and returns the complete new set of datavalues from that filtered region
function filterDataByDate(dates){
    let temp_data = {}
    temp_data.dfrs = []

    console.log("filter function")

    console.log(data)
    temp_data.timestamps = data.timestamps.filter(function (t) {
        return t > dates[0] && t < dates[1]
    })

    let temp_timestamp_in_range_first = 0
    while (data.timestamps[temp_timestamp_in_range_first] < dates[0]){
        temp_timestamp_in_range_first += 1
    }
    let temp_timestamp_in_range_second = temp_timestamp_in_range_first + temp_data.timestamps.length

    console.log(temp_timestamp_in_range_first)
    console.log(temp_timestamp_in_range_second)

    for (let elem of data.dfrs){
        temp = []
        temp.series = []
        for(let j = temp_timestamp_in_range_first ; j < temp_timestamp_in_range_second ; j+=1){
            temp.series.push(elem.series[j])
        }
        temp.act1 = elem.act1
        temp.act2 = elem.act2
        temp.technique = elem.technique     
        temp.series_sum_each_arc = d3.sum(temp.series)
        temp_data.dfrs.push(temp) 
    }

    console.log(temp_data)
    return temp_data;
}


function differenceData(new_data_1, new_data_2){
    // taking into account that we always compare the first in time with second dataset
    if (new_data_2.timestamps[0] > new_data_2.timestamps[0]) {
        return differenceData(new_data_2, new_data_1);
    } else {
        for (let i = 0 ; i < new_data_1.dfrs.length ; i += 1){
            new_data_2.dfrs[i].series_sum_each_arc_diff = new_data_2.dfrs[i].series_sum_each_arc - new_data_1.dfrs[i].series_sum_each_arc;
            // console.log(new_data_2.dfrs[i].series_sum_each_arc_diff + ' ' + i)
        }

        console.log(new_data_2);
        return new_data_2;
    }

}