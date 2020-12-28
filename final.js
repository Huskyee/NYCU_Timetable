"use strict";

const year = 109
const semester = 2
var course_data = {}
var name = []

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

function search(input) {
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

function autocomplete(inp, course_data) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;        
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("div");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        var result_container = document.getElementById("search_result") ;
        result_container.appendChild(a);
        var search_result = search(val) ;
        search_result.sort(function(a, b){
            return a.id - b.id ;
        }) ;
        /*for each item in the array...*/
        for (i = 0; i < search_result.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            // var key = Object.keys(course_data)[i] ;
            var id = search_result[i]['id'] ;
            var num_limit = search_result[i]['num_limit'] ;
            var reg_num = search_result[i]['reg_num'] ;
            var name = search_result[i]['name'] ;
            console.log(name);
            var credit = search_result[i]['credit'] ;
            var hours = search_result[i]['hours'] ;
            var teacher = search_result[i]['teacher'] ;
            var time = search_result[i]['time'] ;
            var time_classroom = search_result[i]['time-classroom'] ;
            var english = search_result[i]['english'] ;
            var brief = search_result[i]['brief'] ;
            var memo = search_result[i]['memo'] ;
            var type = search_result[i]['type'] ;
            var badge = '<span class="badge badge-danger">' + type + '</span>'
            if(english)
            {
                badge += '&nbsp;<span class="badge badge-info">英文授課</span>' ;
            }
            for(let j=0; j<brief.length; j++)
            {
                if(brief[j] == ''){break ;}
                badge += '&nbsp;<span class="badge badge-secondary">' + brief[j] + '</span>' ;
            }
            // var start_pos = name.toUpperCase().search(val.toUpperCase()) ;
            /*create a DIV element for each matching element:*/
            b = document.createElement("div");
            b.setAttribute ("class", "list-group-item list-group-item-action");
            /*make the matching letters bold:*/
            b.innerHTML = name + '<br>' + badge + '<br>' + id + '・' + teacher + '・' + parseInt(credit) + '學分' ;
            // for(let j=0; j<name.length; j++)
            // {
            //     if(j == start_pos)
            //     {
            //         var bold_substr = "<strong>" + name.substr(j, val.length) + "</strong>";
            //         b.innerHTML += bold_substr ;
            //         j += val.length-1 ;
            //     }
            //     else
            //     {
            //         b.innerHTML += name.substr(j, 1) ;
            //     }
            // }
            // b.innerHTML = "<strong>" + arr[i].substr(start_pos, val.length) + "</strong>";
            // b.innerHTML += arr[i].substr(val.length);
            // /*insert a input field that will hold the current array item's value:*/
            // b.innerHTML += "<input type='hidden' value='" + name + "'>";
            // /*execute a function when someone clicks on the item value (DIV element):*/
            // b.addEventListener("click", function(e) {
            //     /*insert the value for the autocomplete text field:*/
            //     inp.value = this.getElementsByTagName("input")[0].value;
            //     /*close the list of autocompleted values,
            //     (or any other open lists of autocompleted values:*/
            //     closeAllLists();
            // });
            a.appendChild(b);
        }
    });
    /*execute a function presses a key on the keyboard:*/
    // inp.addEventListener("keydown", function(e) {
    //     var x = document.getElementById(this.id + "autocomplete-list");
    //     if (x) x = x.getElementsByTagName("div");
    //     if (e.keyCode == 40) {
    //         /*If the arrow DOWN key is pressed,
    //         increase the currentFocus variable:*/
    //         currentFocus++;
    //         console.log(currentFocus);
    //         /*and and make the current item more visible:*/
    //         addActive(x);
    //     } else if (e.keyCode == 38) { //up
    //         /*If the arrow UP key is pressed,
    //         decrease the currentFocus variable:*/
    //         currentFocus--;
    //         console.log(currentFocus);
    //         /*and and make the current item more visible:*/
    //         addActive(x);
    //     } else if (e.keyCode == 13) {
    //         /*If the ENTER key is pressed, prevent the form from being submitted,*/
    //         e.preventDefault();
    //         if (currentFocus > -1) {
    //         /*and simulate a click on the "active" item:*/
    //         if (x) x[currentFocus].click();
    //         }
    //     }
    // });
    // function addActive(x) {
    //     /*a function to classify an item as "active":*/
    //     if (!x) return false;
    //     /*start by removing the "active" class on all items:*/
    //     removeActive(x);
    //     if (currentFocus >= x.length) currentFocus = 0;
    //     if (currentFocus < 0) currentFocus = (x.length - 1);
    //     /*add class "autocomplete-active":*/
    //     x[currentFocus].classList.add("autocomplete-active");
    //     x[currentFocus].classList.add("bg-primary");
    //     x[currentFocus].classList.add("text-light");
    // }
    // function removeActive(x) {
    //     /*a function to remove the "active" class from all autocomplete items:*/
    //     for (var i = 0; i < x.length; i++) {
    //     x[i].classList.remove("autocomplete-active");
    //     x[i].classList.remove("bg-primary");
    //     x[i].classList.remove("text-light");
    //     }
    // }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                // result_container.removeChild(x[i]);
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    // document.addEventListener("click", function (e) {
    //     closeAllLists(e.target);
    // });
    }
  
/*An array containing all the country names in the world:*/
var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

function loadJSON()
{
    jQuery.ajaxSetup({async: false});
    $.get(`${year}-${semester}_data.json`,function(data,status){
        if(status != "success"){
            alert("Couldn't get course data!!");
        }
        course_data = data;
        // console.log(course_data);
    });
    jQuery.ajaxSetup({async: true});
}

$(document).ready(function(){
    generateTable() ;/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
    loadJSON() ;
    autocomplete(document.getElementById("search"), course_data) ;
}) ;
