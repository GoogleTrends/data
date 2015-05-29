
function init(params) {
  var key = params.key; 
  var account = params.account;
  var repo = params.repo;
  var pagination = params.pagination || 20;

  var data;
  var currentData;
  var filters = {};

  var subjectFilter = document.getElementById("subject");
  var coverageFilter = document.getElementById("coverage");
  var fromFilter = document.getElementById("from");
  var toFilter = document.getElementById("to");
  var fromPicker, toPicker;

  Tabletop.init({
      key: key,
      callback: loadData,
      simpleSheet: true})
  

  function loadData(csv, tabletop) {
    data = csv.map(function(d) {d.date = new Date(d.date); return d;});
    initFilters();
    filterData();
  }

  function initFilters() {
    var subjects = {}, coverage = {};
    var minYear, maxYear;
    var minDate = new Date(), maxDate = new Date(0);
    var i;
    var myOption;

    data.forEach(function(d) {
      subjects[d.subject] = true;
      coverage[d.coverage] = true;
      if (minDate > d.date) {minDate = d.date;}
      if (maxDate < d.date) {maxDate = d.date;}
    })
    minYear = minDate.getUTCFullYear();
    maxYear = maxDate.getUTCFullYear();
    subjects = ["all"].concat(Object.keys(subjects));
    coverage = ["all"].concat(Object.keys(coverage));

    fromPicker = new Pikaday({
      field: fromFilter, 
      position: 'top left',
      firstDay: 1,
      minDate: minDate, 
      maxDate: maxDate, 
      yearRange: [minYear, maxYear]
    });

    toPicker = new Pikaday({
      field: toFilter, 
      position: 'top left',
      firstDay: 1,
      minDate: minDate, 
      maxDate: maxDate, 
      yearRange: [minYear, maxYear]
    });

    while (subjectFilter.firstChild) {
      subjectFilter.remove(subjectFilter.firstChild);
    }
    while (coverageFilter.firstChild) {
      coverageFilter.remove(coverageFilter.firstChild);
    }
    subjects.forEach(function(d, i) {
      myOption = document.createElement("option");
      myOption.value = d;
      myOption.innerHTML = d;
      subjectFilter.appendChild(myOption);
    })

    coverage.forEach(function(d, i) {
      myOption = document.createElement("option");
      myOption.value = d;
      myOption.innerHTML = d;
      coverageFilter.appendChild(myOption);
    })

    subjectFilter.addEventListener("change", function() {
      var val = subjectFilter.value;
      if (val === "all") {
        delete filters.subject;
      } else {
        filters.subject = val;
      }
      filterData();
    })

    coverageFilter.addEventListener("change", function() {
      var val = coverageFilter.value;
      if (val === "all") {
        delete filters.coverage;
      } else {
        filters.coverage = val;
      }
      filterData();
    })

    fromFilter.addEventListener("change", function() {
      var val = fromFilter.value;
      if (val === "") {
        delete filters.from;
      } else {
        filters.from = new Date(val);
      }
      filterData();
    })

    toFilter.addEventListener("change", function() {
      var val = toFilter.value;
      if (val === "") {
        delete filters.to;
      } else {
        filters.to = new Date(val);
      }
      filterData();
    })

  }

  function filterData() {
    console.log(filters);
    currentData = data.filter(function(d) {
      var keep = true;
      Object.keys(filters).some(function(k) {
        if (["coverage", "subject"].indexOf(k) >=0) {
          if (d[k] !== filters[k]) {return (keep = false);}
        }
        if (k === "from" && d.date < filters.from) {
          return (keep = false);
        }
        if (k === "to" && d.date > filters.to) {
          return (keep = false);
        }
      });
      return keep;
    })
    showData();
  }

  function showData() {
    console.log(currentData);
    var i;
    var tableRecords = document.querySelectorAll("#files tr.record");
    var table = document.getElementById("files")
    for (i = 0; i < tableRecords.length; i ++) {
      table.removeChild(tableRecords[i]);   
    }
     
    currentData.forEach(function(d) {
      var newRow = document.createElement("tr");
      newRow.classList.add("record");
      ["id", "title", "date", "records", "coverage", "subject", "link"].forEach(function(k) {
        var newCell = document.createElement("td");
        if (k !== "link") {
          if (k === "date") {
            var date = new Date(d[k]);
            newCell.innerHTML = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getUTCFullYear(); 
          } else {
            newCell.innerHTML = d[k];
          }
        } else {
          https://raw.githubusercontent.com/jckr/drunken-sansa/master/
          var a = document.createElement("a");
          a.setAttribute("href", "https://raw.githubusercontent.com/" + account + "/" + repo + "/master/" + d[k]);
          a.setAttribute("download", "");
          a.setAttribute("target", "_blank");
          a.innerHTML = "Download"
          newCell.appendChild(a);
        }
        newRow.appendChild(newCell);
      })
      table.appendChild(newRow);
    })
  }
}