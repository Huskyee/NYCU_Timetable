"use strict";

const year = 109;
const semester = 2;
var course_data = {};
var selected_course = {};
var total_credits = 0;
var total_hours = 0;

function generateTable()
{
    const timeList = ["y", "z", "1", "2", "3", "4", "n", "5", "6", "7", "8", "9", "a", "b", "c", "d"] ;
    const dayList = ["M", "T", "W", "R", "F", "S", "U"] ;
    const timePeriod = ["6:00 ~ 6:50", "7:00 ~ 7:50", "8:00 ~ 8:50", "9:00 ~ 9:50", "10:10 ~ 11:00", "11:10 ~ 12:00",
        "12:20 ~ 13:10", "13:20 ~ 14:10", "14:20 ~ 15:10", "15:30 ~ 16:20", "16:30 ~ 17:20", "17:30 ~ 18:20",
        "18:30 ~ 19:20", "19:30 ~ 20:20", "20:30 ~ 21:20", "21:30 ~ 22:20"] ;
    for(let i=0; i<timeList.length; i++)
    {
        var time = timeList[i] ;
        var period = timePeriod[i] ;
        var row = `<tr id="${time}"><td scope="row">${time}<br>(${period})</td>` ;
        for(let j=0; j<dayList.length; j++)
        {
            var day = dayList[j]
            row += `<td id="${day}${time}"></td>`
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
    return element.closest('.course').id;
}

function updateCreditHour(courseID, add) {
    var search_result = filter_course(courseID) ;
    var credit = parseInt(search_result[0]['credit']) ;
    var hour = parseInt(search_result[0]['hours']) ;
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
    if (courseID in selected_course) { // Remove course
        add = false;
        delete selected_course[courseID];
        document.querySelector(`#selected_course div[id="${courseID}"]`).remove();
        // document.querySelectorAll(`.period[data-id="${courseID}"]`).forEach(elem => elem.remove());
        button?.classList.remove('selected');
    } else { // Select course
        /*const periods = courseData[courseID].time;
        const isConflict = periods.some(period => document.getElementById(period).querySelector(".period:not(.preview)"))
        if (isConflict) {
            Toast.fire({
                icon: 'error',
                title: "和目前課程衝堂了欸"
            });
            return;
        }*/
        var container = document.getElementById("selected_course");
        selected_course[courseID] = true;
        appendCourseElement(courseID, container, false);
        // renderPeriodBlock(courseData[courseID]);
        button?.classList.add('selected');
    }
    updateCreditHour(courseID, add);
    console.log(selected_course);
    /*document.querySelector(".credits").textContent = `${totalCredits()} 學分`;*/
}

document.addEventListener("click", function ({ target }) {
    if (target.classList.contains('toggle-course'))
        toggleCourse(getcourseID(target));
})

function appendCourseElement(val, container, is_search) {
    var search_result = filter_course(val) ;
    var selected = "";
    if(!is_search){selected = " selected"};
    search_result.sort(function(x, y){
        return x.id - y.id ;
    }) ;
    /*for each item in the array...*/
    for (let i = 0; i < search_result.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
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
        // var start_pos = name.toUpperCase().search(val.toUpperCase()) ;
        /*create a DIV element for each matching element:*/
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
        col_1.innerHTML = name + '<br>';
        col_1.innerHTML += badge + '<br>';
        col_1.innerHTML += id + '・' + teacher + '・' + parseInt(credit) + '學分';
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

$(document).ready(function(){
    generateTable() ;
    loadJSON() ;
    searchCourse(document.getElementById("search")) ;
}) ;
