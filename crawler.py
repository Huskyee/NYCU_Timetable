import json
import re
import requests

year = 110
semester = 2
acysem = str(year) + str(semester)
flang = "zh-tw"
headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36"}
dep_list = []
course_data = {}


# 擷取「上課時間及教室」之「時間」部分
def parse_time(tc):
    pattern = '[MTWRFSU][1-9yznabcd]+'
    tc_list = tc.split(',')
    time_list = []
    for item in tc_list:
        time = re.findall(pattern, item.split('-')[0])
        for t in time:
            for i in range(len(t)-1):
                time_list.append(t[0]+t[i+1])
    # print(time_list)
    return time_list

# 擷取「上課時間及教室」之「教室」部分
def parse_classroom(tc):
    tc_list = tc.split(',')
    classroom_list = []
    for item in tc_list:
        try:
            classroom = item.split('-')[1]
        except IndexError:
            classroom = ''
        classroom_list.append(classroom)
    # print(classroom_list)
    return classroom_list


def get_type():
    res = requests.get('https://timetable.nycu.edu.tw/?r=main/get_type', headers=headers)
    return res.json()


def get_category(ftype, flang, acysem):
    res = requests.post('https://timetable.nycu.edu.tw/?r=main/get_category', data={
        'ftype': ftype,
        'flang': flang,
        'acysem': acysem,
        'acysemend': acysem
    }, headers=headers)
    return res.json()


def get_college(fcategory, ftype, flang, acysem):
    res = requests.post('https://timetable.nycu.edu.tw/?r=main/get_college', data={
        'fcategory': fcategory,
        'ftype': ftype,
        'flang': flang,
        'acysem': acysem,
        'acysemend': acysem
    }, headers=headers)
    return res.json()


def get_dep(fcollege, fcategory, ftype, flang, acysem):
    res = requests.post('https://timetable.nycu.edu.tw/?r=main/get_dep', data={
        'fcollege': fcollege,
        'fcategory': fcategory,
        'ftype': ftype,
        'flang': flang,
        'acysem': acysem,
        'acysemend': acysem
    }, headers=headers)
    return res.json()


def get_cos(dep):
    url = "https://timetable.nycu.edu.tw/?r=main/get_cos_list"
    data = {"m_acy": year,          # 學年度(開始)
            "m_sem": semester,      # 學期別(開始)
            "m_acyend": year,       # 學年度(結束)
            "m_semend": semester,   # 學期別(結束)
            "m_dep_uid": dep,
            "m_group": "**",
            "m_grade": "**",
            "m_class": "**",
            "m_option": "**",
            "m_crsname": "**",
            "m_teaname": "**",
            "m_cos_id": "**",
            "m_cos_code": "**",
            "m_crstime": "**",
            "m_crsoutline": "**",
            "m_costype": "**",
            "m_selcampus": "**"}

    # 資料型態為 json
    r = requests.post(url, headers=headers, data=data)

    # requests.codes.ok = 200
    if r.status_code != requests.codes.ok:
        print("Data request error!")
        exit()

    # 將 json 轉換為 python 可處理之資料型態
    raw_data = json.loads(r.text)
    for dep_value in raw_data:
        language = raw_data[dep_value]["language"]
        for dep_content in raw_data[dep_value]:
            # if dep_content == "costype":
            #   pass

            # 課程資料在 dep_content 為 1 或 2 之物件裡
            if re.match("^[1-2]+$", dep_content) is None:
                continue
            for cos_id in raw_data[dep_value][dep_content]:
                # 避免加入重複課程
                if cos_id in course_data:
                    continue
                raw_cos_data = raw_data[dep_value][dep_content][cos_id]
                time_list = parse_time(raw_cos_data["cos_time"])
                classroom_list = parse_classroom(raw_cos_data["cos_time"])
                brief_code = list(raw_data[dep_value]["brief"][cos_id].keys())[0]
                brief = raw_data[dep_value]["brief"][cos_id][brief_code]['brief'].split(',')
                name = raw_cos_data["cos_cname"].replace("(英文授課)", '')
                name = name.replace("(英文班)", '')
                course_data[cos_id] = {
                    "id": raw_cos_data["cos_id"],                           # 當期課號
                    "num_limit": raw_cos_data["num_limit"],                 # 人數上限
                    "reg_num": raw_cos_data["reg_num"],                     # 修課人數
                    "name": name,                                           # 課程名稱
                    "credit": raw_cos_data["cos_credit"],                   # 學分
                    "hours": raw_cos_data["cos_hours"],                     # 時數
                    "teacher": raw_cos_data["teacher"],                     # 開課教師
                    "time": time_list,                                      # 上課時間
                    "classroom": classroom_list,                            # 上課教室
                    "time-classroom": raw_cos_data["cos_time"],             # 上課時間及教室
                    "english": language[cos_id]["授課語言代碼"] == "en-us",   # 英語授課
                    "brief": brief,                                         # 摘要
                    # "memo": raw_cos_data["memo"],                           # 說明
                    "type": raw_cos_data["cos_type"],                       # 選別
                }


types = get_type()
for i in range(len(types)):
    ftype = types[i]["uid"]
    print("type: " + types[i]["cname"])
    categories = get_category(ftype, flang, acysem)
    if types[i]["cname"] == "其他課程":
        print("    category: ")
        print("        college: ")
        for fcategory in categories.keys():
            print("            dep: " + categories[fcategory])
            if fcategory not in dep_list:
                dep_list.append(fcategory)
                get_cos(fcategory)
    else:
        for fcategory in categories.keys():
            try:
                print("    category: " + categories[fcategory])
            except:
                print("    category: ")
            colleges = get_college(fcategory, ftype, flang, acysem)
            if len(colleges):
                for fcollege in colleges.keys():
                    try:
                        print("        college: " + colleges[fcollege])
                    except:
                        print("        college: ")
                    deps = get_dep(fcollege, fcategory, ftype, flang, acysem)
                    if len(deps):
                        for fdep in deps.keys():
                            print("            dep: " + deps[fdep])
                            if fdep not in dep_list:
                                dep_list.append(fdep)
                                get_cos(fdep)
            else:
                fcollege = ""
                print("        college: ")
                deps = get_dep(fcollege, fcategory, ftype, flang, acysem)
                if len(deps):
                    for fdep in deps.keys():
                        print("            dep: " + deps[fdep])
                        if fdep not in dep_list:
                            dep_list.append(fdep)
                            get_cos(fdep)
    print("\n")


with open("course_data\\" + str(year) + '-' + str(semester) + "_data.json", "w") as f:
    f.write(json.dumps(course_data))
