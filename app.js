"use strict";

const year = 111;
const semester = 2;
var course_data = {};
var selected_course = {};
var total_credits = 0;
var total_hours = 0;
var total_period = {}

function generateTable()
{
    const timeList = ["y", "z", "1", "2", "3", "4", "n", "5", "6", "7", "8", "9", "a", "b", "c", "d"] ;
    const dayList = ["M", "T", "W", "R", "F", "S", "U"] ;
    const timePeriod = ["6:00~6:50", "7:00~7:50", "8:00~8:50", "9:00~9:50", "10:10~11:00", "11:10~12:00",
        "12:20~13:10", "13:20~14:10", "14:20~15:10", "15:30~16:20", "16:30~17:20", "17:30~18:20",
        "18:30~19:20", "19:30~20:20", "20:30~21:20", "21:30~22:20"] ;
    for(let i=0; i<timeList.length; i++)
    {
        var time = timeList[i] ;
        var period = timePeriod[i] ;
        var row = `<tr id="${time}"><td scope="row" style="vertical-align: middle; padding: .75rem 0;">${time}<br>(${period})</td>` ;
        for(let j=0; j<dayList.length; j++)
        {
            var day = dayList[j]
            row += `<td id="${day}${time}" style="vertical-align: middle; padding: 0;"></td>`
        }
        row += `</tr>`
        $("#timetable tbody").append(row) ;
    }
}

// Return the matched course data of the input.
function filter_course(input) {
    /*With flag 'i', the search is case-insensitive, e.g., no difference between A and a.*/
    const regexp = RegExp(input, 'i');
    const result = Object.values(course_data)
        .filter(course => ((
            course.id == input ||
            course.teacher.match(regexp) ||
            course.name.match(regexp))
        ));

    return result;
}

function getcourseID(element) {
    return element.closest('.course, .btn').id;
}

// Update the total credits and hours of the selected lists.
function updateCreditHour(courseID, add) {
    var search_result = filter_course(courseID) ;
    var credit = parseFloat(search_result[0]['credit']) ;
    var hour = parseFloat(search_result[0]['hours']);
    if(isNaN(credit)){credit = 0;}
    if(isNaN(hour)){hour = 0;}
    var credit_element = document.getElementById('total_credits');
    var hour_element = document.getElementById('total_hours');
    if(add){total_credits += credit;total_hours += hour}
    else{total_credits -= credit;total_hours -= hour}
    credit_element.innerHTML = total_credits + " 學分";
    hour_element.innerHTML = total_hours + " 小時";
}

// Trigger when 
// 1. click on the "+" icon on the course
// 2. click on the "-" icon on the course
function toggleCourse(courseID) {
    const button = document.querySelector(`.course[id="${courseID}"] .toggle-course`);
    var add = true;
    const data_set = filter_course(courseID);
    const timeList = data_set[0]["time"];
    if (courseID in selected_course) { // Remove course
        add = false;
        delete selected_course[courseID];
        document.querySelector(`#selected_course div[id="${courseID}"]`).remove();
        button?.classList.remove('selected');
        document.querySelectorAll('.bg-success').forEach(table_element => {
            table_element.classList.remove('bg-success');
        });
        document.querySelectorAll('.bg-danger').forEach(table_element => {
            table_element.classList.remove('bg-danger');
        });
    } else { // Add course
        if(isConflict(timeList))
        {
            alert('衝堂了啦！');
            return;
        }
        var container = document.getElementById("selected_course");
        selected_course[courseID] = true;
        appendCourseElement(courseID, container);
        button?.classList.add('selected');
    }
    updateCreditHour(courseID, add);
    updateTable(courseID, add);
    save();
}

// Render the table when
// 1. Add course
// 2. Remove course
function updateTable(courseID, add) {
    const data_set = filter_course(courseID);
    const timeList = data_set[0]["time"];
    const name = data_set[0]["name"];
    const time_classroom = data_set[0]["time-classroom"];
    const tc_list = time_classroom.split(',');
    var tc_pair = {};
    for(let i=0; i<tc_list.length; i++)
    {
        const tc = tc_list[i];
        const ts = tc.split('-')[0];
        var c;
        const pattern = /[MTWRFSU][1-9yznabcd]+/g;
        const t_list = ts.match(pattern);
        for(let j=0; j<t_list.length; j++)
        {
            const t = t_list[j];
            for(let k=0; k<t.length-1; k++)
            {
                const t_split = t[0]+t[k+1];
                try{c = tc.split('-')[1];}
                catch(e){c = '';}
                tc_pair[t_split] = c;
            }
        }
    }
    for(let i=0; i<timeList.length; i++)
    {
        var time = timeList[i];
        var classroom = tc_pair[time];
        var tableElement = document.getElementById(time);
        var btn = document.createElement("button");
        btn.classList.add("btn", "btn-outline-dark");
        btn.setAttribute("style", "padding: 0.375rem;");
        btn.setAttribute("id", courseID);
        btn.setAttribute("data-toggle", "modal");
        btn.setAttribute("data-target", "#courseModal");
        btn.innerHTML = name + '<br>' + classroom;
        if(!add)  // Remove from table
        {
            tableElement.removeChild(tableElement.firstChild);
            delete total_period[time];
        }
        else  // Add to table
        {
            const table_element = document.getElementById(time);
            tableElement.classList.remove("bg-success");
            tableElement.appendChild(btn);
            total_period[time] = true;
        }
    }
}

// Whether the time periods of the chosen course is conflict with the ones of the selected courses.
function isConflict(timeList) {
    for(let i=0; i<timeList.length; i++)
    {
        var time = timeList[i];
        if(time in total_period)
        {
            return true;
        }
    }
    return false;
}

// Download the table as a PNG file.
function download() {
    document.querySelectorAll('th, td').forEach(table_element => {
        table_element.classList.add('bg-white');
    });
    document.querySelectorAll('.btn-outline-light').forEach(table_element => {
        table_element.classList.remove('btn-outline-light');
        table_element.classList.add('btn-outline-dark');
    });
    setTimeout(function(){
        var table = document.getElementById("timetable");
        domtoimage.toPng(table)
        .then(function (dataURL) {
            var link = document.createElement('a');
            link.href = dataURL;
            link.download = year + '-' + semester + '_timetable.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }, 500);
}

// Append courses to
// 1. search list
// 2. selected course list
function appendCourseElement(val, container) {
    var search_result = filter_course(val) ;
    search_result.sort(function(x, y){
        return x.id - y.id ;
    }) ;
    for (let i = 0; i < search_result.length; i++) {
        var selected = "";
        var id = search_result[i]['id'] ;
        if(id in selected_course){selected = " selected";}
        var num_limit = search_result[i]['num_limit'] ;
        var reg_num = search_result[i]['reg_num'] ;
        var name = search_result[i]['name'] ;
        var credit = parseFloat(search_result[i]['credit']) ;
        var hours = search_result[i]['hours'] ;
        var teacher = search_result[i]['teacher'] ;
        var time = search_result[i]['time'] ;
        var time_classroom = search_result[i]['time-classroom'] ;
        var english = search_result[i]['english'] ;
        var brief = search_result[i]['brief'] ;
        var memo = search_result[i]['memo'] ;
        var type = search_result[i]['type'] ;
        var badge = '<span class="badge badge-danger">' + type + '</span>'
        if(isNaN(credit)){credit = 0;}
        if(english){badge += '&nbsp;<span class="badge badge-info">英文授課</span>' ;}
        for(let j=0; j<brief.length; j++)
        {
            if(brief[j] == ''){break ;}
            badge += '&nbsp;<span class="badge badge-secondary">' + brief[j] + '</span>' ;
        }
        var list_group_item = document.createElement("div");
        list_group_item.setAttribute("id", `${id}`);
        list_group_item.setAttribute("class", "course list-group-item");
        list_group_item.style.display = "flex"
        var col_1 = document.createElement("div");
        col_1.setAttribute("class", "col-11 p-0");
        var col_2 = document.createElement("div");
        col_2.setAttribute("class", "col-1 p-0");
        col_2.setAttribute("style", "display: flex; align-items: center;");
        var icon = document.createElement("a");
        icon.setAttribute("class", " fas fa-plus fa-lg toggle-course" + selected);
        icon.setAttribute("style", 
            "position: absolute; \
            right: 10px; \
            color: #28a745;\
            cursor: pointer; \
            text-decoration: none;");
        icon.setAttribute("aria-hidden", "true");
        col_2.appendChild(icon);
        var nameTag = document.createElement("div");
        var badgeTag = document.createElement("div");
        var infoTag = document.createElement("div");
        nameTag.setAttribute("style", "cursor: pointer;");
        nameTag.setAttribute("data-toggle", "modal");
        nameTag.setAttribute("data-target", "#courseModal");
        badgeTag.setAttribute("style", "cursor: pointer;");
        badgeTag.setAttribute("data-toggle", "modal");
        badgeTag.setAttribute("data-target", "#courseModal");
        infoTag.setAttribute("style", "cursor: pointer;");
        infoTag.setAttribute("data-toggle", "modal");
        infoTag.setAttribute("data-target", "#courseModal");
        nameTag.innerHTML = name;
        badgeTag.innerHTML = badge;
        infoTag.innerHTML = id + '・' + teacher + '・' + parseFloat(credit) + ' 學分';
        col_1.appendChild(nameTag);
        col_1.appendChild(badgeTag);
        col_1.appendChild(infoTag);
        list_group_item.appendChild(col_1);
        list_group_item.appendChild(col_2);
        container.appendChild(list_group_item);
    }
}

// Show related courses while typing keywords.
function searchCourse(inp) {
    inp.addEventListener("input", function(e) {
        var a, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        var search_result = document.getElementById("search_result");
        var list_group = document.createElement("div");
        list_group.setAttribute("id", "autocomplete-list");
        list_group.setAttribute("class", "autocomplete-items");
        appendCourseElement(val, list_group);
        search_result.appendChild(list_group);
    });
    // close all autocomplete lists in the document,
    // except the one passed as an argument:
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
}

// Load the course data.
function loadJSON()
{
    jQuery.ajaxSetup({async: false});
    $.get(`course_data\\${year}-${semester}_data.json`,function(data,status){
        if(status != "success"){
            alert("Couldn't get course data!!");
        }
        course_data = data;
    });
    jQuery.ajaxSetup({async: true});
}

// Show course info modal when
// 1. clicking on the name of the search result list or the selected list.
// 2. clicking on the course button on the table.
function showModal() {
    $('#courseModal').on('show.bs.modal', function (event) {
        var launcher = event.relatedTarget // Element that triggered the modal
        var courseID = launcher.closest(".course, .btn").id;
        var data = filter_course(courseID)[0];
        var name = data["name"];
        var id = data["id"];
        var credit = parseFloat(data["credit"]);
        var hour = parseFloat(data["hours"]);
        if(isNaN(credit)){credit = 0;}
        if(isNaN(hour)){hour = 0;}
        var teacher = data["teacher"];
        var tc = data["time-classroom"];
        var num_limit = data["num_limit"];
        if(num_limit == 9999){num_limit = "不限";}
        var reg_num = data["reg_num"]
        if(reg_num == -999){reg_num = "-";}
        var modal = $(this)
        modal.find('.modal-title').text(name)
        var dl = '<dl class="row mb-0">';
        var id_row = '<dt class="col-6 text-right">當期課號</dt><dd class="col-6">' + id + '</dd>';
        var teacher_row = '<dt class="col-6 text-right">授課教師</dt><dd class="col-6">' + teacher + '</dd>';
        var credit_hour_row = '<dt class="col-6 text-right">學分 / 時數</dt><dd class="col-6">' + credit + ' / ' + hour + '</dd>';
        var num_row = '<dt class="col-6 text-right">人數上限 / 修課人數</dt><dd class="col-6">' + num_limit + ' / ' + reg_num + '</dd>';
        var tc_row = '<dt class="col-6 text-right">上課時間及教室</dt><dd class="col-6">' + tc + '</dd>';
        dl += id_row + teacher_row + credit_hour_row + tc_row + num_row;
        dl += '</dl>';
        modal.find('.modal-body')[0].innerHTML = dl;
        var outline = document.getElementById("outline");
        outline.href = "https://timetable.nycu.edu.tw/?r=main/crsoutline&Acy=" + year + "&Sem=" + semester + "&CrsNo=" + id + "&lang=zh-tw"
        })
}

// Save the selected course data to local storage.
function save() {
    localStorage.setItem("selected_course",JSON.stringify(selected_course));
    localStorage.setItem("year", year);
    localStorage.setItem("semester", semester);
}

// Load the selected course data from local storage.
function load() {
    var old_year = localStorage.getItem("year");
    var old_semester = localStorage.getItem("semester");
    if (year == old_year && semester == old_semester){
        selected_course = localStorage.getItem("selected_course");
        selected_course = JSON.parse(selected_course);
        if(selected_course==null){
            selected_course = {};
        }
    }
    else{
        selected_course = {};
    }
}

function init() {
    generateTable();
    loadJSON();
    load();
    var course_list = Object.keys(selected_course)
    for(let i=0; i<course_list.length; i++)
    {
        var id = course_list[i];
        var button = document.querySelector(`.course[id="${id}"] .toggle-course`);
        var container = document.getElementById("selected_course");
        appendCourseElement(id, container);
        button?.classList.add('selected');
        updateCreditHour(id, true);
        updateTable(id, true);
    }
}

$(document).ready(function(){
    searchCourse(document.getElementById("search"));
    showModal();
    init();
    
    document.addEventListener("click", function ({target}) {
        if(target.classList.contains('toggle-course'))
            toggleCourse(getcourseID(target));
        if(target.id == 'download')
            download();
    })
    
    document.addEventListener("mouseover", function (event) {
        var element = event.target;
        if (element.matches('.autocomplete-items .course, .autocomplete-items .course *')) {
            const courseID = element.closest('.course').id;
            const timeList = filter_course(courseID)[0]["time"];
            timeList.forEach(time => {
                const table_element = document.getElementById(time);
                if(time in total_period){table_element.classList.add('bg-danger')}
                else{table_element.classList.add('bg-success');}
                if(table_element.firstChild)
                {
                    const btn = table_element.firstChild;
                    btn.classList.remove("btn-outline-dark");
                    btn.classList.add("btn-outline-light");
                }
            });
        }
    })
    
    document.addEventListener("mouseout", function (event) {
        var element = event.target;
        if (element.matches('.autocomplete-items .course, .autocomplete-items .course *')) {
            document.querySelectorAll('.bg-success').forEach(table_element => {
                table_element.classList.remove('bg-success');
                if(table_element.firstChild)
                {
                    const btn = table_element.firstChild;
                    btn.classList.remove("btn-outline-light");
                    btn.classList.add("btn-outline-dark");
                }
            });
            document.querySelectorAll('.bg-danger').forEach(table_element => {
                table_element.classList.remove('bg-danger');
                if(table_element.firstChild)
                {
                    const btn = table_element.firstChild;
                    btn.classList.remove("btn-outline-light");
                    btn.classList.add("btn-outline-dark");
                }
            });
        }
    })
}) ;
