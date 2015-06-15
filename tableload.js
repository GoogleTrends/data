
function init(params) {
  var key = params.key;
  var account = params.account;
  var repo = params.repo;
  var pagination = params.pagination || 20;
  var page = 0;
  var maxPage = 0;

  var data;
  var currentData;
  var filters = {};

  var subjectFilter = document.getElementById("subject");
  var coverageFilter = document.getElementById("coverage");
  var fromFilter = document.getElementById("from");
  var toFilter = document.getElementById("to");

  var prev = document.getElementById("prev");
  var next = document.getElementById("next");
  var go = document.getElementById("go");
  var pageInput = document.getElementById("page");

  var fromPicker, toPicker;

  Tabletop.init({
      key: key,
      callback: loadData,
      simpleSheet: true})


  function loadData(csv, tabletop) {
    data = csv.map(function(d, i) {
      d.id = i;
      d.date = new Date(d.date);
      return d;
    });
    data.sort(function(a, b) {return b.date - a.date;})
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
      d.subject.split(",").forEach(function(item) {
        subjects[item.trim()] = true;
      });

      d.coverage.split(",").forEach(function(item) {
        coverage[item.trim()] = true;
      });

      if (minDate > d.date) {minDate = d.date;}
      if (maxDate < d.date) {maxDate = d.date;}
    })
    minYear = minDate.getUTCFullYear();
    maxYear = maxDate.getUTCFullYear();
    subjects = ["all"].concat(Object.keys(subjects).sort());
    coverage = ["all"].concat(Object.keys(coverage).sort());

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

    prev.addEventListener("click", function() {
      if (page > 0) {
        page = page - 1;
        showData();
      }
    })

    next.addEventListener("click", function() {
      if (page + 1 < maxPages) {
        page = page + 1;
        showData();
      }
    })

    go.addEventListener("click", function() {
      var val = parseFloat(pageInput.value);
      if (!isNaN(val) && val > 0 && val < maxPages) {
        page = (val - 1);
        showData();
      }
    })

  }

  function filterData() {
    console.log(filters);
    currentData = data.filter(function(d) {
      var keep = true;
      Object.keys(filters).some(function(k) {
        if (["coverage", "subject"].indexOf(k) >=0) {
          if (d[k]
            .split(",")
            .map(function(a) {return a.trim()})
            .indexOf(filters[k]) < 0) {return (keep = false);}
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
    maxPages = Math.ceil(currentData.length / pagination);
    page = Math.min(page, maxPages);
    showData();
  }

  function showData() {
    console.log(currentData);
    var d,i;
    var tableRecords = document.querySelectorAll("#files tr.record");
    var table = document.getElementById("files")
    for (i = 0; i < tableRecords.length; i ++) {
      table.removeChild(tableRecords[i]);
    }

    var currentPage = document.getElementById("currentPage");
    var totalPages = document.getElementById("totalPages");

    totalPages.innerHTML = maxPages;
    currentPage.innerHTML = (page + 1);

    for(i = page * pagination; i < Math.min((page + 1) * pagination, currentData.length); i++) {
      d = currentData[i];
      var newRow = document.createElement("tr");
      newRow.classList.add("record");
      ["title", "date", "coverage", "subject", "link"].forEach(function(k) {
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
    }



  }
}
