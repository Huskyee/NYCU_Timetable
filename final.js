"use strict";

const year = 109;
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

function updateCreditHour(courseID, add) {
    var search_result = filter_course(courseID) ;
    var credit = parseInt(search_result[0]['credit']) ;
    var hour = parseInt(search_result[0]['hours']) ;
    if(isNaN(credit)){credit = 0;}
    if(isNaN(hour)){hour = 0;}
    var credit_element = document.getElementById('total_credits');
    var hour_element = document.getElementById('total_hours');
    if(add){total_credits += credit;total_hours += hour}
    else{total_credits -= credit;total_hours -= hour}
    credit_element.innerHTML = total_credits + " 學分";
    hour_element.innerHTML = total_hours + " 小時";
}

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
            table_element.classList.remove('bg-success', 'text-white');
        });
        document.querySelectorAll('.bg-danger').forEach(table_element => {
            table_element.classList.remove('bg-danger', 'text-white');
        });
    } else { // Add course
        if(isConflict(timeList))
        {
            alert('衝堂了啦！');
            return;
        }
        var container = document.getElementById("selected_course");
        selected_course[courseID] = true;
        appendCourseElement(courseID, container, false);
        button?.classList.add('selected');
    }
    updateCreditHour(courseID, add);
    updateTable(courseID, add);
}

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

function download() {
    if(screen.width < 1024) {
        document.getElementById("viewport").setAttribute("content", "width=1200");
    }
    html2canvas(document.querySelector("#timetable"), {
        windowWidth: "1200px",
        windowHeight: "800px"
    }).then(canvas => {
            var dataURL = canvas.toDataURL("image/png");
            var link = document.createElement('a');
            link.href = dataURL;
            link.download = year + '-' + semester + '_timetable.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    });
    if(screen.width < 1024) {
        document.getElementById("viewport").setAttribute("content", "width=device-width, initial-scale=1, shrink-to-fit=no");
    }
}

document.addEventListener("click", function ({ target }) {
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
            table_element.classList.remove('bg-success', 'text-white');
            if(table_element.firstChild)
            {
                const btn = table_element.firstChild;
                btn.classList.remove("btn-outline-light");
                btn.classList.add("btn-outline-dark");
            }
        });
        document.querySelectorAll('.bg-danger').forEach(table_element => {
            table_element.classList.remove('bg-danger', 'text-white');
            if(table_element.firstChild)
            {
                const btn = table_element.firstChild;
                btn.classList.remove("btn-outline-light");
                btn.classList.add("btn-outline-dark");
            }
        });
    }
})

function appendCourseElement(val, container, is_search) {
    var search_result = filter_course(val) ;
    var selected = "";
    if(!is_search){selected = " selected"};
    search_result.sort(function(x, y){
        return x.id - y.id ;
    }) ;
    for (let i = 0; i < search_result.length; i++) {
        var id = search_result[i]['id'] ;
        var num_limit = search_result[i]['num_limit'] ;
        var reg_num = search_result[i]['reg_num'] ;
        var name = search_result[i]['name'] ;
        var credit = parseInt(search_result[i]['credit']) ;
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
        nameTag.innerHTML = name;
        badgeTag.innerHTML = badge;
        infoTag.innerHTML = id + '・' + teacher + '・' + parseInt(credit) + '學分';
        col_1.appendChild(nameTag);
        col_1.appendChild(badgeTag);
        col_1.appendChild(infoTag);
        list_group_item.appendChild(col_1);
        list_group_item.appendChild(col_2);
        container.appendChild(list_group_item);
    }
}

function searchCourse(inp) {
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        var search_result = document.getElementById("search_result");
        var list_group = document.createElement("div");
        list_group.setAttribute("id", "autocomplete-list");
        list_group.setAttribute("class", "autocomplete-items");
        appendCourseElement(val, list_group, true);
        search_result.appendChild(list_group);
    });
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
}

function loadJSON()
{
    jQuery.ajaxSetup({async: false});
    $.get(`${year}-${semester}_data.json`,function(data,status){
        if(status != "success"){
            alert("Couldn't get course data!!");
        }
        course_data = data;
    });
    jQuery.ajaxSetup({async: true});
}



function showModal() {
    $('#courseModal').on('show.bs.modal', function (event) {
        var launcher = event.relatedTarget // Button that triggered the modal
        var courseID = launcher.closest(".course, .btn").id;
        var data = filter_course(courseID)[0];
        var name = data["name"];
        var id = data["id"];
        var credit = parseInt(data["credit"]);
        if(isNaN(credit)){credit = 0;}
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
        var credit_row = '<dt class="col-6 text-right">學分數</dt><dd class="col-6">' + credit + '</dd>';
        var num_row = '<dt class="col-6 text-right">人數上限 / 修課人數</dt><dd class="col-6">' + num_limit + ' / ' + reg_num + '</dd>';
        var tc_row = '<dt class="col-6 text-right">上課時間及教室</dt><dd class="col-6">' + tc + '</dd>';
        dl += id_row + teacher_row + credit_row + tc_row + num_row;
        dl += '</dl>';
        modal.find('.modal-body')[0].innerHTML = dl;
        var outline = document.getElementById("outline");
        outline.href = "https://timetable.nctu.edu.tw/?r=main/crsoutline&Acy=" + year + "&Sem=" + semester + "&CrsNo=" + id + "&lang=zh-tw"
        })
}

$(document).ready(function(){
    generateTable();
    loadJSON();
    searchCourse(document.getElementById("search"));
    showModal();
}) ;
