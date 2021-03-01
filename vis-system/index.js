// in this file the main system is set up to be running

var position = {
    padding: 10, 
    padding_big: 20
}

let colors = {
    edge_past: '#f66',
    edge_future: 'green', 
    edge_neutral: 'black'
}

// colors.edge_past = '#f66'
// colors.edge_future = 'green'
// let count = 50
// let count_actual = 25
var data = {}
// data.count  - these are the count of each time series
// data.count_actual  - the actual derived from the data, count_actual - count is the predicted then.
// data.series_sum// this is for the sum of the time series to build the graph

// data.timestamps - timestamps
// data.dfrs - directly follow relations for each constraints
// data.dfrs[].series[]
// data.dfrs[].act1
// data.dfrs[].act2
// data.dfrs[].technique
// data.dfrs[].series_sum_each_arc -> is the actual dfg relation 
// data.dfrs[].series_sum_each_arc_diff -> is the actual diff or dfg relations
// data.dfrs[].series_sum_each_arc_prev 
// data.dfrs[].series_sum_each_arc_next 
data.dfrs = []

data.activities_importance = {} // this will be used to colr the activities, and to filter the activities with activities slider

// the result of brushed region and filtering and differencing (when available) is stored here
let filteredData;
// this is even further filtered data that is under the path and activity slider filtering 
let filteredDataPASlider = {};
// store value of the activity and path sliders here sliders.activity, sliders.path
let sliders = {path: 1, activity: 1}

d3.csv("bpi12-50-25-25.csv",
  // When reading the csv, I must format variables:
    function(d,i){        
        if (i == 0) {

            data.count = parseInt(d['count'])
            data.count_actual = parseInt(d['technique'])
            // console.log(d)
            // console.log(data.count)
            // console.log(data.count_actual)

            //initializing variable that depends on the count
            data.series_sum = new Array(data.count).fill(0)

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
        else {
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

        data = calculateActivitiesImportance(data)
        
        drawDFG(data)
        drawLineplot(data, data.count_actual / data.count)

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
        filteredData = filterDataByDate(selections_dates[0]);
        // draw new plot
        // drawDFG(filteredData);

        updatePathAndActivitySlidersD(filteredData);
    }
    else { // here is when two regions are brushed
        let filteredData1 = filterDataByDate(selections_dates[0]);
        let filteredData2 = filterDataByDate(selections_dates[1]);
        // now calculate the difference between two datasets to be representeed in dfg
        // diff!


        if (filteredData1.timestamps[0] < filteredData2.timestamps[0]){
            console.log(filteredData1.timestamps[0])
            console.log(filteredData2.timestamps[0])
            console.log('======================================')
            filteredData = differenceData(filteredData1, filteredData2);
        } else {
            filteredData = differenceData(filteredData2, filteredData1);
        }

        
        console.log('difference between calculated');

        // in case the path and activity sliders are also not in their default 
        // perform those filters and :
        updatePathAndActivitySlidersD(filteredData);
        // drawDFG(filteredData);
    }
}

function updatePathAndActivitySliders(pathSlider, activitySlider){
    // here is when path slider is transwered
    if (pathSlider != undefined){
        sliders.path = pathSlider
    }
    // here is the activities have to filtered 
    else if (activitySlider != undefined) {
        sliders.activity = activitySlider
    }

    console.log("sliders values:  _------>");
    console.log(sliders);

    if (filteredData === undefined) {
        updatePathAndActivitySlidersD(data)
    } else {
        updatePathAndActivitySlidersD(filteredData)
    }
}

function updatePathAndActivitySlidersD(d) {

    console.log('')

    if (Math.abs(sliders.activity - 1) < 0.01 && Math.abs(sliders.path - 1) < 0.01) {
        // if both are 1 then nothing to do here just show the original data
        console.log('drawing dfg right away, nothing to filter with sliders')
        drawDFG(d);
    } else {
        if (Math.abs(sliders.activity - 1) < 0.01 && sliders.path < 1) {
            // if path slider is less than 1 but the activity not we just filter for paths
            filteredDataPASlider = filterDataByPathSlider(d)
            
            console.log('in the PATH SLIDER -<<<<<<<')
            console.log(filteredDataPASlider)
            console.log(data)

        } else if (sliders.activity < 0 && Math.abs(sliders.path - 1) < 0.01) {
            // if activity is less than 1 and path is 1
            // we only filter for activities
            filteredDataPASlider = filterDataByActivitySlider(d)
        } else {
            // if both activitie and paths should be filtered:
            // first we filter activities
            filteredDataPASlider = filterDataByActivitySlider(d)
            // then we filter paths
            filteredDataPASlider = filterDataByPathSlider(filteredDataPASlider)
        }
        
        drawDFG(filteredDataPASlider);

        delete filteredDataPASlider; 
    }
}


// this function filters the dataset by the dates, and returns the complete new set of datavalues from that filtered region
function filterDataByDate(dates){
    let temp_data = {}
    temp_data.dfrs = []

    // console.log("filter function")
    // console.log(data)           
    // console.log(dates)

    temp_data.timestamps = data.timestamps.filter(function (t) {
        return t >= dates[0] && t <= dates[1]
    })

    // console.log(temp_data.timestamps)

    let temp_timestamp_in_range_first = 0
    while (data.timestamps[temp_timestamp_in_range_first] < dates[0]){
        temp_timestamp_in_range_first += 1
    }
    let temp_timestamp_in_range_second = temp_timestamp_in_range_first + temp_data.timestamps.length

    // console.log(temp_timestamp_in_range_first)
    // console.log(temp_timestamp_in_range_second)

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
    temp_data.activities_importance = {}
    temp_data = calculateActivitiesImportance(temp_data)

    console.log(temp_data)
    return temp_data;
}


function differenceData(new_data_1, new_data_2){
    // taking into account that we always compare the first in time with second dataset
    for (let i = 0 ; i < new_data_1.dfrs.length ; i += 1){
        new_data_2.dfrs[i].series_sum_each_arc_diff = new_data_2.dfrs[i].series_sum_each_arc - new_data_1.dfrs[i].series_sum_each_arc;
        new_data_2.dfrs[i].series_sum_each_arc_prev = new_data_1.dfrs[i].series_sum_each_arc
        new_data_2.dfrs[i].series_sum_each_arc_next = new_data_2.dfrs[i].series_sum_each_arc
        new_data_2.dfrs[i].series_sum_each_arc += new_data_1.dfrs[i].series_sum_each_arc
        // now we only use the data from the other section
        new_data_2.dfrs[i].series_sum_each_arc_diff = new_data_1.dfrs[i].series_sum_each_arc;
        
        
    }

    console.log(new_data_2);
    return new_data_2;
}


// we filter here for sliders.path and sliders.activity sliders' results
function filterDataByActivitySlider(d) {
    let filteredBySliders = {}
    // it means that the line chart was brushed
    console.log('in the filter data by activityes slider function')

    // first goes filtering with the activities

    // // this loop collects activities that are exectuted alongsize with the cordinalities 
    // for (let i=0; i < d.dfrs.length ; i+=1){
    //     if (d.dfrs[i].act1 in activities_filter) {
    //         activities_filter[d.dfrs[i].act1] += d.dfrs[i].series_sum_each_arc; 
    //     } else { 
    //         activities_filter[d.dfrs[i].act1] = d.dfrs[i].series_sum_each_arc 
    //     }

    //     if (d.dfrs[i].act2 in activities_filter) {
    //         activities_filter[d.dfrs[i].act2] += d.dfrs[i].series_sum_each_arc; 
    //     } else { 
    //         activities_filter[d.dfrs[i].act2] = d.dfrs[i].series_sum_each_arc 
    //     }
    // }

    d = calculateActivitiesImportance(d)

    // Create items array
    var activities_filter_array = Object.keys(d.activities_importance).map(function(key) {
        return [key, d.activities_importance[key]];
    });
    // after sorting one can see which activities are used the most and which the least.
    activities_filter_array.sort(function(first, second) {
        return second[1] - first[1];
    }) 
    // this will only leave the right number of elements
    activities_filter_array = activities_filter_array.slice(0, Math.round(sliders.activity * activities_filter_array.length))
    let set_activities_filter = new Set(activities_filter_array.map(function(key) {return key[0]}))

    // we take all those arcs that both of the activities that the arc is connecting are in our list of prioritized activities
    let temp_dfrs = []
    for (let i = 0 ; i < d.dfrs.length ; i += 1) { 
        if ((set_activities_filter.has(d.dfrs[i].act1)) && 
            (set_activities_filter.has(d.dfrs[i].act2))){
                temp_dfrs.push(d.dfrs[i])
        }
    }
    //save in the new variable 
    filteredBySliders.count = d.count
    filteredBySliders.count_actual = d.count_actual
    filteredBySliders.timestamps = d.timestamps
    filteredBySliders.series_sum = d.series_sum
    filteredBySliders.dfrs = temp_dfrs
    filteredBySliders.activities_importance = d.activities_importance
    return filteredBySliders;
}

function filterDataByPathSlider(d) {
    let filteredBySliders = {}
    // here goes filtering with the paths
    d.dfrs.sort(function(first, second) {
        return second.series_sum_each_arc - first.series_sum_each_arc;
    })    
    temp_dfrs = d.dfrs.slice(0, Math.round(sliders.path * d.dfrs.length))

    filteredBySliders.count = d.count
    filteredBySliders.count_actual = d.count_actual
    filteredBySliders.timestamps = d.timestamps
    filteredBySliders.series_sum = d.series_sum
    filteredBySliders.dfrs = temp_dfrs
    filteredBySliders.activities_importance = d.activities_importance
    return filteredBySliders;
  
}


function calculateActivitiesImportance(d){
    // this loop collects activities that are exectuted alongsize with the cordinalities 
    
    for (let i=0; i < d.dfrs.length ; i+=1){
        if (d.dfrs[i].act1 in d.activities_importance) {
            d.activities_importance[d.dfrs[i].act1] += d.dfrs[i].series_sum_each_arc; 
        } else { 
            d.activities_importance[d.dfrs[i].act1] = d.dfrs[i].series_sum_each_arc 
        }
        // if (d.dfrs[i].act2 in d.activities_importance) {
        //     d.activities_importance[d.dfrs[i].act2] += d.dfrs[i].series_sum_each_arc; 
        // } else { 
        //     d.activities_importance[d.dfrs[i].act2] = d.dfrs[i].series_sum_each_arc 
        // }
    }
    console.log('1111111111111111111111111111111111111111111111111111111111')

    return d
}